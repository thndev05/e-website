require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const handlebars = require('express-handlebars');
const handlebarsHelpers = require('./helpers/handlebars');
const layoutMiddleware = require('./middlewares/layout.middleware');
const systemConfig = require('./config/system');
const database = require('./config/database');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');

const adminRouter = require('./routes/admin/index.route');
const clientRouter = require('./routes/client/index.route');

const onlineBakingValidator = require('./jobs/transactionHistoryChecker.js')
const FormError = require("./error/FormError");

const app = express();
database.connect();

// Method-override
app.use(methodOverride('_method'));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Session
app.use(
  session({
    secret: 'POWERGJOPSDFNFWPOWREO',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: false,
      httpOnly: true,
    },
  })
);


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
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Tiny MCE
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

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
    if (!err instanceof FormError) {
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
    }

    // render the error page
    res.status(err.status || 500);

    res.render('error', {
        sweetAlert: {
            icon: 'error',
            title: 'Oops...',
            text: err.message,
            confirmButtonText: 'OK',
            redirectPage: (!err instanceof FormError && res.redirectPage ? res.redirectPage : 'back'),
            reloadPage: res.reloadPage,
        },
    });
    delete res.locals.redirectPage;
});

// Register timer jobs
setInterval(async () => {
    await onlineBakingValidator.check();
}, 30000);
onlineBakingValidator.check();

module.exports = app;
