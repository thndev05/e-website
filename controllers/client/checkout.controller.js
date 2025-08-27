// controllers/client/checkout.controller.js
const Coupon = require('../../models/coupon.model');
const User = require("../../models/user.model");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const Cart = require("../../models/cart.model");

const { startSession } = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const CartHelper = require('../../helpers/cart');

function generateTransactionID() {
  return 'ORD-' + uuidv4().split('-')[0];
}

module.exports.index = async (req, res, next) => {
  try {
    if (!res.locals.user) {
      throw new Error('Not logged in');
    }
    const { couponCode } = req.query;

    const cart = await CartHelper.getOrCreateCart(res.locals.user._id);

    if (!Array.isArray(cart.products) || cart.products.length === 0) {
      throw new Error("Cart is empty");
    }

    const user = await User.findOne({ _id: res.locals.user._id }).lean();

    let cartSubTotal = 0;
    for (const cartItem of cart.products) {
      const variant = cartItem.variant;

      cartItem.effectivePrice = getEffectivePrice(variant);
      cartItem.variantDescription = getVariantDescription(variant);

      let price = Number(cartItem.effectivePrice) * Number(cartItem.quantity);
      cartItem.totalPrice = price;
      cartSubTotal += price;
    }
    cart.cartSubTotal = cartSubTotal;

    let discount = 0;
    let alert;
    try {
      discount = await getCouponDiscount(res.locals.user._id, cart, couponCode);
    } catch (error) {
      alert = error.message;
      console.error(error);
    }

    res.render('client/checkout/index', {
      title: 'Checkout',
      isHome: false,
      breadcrumbTitle: 'Checkout',
      breadcrumb: 'Checkout',
      user: user,
      cart: cart,
      cartSubTotal: cartSubTotal,
      discount: discount,
      total: cartSubTotal - discount,
      couponCode: couponCode,
      alert: alert,
    });
  } catch (error) {
    console.error(error);
    res.redirectPage = "/";
    next(error);
  }
}

module.exports.process = async (req, res, next) => {
  const {
    fullName, phone, province, district, ward, street,
    notes, couponCode, paymentMethod
  } = req.body;

  const userId = res.locals.user._id;

  try {
    const cart = await CartHelper.getOrCreateCart(userId);

    if (!Array.isArray(cart.products) || cart.products.length === 0) {
      throw new Error("Cart is empty");
    }

    // Process cart items
    let cartSubTotal = 0;
    for (const cartItem of cart.products) {
      const variant = cartItem.variant;

      cartItem.unitPrice = getEffectivePrice(variant);
      cartItem.variantDescription = getVariantDescription(variant);

      const subtotal = Number(cartItem.unitPrice) * Number(cartItem.quantity);

      cartItem.subtotal = subtotal;

      cartSubTotal += subtotal;
    }

    // Handle coupon discount
    let discount = 0, coupon = null;
    try {
      discount = await getCouponDiscount(userId, cart, couponCode);
      if (discount > 0) {
        coupon = await Coupon.findOne({ code: couponCode });
        if (!coupon) throw new Error('Coupon not found.');
      }
    } catch (err) {
      // Nếu coupon không hợp lệ — ta có thể trả lỗi hoặc tiếp tục với discount = 0
      // Ở đây mình chọn trả lỗi để user biết (giữ hành vi cũ)
      throw err;
    }

    // Prepare order data
    const transactionID = generateTransactionID();
    const orderData = {
      userID: userId,
      products: cart.products,
      shippingInfo: { name: fullName, phone, province, district, ward, street },
      paymentMethod,
      subtotal: cartSubTotal,
      totalAmount: Math.ceil(cartSubTotal - discount),
      coupon: coupon ? coupon._id : null,
      notes,
      transactionID,
      isPaid: false,
      status: 'pending',
      createdAt: new Date()
    };

    // Start transaction (session)
    const session = await startSession();
    session.startTransaction();

    try {
      // Update coupon usage if applicable (atomic-ish)
      if (coupon) {
        // tăng timesUsed và tăng usageByUser nếu đã có user, nếu chưa có thì push mới
        const userHasUsage = coupon.usageByUser.some(u => u.userId.toString() === userId.toString());

        if (userHasUsage) {
          // increment timesUsed and user's uses
          await Coupon.updateOne(
            { _id: coupon._id, 'usageByUser.userId': userId },
            { $inc: { timesUsed: 1, 'usageByUser.$.uses': 1 } },
            { session }
          );
        } else {
          // increment timesUsed and push new usageByUser
          await Coupon.updateOne(
            { _id: coupon._id },
            { $inc: { timesUsed: 1 }, $push: { usageByUser: { userId, uses: 1 } } },
            { session }
          );
        }
      }

      // Update product stocks
      for (const cartItem of cart.products) {
        const product = await Product.findById(cartItem.product._id).session(session);
        if (!product) {
          throw new Error('Product not found: ' + cartItem.product._id);
        }
        const variant = product.variants.find(v => v.sku === cartItem.variantSKU);
        if (!variant) {
          throw new Error(`Variant not found for product ${product.name}`);
        }

        if (variant.stock < cartItem.quantity) {
          throw new Error(`Product ${product.name} (${variant.sku}) out of stock.`);
        }

        // giảm stock bằng $inc (atomic)
        await Product.updateOne(
          { _id: product._id, 'variants.sku': variant.sku },
          { $inc: { 'variants.$.stock': -cartItem.quantity } },
          { session }
        );
      }

      // Create order inside session
      const order = await new Order(orderData).save({ session });

      // Clear cart inside session
      await Cart.updateOne({ _id: cart._id }, { $set: { products: [] } }, { session });

      // Commit transaction
      await session.commitTransaction();
      await session.endSession();

      // After commit, redirect to QR or other page
      if ('online_banking' === paymentMethod) {
        // Redirect to your QR display route — that route will re-query order and render QR
        return res.redirect('/checkout/qr?transactionID=' + encodeURIComponent(order.transactionID));
      } else {
        return res.redirect('/user/purchase?status=all');
      }
    } catch (transactionError) {
      // Rollback transaction on error
      await session.abortTransaction();
      await session.endSession();

      throw transactionError;
    }
  } catch (error) {
    console.error(error);
    return res.render('client/checkout/index', {
      title: 'Checkout',
      isHome: false,
      breadcrumbTitle: 'Checkout',
      breadcrumb: 'Checkout',
      sweetAlert: {
        icon: 'error',
        title: 'Order Creation Failed',
        text: error.message,
        confirmButtonText: 'OK',
        redirectPage: "back"
      }
    });
  }
};

