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
      return res.status(401).json({ success: false, message: 'Please login to continue' });
    }
};
