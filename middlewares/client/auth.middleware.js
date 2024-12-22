module.exports.checkAuth = (req, res, next) => {
  if (req.session.user) {
    res.locals.user = req.session.user;
    res.locals.isAuthenticated = true;
  } else {
    res.locals.isAuthenticated = false;
  }

  next();
};

module.exports.requireAuth = (req, res, next) => {
    if (req.session.user) {
      next();
    } else {

        // Save original url
        const resourceRegex = /\.(css|js|map|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i
        const originalUrl = req.originalUrl;
        if (!resourceRegex.test(originalUrl)) {
            req.session.returnTo = req.originalUrl;
        }

        if (req.query.returnTo) {
            req.session.returnTo = req.query.returnTo;
        }

        res.redirect('/auth/login');
    }
};