function getEffectivePrice(variant) {
  return variant.salePrice || variant.price;
}

function getVariantDescription(variant) {
  return [variant.name, variant.color, variant.size]
    .filter(Boolean)
    .join(" ")
    .trim();
}

async function getCouponDiscount(userId, cart, couponCode) {
  if (!couponCode || couponCode.length === 0) {
    return 0;
  }

  const coupon = await Coupon.findOne({ code: couponCode, deleted: false, isActive: true });
  if (!coupon) {
    throw new Error('Coupon not found.');
  }

  if (new Date() > coupon.expirationDate) {
    throw new Error('Coupon expired.');
  }

  if (coupon.maxUses && coupon.timesUsed >= (coupon.maxUses || Infinity)) {
    throw new Error('Coupon usage limit reached.')
  }

  const userUsage = coupon.usageByUser.find(
    (usage) => usage.userId.toString() === userId.toString()
  );

  if (userUsage && userUsage.uses >= (coupon.maxUsesPerUser || Infinity)) {
    throw new Error('You have reached the usage limit for this coupon.')
  }

  // compute subtotal robustly (use cart.cartSubTotal if set, else sum)
  let subtotal = 0;
  if (typeof cart.cartSubTotal === 'number') {
    subtotal = cart.cartSubTotal;
  } else if (typeof cart.subtotal === 'number') {
    subtotal = cart.subtotal;
  } else {
    for (const cartItem of cart.products || []) {
      const variant = cartItem.variant;
      const price = getEffectivePrice(variant);
      subtotal += Number(price) * Number(cartItem.quantity || 0);
    }
  }

  const { discountType, discountValue } = coupon;

  const discount = discountType === 'percentage'
    ? Math.ceil(subtotal * discountValue / 100)
    : discountValue;

  // không giảm quá subtotal
  return Math.min(subtotal, discount);
}

module.exports.getQR = async (req, res, next) => {
  try {
    const { transactionID } = req.query;

    const order = await Order.findOne({ transactionID: transactionID }).lean();
    if (!order) {
      throw new Error('Order not found!');
    }

    if (order.paymentMethod !== "online_banking") {
      throw new Error('Payment method must be "online_banking".');
    }

    if (order.isPaid === true) {
      throw new Error('Your order has already been paid.')
    }

    if (order.status !== 'pending') {
      throw new Error('Your order must be in "pending" state.');
    }

    // build Sepay QR url (use env for account & bank)
    const acc = encodeURIComponent(process.env.SEPAY_ACCOUNT || '2204059999');
    const bank = encodeURIComponent(process.env.SEPAY_BANK || 'MBBank');
    const base = process.env.SEPAY_QR_BASE || 'https://qr.sepay.vn/img';
    const amount = Number(order.totalAmount) || 0;
    
    // Convert ORD-abc123 to ORDabc123 for SePay QR
    const sepayTransactionID = transactionID.replace('ORD-', 'ORD');
    const des = encodeURIComponent(sepayTransactionID);

    const qrUrl = `${base}?acc=${acc}&bank=${bank}&amount=${amount}&des=${des}&template=compact`;

    res.render('client/checkout/qr', {
      title: 'QR Payment',
      isHome: false,
      breadcrumbTitle: 'QR Payment',
      breadcrumb: 'QR Payment',
      qrUrl,
      order
    });
  } catch (error) {
    console.error(error);
    res.redirectPage = "/user/purchase?status=all";
    next(error);
  }
}

