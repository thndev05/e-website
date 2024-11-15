
// [GET] /contact
module.exports.index = (req, res) => {
    res.render('client/contact/index', {
        pageTitle: 'Contact',
        breadcrumbTitle: 'Contact',
        breadcrumb: 'Contact'
    });
}