const Product = require('../../models/product.model');
const Category = require('../../models/category.model');
const ProductHelpers = require("../../helpers/product");

module.exports.index = async (req, res) => {
    const { slug } = req.params;

    try {
        const products = await Product.find({deleted: false}).lean();
        for (const product of products) {
            product.minPrice = ProductHelpers.getMinPrice(product.variants);
            product.maxPrice = ProductHelpers.getMaxPrice(product.variants);
        }

        const product = products.find(product => product.slug === slug);

        if (!product) {
            res.render('error', { message: 'Product not found' });
            return;
        }

        const category = await Category.findById(product.category).lean();

        const { name, variants } = product;

        res.render('client/product/index', {
            title: name,
            isHome: false,
            breadcrumbTitle: 'Our Shop',
            breadcrumb: 'shop details',
            products,
            product,
            category: category,
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
