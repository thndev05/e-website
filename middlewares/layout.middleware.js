module.exports = (app) => {
  app.use((req, res, next) => {

    if (req.path.startsWith('/admin')) {
      res.locals.layout = 'admin';
    } else {
      res.locals.layout = 'client';
    }

    next();
  });
}