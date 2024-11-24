const Coupon = require('../../models/coupon.model');
const {prefixAdmin} = require("../../config/system");

module.exports.index = async (req, res) => {
    Coupon.find({ deleted: false }).lean().then(coupons => {
        res.render('admin/coupons/index', {
            pageTitle: 'Coupons Management',
            currentPage: 'coupons',
            coupons: coupons,
        });
    });
}

module.exports.create = async (req, res) => {
    res.render('admin/coupons/create', {
        pageTitle: 'Create Coupon',
        currentPage: 'coupons',
    });
}

module.exports.createPost = async (req, res) => {
    try {
        const {code, discountType, discountValue, minimumOrderValue, expirationDate, maxUses, maxUsesPerUser, isActive} = req.body;

        const newCoupon = new Coupon({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minimumOrderValue: minimumOrderValue || 0,
            expirationDate,
            maxUses: maxUses || null,
            maxUsesPerUser: maxUsesPerUser || null,
            isActive: isActive === 'true',
        });

        await newCoupon.save();

        res.redirect(`${prefixAdmin}/coupons`);
    } catch (error) {
        console.error('Error creating coupon:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Coupon code must be unique' });
        }
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
}

module.exports.delete = async (req, res) => {
    const id = req.params.id;

    await Coupon.updateOne({ _id: id}, { deleted: true }).lean();

    res.redirect('back');
}

module.exports.edit = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findById(id).lean();

        res.render('admin/coupons/edit', {
            pageTitle: 'Update Coupon',
            currentPage: 'coupons',
            coupon: coupon,
        });
    } catch (error) {
        console.error(error);
        res.redirect(`${prefixAdmin}/coupons`);
    }
}

module.exports.editPatch = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            code,
            discountType,
            discountValue,
            minimumOrderValue,
            expirationDate,
            maxUses,
            maxUsesPerUser,
            isActive,
        } = req.body;

        const coupon = await Coupon.findById(id);
        if (!coupon) {
            throw new Error("Coupon not found with id " + code);
        }

        coupon.discountType = discountType;
        coupon.discountValue = parseFloat(discountValue);
        coupon.minimumOrderValue = minimumOrderValue ? parseFloat(minimumOrderValue) : null;
        coupon.expirationDate = expirationDate ? new Date(expirationDate) : null;
        coupon.maxUses = maxUses ? parseInt(maxUses, 10) : null;
        coupon.maxUsesPerUser = maxUsesPerUser ? parseInt(maxUsesPerUser, 10) : null;
        coupon.isActive = isActive === 'true';

        await coupon.save();

        res.redirect(`${prefixAdmin}/coupons`);

    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports.changeStatus = async (req, res) => {
    const id = req.params.id;
    const status = req.params.status;

    await Coupon.updateOne({ _id: id }, { isActive: status });

    res.redirect('back');
}


