const User = require("../../models/user.model");
module.exports.checkAuth = (req, res, next) => {
  res.locals.isAuthenticated = !!req.cookies.authToken;

  next();
};

module.exports.requireAuth = async (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        saveOriginalUrl(req);
        res.redirect('/auth/login');
        return;
    }

    const user = await User.findOne({ token: token }).select('-password').lean();
    if (!user) {
        saveOriginalUrl(req);
        res.redirect('/auth/login');
        return;
    }

    res.locals.user = user;
    next();
};

function saveOriginalUrl(req) {
    const resourceRegex = /\.(css|js|map|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i
    const originalUrl = req.originalUrl;
    if (!resourceRegex.test(originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }

    if (req.query.returnTo) {
        req.session.returnTo = req.query.returnTo;
    }
}