require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const handlebars = require('express-handlebars');

const app = express();
const port = process.env.PORT;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', handlebars.engine({extname: '.hbs'}));
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// public static
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.render('client/pages/index')
})

app.listen(port, () => {
  console.log(`app is listening on ${port}`);
})

module.exports = app;
