const Product = require('../../models/product.model');

module.exports.index = async (req, res) => {
    const { slug } = req.params;

    try {
        const product = await Product.findOne({ deleted: false, slug }).lean();

        if (!product) {
            res.render('error', { message: 'Product not found' });
            return;
        }

        console.log(getUniqueValues(product.variants, 'name'));

        const { name, variants } = product;
        res.render('client/product/index', {
            title: name,
            isHome: false,
            breadcrumbTitle: 'Our Shop',
            breadcrumb: 'shop details',
            product,
            names: getUniqueValues(variants, 'name'),
            colors: getUniqueValues(variants, 'color'),
            sizes: getUniqueValues(variants, 'size'),
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.render('error', { message: 'An unexpected error occurred' });
    }
};

function getUniqueValues(variants, key) {
    return [...new Set(variants.map(variant => variant[key]).filter(Boolean))].filter(key => {
        return key !== '';
    });
}