// Webhook handler for SePay
module.exports.sepayWebhook = async (req, res) => {
  try {
    console.log('=== SePay Webhook Received ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));

    // payload sample: { id, gateway, transactionDate, accountNumber, content, transferType, transferAmount, referenceCode, ... }
    const payload = req.body || {};
    const { content, transferType, transferAmount, referenceCode, transactionDate, description } = payload;

    if (!content && !description) {
      console.warn('Sepay webhook missing content and description', payload);
      return res.status(400).json({ success: false, message: 'Missing content' });
    }

    // Extract transaction ID from content or description
    // Content format: "ORD56ad8fbe Ma giao dich Trace051047 Trace 051047"
    // We need to extract the transaction ID which starts with "ORD"
    const textToSearch = content || description || '';
    console.log('Text to search for transaction ID:', textToSearch);
    
    // Try multiple patterns to match transaction ID
    let transactionID = null;
    
    // Pattern 1: ORD followed by alphanumeric (no dash) - for SePay format
    let match = textToSearch.match(/(ORD[a-zA-Z0-9]{8})/);
    if (match) {
      // Convert to our internal format with dash
      transactionID = 'ORD-' + match[1].substring(3);
    } else {
      // Pattern 2: ORD- followed by alphanumeric - our internal format
      match = textToSearch.match(/(ORD-[a-zA-Z0-9]+)/);
      if (match) {
        transactionID = match[1];
      }
    }
    
    if (!transactionID) {
      console.warn('Sepay webhook no transaction ID found in:', textToSearch);
      return res.status(400).json({ success: false, message: 'No transaction ID found' });
    }

    console.log('Extracted transaction ID:', transactionID);

    // find order by transactionID
    const order = await Order.findOne({ transactionID: transactionID });
    if (!order) {
      console.warn('Sepay webhook order not found for transactionID:', transactionID);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    console.log('Found order:', {
      id: order._id,
      transactionID: order.transactionID,
      totalAmount: order.totalAmount,
      isPaid: order.isPaid,
      status: order.status
    });

    // idempotency: if already paid, return 200 success
    if (order.isPaid) {
      console.log('Order already paid');
      return res.json({ success: true, message: 'Order already paid' });
    }

    // only accept incoming transfers and amount >= expected
    if (transferType === 'in' && Number(transferAmount) >= Number(order.totalAmount)) {
      order.isPaid = true;
      order.status = 'confirmed'; // Change from 'paid' to 'confirmed'
      order.paymentReference = referenceCode || null;
      order.paidAt = transactionDate ? new Date(transactionDate) : new Date();
      await order.save();

      console.log('Order payment processed successfully:', {
        transactionID,
        amount: transferAmount,
        reference: referenceCode,
        newStatus: order.status
      });

      // Optional: send email notification, create invoice, update analytics...
      return res.json({ success: true, message: 'Payment processed successfully' });
    } else {
      console.warn('Sepay webhook payment mismatch', { 
        transferType, 
        transferAmount, 
        expected: order.totalAmount,
        transactionID 
      });
      return res.status(400).json({ success: false, message: 'Payment mismatch' });
    }
  } catch (err) {
    console.error('Sepay webhook error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

async function cancelOrderIfNotPaidAfterTimeout(orderId, timeout = 10 * 60 * 1000) {
  try {
    setTimeout(async () => {
      const order = await Order.findById(orderId);
      if (order && !order.isPaid && order.status === 'pending') {
        order.status = 'cancelled';
        await order.save();
        console.log(`Order ${orderId} has been cancelled due to non-payment.`);
      }
    }, timeout);
  } catch (error) {
    console.error(`Error cancelling order ${orderId}:`, error);
  }
}

// API endpoint để check payment status
module.exports.checkPaymentStatus = async (req, res) => {
  try {
    const { transactionID } = req.params;
    
    const order = await Order.findOne({ transactionID: transactionID }).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({
      success: true,
      data: {
        transactionID: order.transactionID,
        isPaid: order.isPaid,
        status: order.status,
        totalAmount: order.totalAmount,
        paymentReference: order.paymentReference,
        paidAt: order.paidAt,
        createdAt: order.createdAt
      }
    });
    
  } catch (error) {
    console.error('Check payment status error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

