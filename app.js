const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const handlebars = require('express-handlebars');

// const indexRouter = require('./routes/index');
// const usersRouter = require('./routes/users');

const adminRouter = require('./routes/admin');
const clientRouter = require('./routes/client');

const app = express();

// view engine setup
app.engine(
    'hbs',
    handlebars.engine({
        extname: '.hbs',
        defaultLayout: 'client'
    }),
);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use((req, res, next) => {
    if (req.path === '/admin') {
        res.locals.layout = 'admin'; // Layout admin.hbs
    } else {
        res.locals.layout = 'client'; // Layout client.hbs cho các trang khác
    }
    next();
});

app.use('/admin', adminRouter);
app.use('/', clientRouter);

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
