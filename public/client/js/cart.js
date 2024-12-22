function getEffectivePrice(variant) {
    return variant.salePrice || variant.price;
}

function getFirstImage(images) {
    return Array.isArray(images) && images.length > 0 ? images[0] : '';
}

function getVariantDescription(variant) {
    return [variant.name, variant.color, variant.size]
        .filter(Boolean)
        .join(" ")
        .trim();
}

function createQuantitySelectorCell(parentElement, initialQuantity, productId, variantSKU) {
    const quantityCell = document.createElement("td");

    const quantityControlWrapper = document.createElement('div');
    quantityControlWrapper.classList.add('cart-plus-minus');

    const quantityInput = document.createElement('input');
    quantityInput.type = 'text';
    quantityInput.value = initialQuantity;

    quantityControlWrapper.appendChild(quantityInput);

    const decrementButton = document.createElement('div');
    decrementButton.className = "dec qtybutton";
    decrementButton.innerHTML = "-";

    const incrementButton = document.createElement('div');
    incrementButton.className = 'inc qtybutton';
    incrementButton.innerHTML = "+";

    quantityControlWrapper.appendChild(decrementButton);
    quantityControlWrapper.appendChild(incrementButton);

    const updateQuantity = function () {
        const button = $(this);
        const input = button.parent().find("input");
        const currentValue = parseFloat(input.val());
        const newValue = button.text() === "+" ? currentValue + 1 : Math.max(0, currentValue - 1);

        input.val(newValue);

        const quantity = Number(newValue);

        fetch("/cart/update", {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, variantSKU, quantity }),
        })
            .then(fetchAndRenderCart)
            .catch(console.error);
    };

    decrementButton.addEventListener("click", updateQuantity);
    incrementButton.addEventListener("click", updateQuantity);

    quantityCell.appendChild(quantityControlWrapper);
    parentElement.appendChild(quantityCell);
}

function renderCartItems(cart) {
    const cartTable = document.querySelector('.cart-table');
    cartTable.innerHTML = '';

    for (const cartItem of cart.products) {
        const product = cartItem.product;
        const variant = cartItem.variant;

        const productId = product._id;
        const variantSKU = variant.sku;

        const formattedUnitPrice = currencyUSD(getEffectivePrice(variant));

        const cartRow = document.createElement('tr');
        cartRow.innerHTML = `
            <td class="product-thumbnail">
                <a href="/product/${product.slug}">
                    <img src="${getFirstImage(product.images)}" alt="">
                </a>
            </td>
            <td class="product-name">
                <a href="/product/${product.slug}">${product.name}</a>
            </td>
            <td class="product-variant-description">${getVariantDescription(variant)}</td>
            <td class="product-price">
                <span class="amount">${formattedUnitPrice}</span>
            </td>
        `;

        createQuantitySelectorCell(cartRow, cartItem.quantity, productId, variantSKU);

        const formattedTotalPrice = currencyUSD(getEffectivePrice(variant) * cartItem.quantity);

        const subTotalCell = document.createElement('td');
        subTotalCell.classList.add('product-subtotal');
        subTotalCell.innerHTML = `<span class="amount">${formattedTotalPrice}</span>`;
        cartRow.append(subTotalCell);

        const removeCell = document.createElement('td');
        removeCell.classList.add('product-remove');

        const removeButton = document.createElement('a');
        removeButton.innerHTML = `<i class="fa fa-times"></i>`;
        removeButton.addEventListener('click', () => {
            fetch("/cart/remove", {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, variantSKU }),
            })
                .then(fetchAndRenderCart)
                .catch(console.error);
        });

        removeCell.appendChild(removeButton);
        cartRow.appendChild(removeCell);

        cartTable.appendChild(cartRow);
    }

    setCheckoutPrice(cart.subtotal, 0);

    applyCoupon(currentCoupon);

    renderMiniCart(cart);
}

function fetchAndRenderCart() {
    fetch("/cart/detail")
        .then(response => response.json())
        .then(renderCartItems)
        .catch(console.error);
}

function setCheckoutPrice(subtotal, discount) {
    const subTotalSpan = document.getElementById('subtotal-price');
    const discountSpan = document.getElementById('discount-price');
    const totalSpan = document.getElementById('total-price');

    subTotalSpan.textContent = currencyUSD(subtotal);
    discountSpan.textContent = currencyUSD(- discount);
    totalSpan.textContent = currencyUSD(subtotal - discount);
}

function applyCoupon(couponCode) {
    console.log("Applying code: " + couponCode);
    if (!couponCode || couponCode.trim() === '') {
        return;
    }

    fetch("/cart/apply-coupon", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode }),
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.success) {
                currentCoupon = couponCode;

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: "Coupon has been applied successfully.",
                    showConfirmButton: false,
                    timer: 1500
                });

                const {subtotal, discount} = data;
                setCheckoutPrice(subtotal, discount);

            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Warning',
                    text: data.message,
                    showConfirmButton: false,
                    timer: 2000
                });

                currentCoupon = null;
            }
        })
        .catch(error => {
            console.log('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error has occurred, please try again!',
                showConfirmButton: false,
                timer: 2000
            });

            currentCoupon = null;
        })
}

let currentCoupon;

const couponInput = document.getElementById("coupon_code");
couponInput.addEventListener('input', function (e) {
    e.target.value = e.target.value.toUpperCase();
});

document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderCart();

    const applyCouponBtn = document.querySelector('button[name="apply_coupon"]');
    applyCouponBtn.addEventListener("click", (event) => {
        event.preventDefault();
        applyCoupon(couponInput.value);
    });

    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.addEventListener("click", (event) => {
        event.preventDefault();

        if (currentCoupon && currentCoupon.length > 0) {
            window.location.href = "checkout/?couponCode=" + currentCoupon;
        } else {
            window.location.href = "checkout/";
        }
    });
});

function currencyUSD(value) {
    if (typeof value !== 'number') {
        value = parseFloat(value) || 0;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}