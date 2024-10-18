require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const handlebars = require('express-handlebars');
const handlebarsHelpers = require('./helpers/handlebars');
const layoutMiddleware = require('./middlewares/layout.middleware');
const systemConfig = require('./config/system');
const database = require('./config/database');
const methodOverride = require('method-override');

const adminRouter = require('./routes/admin/index.route');
const clientRouter = require('./routes/client/index.route');

const app = express();
database.connect();

// Method-override
app.use(methodOverride('_method'));

// view engine setup
app.engine(
    'hbs',
    handlebars.engine({
        extname: '.hbs',
        helpers: handlebarsHelpers
    }),
);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// app.use(logger('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware set layout
layoutMiddleware(app);

// Set routes
adminRouter(app);
clientRouter(app);

// locals variables
app.locals.prefixAdmin = systemConfig.prefixAdmin;

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
