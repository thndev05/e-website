// Sign up Form Validation

// First Name Validity
var fname = document.getElementById('firstname');
var lname = document.getElementById('lastname');
var email = document.getElementById('email');
var phone = document.getElementById('phone');
var district = document.getElementById('district');
var city = document.getElementById('city');
var zip = document.getElementById('zip');
var pass = document.getElementById('password');

fname.addEventListener('keyup', checkfnamevalidity);
lname.addEventListener('keyup', checklnamevalidity);
email.addEventListener('keyup', checkemailvalidity);
phone.addEventListener('keyup', checkphonevalidity);
district.addEventListener('keyup', checkdistrictvalidity);
city.addEventListener('keyup', checkcityvalidity);
zip.addEventListener('keyup', checkzipvalidity);
pass.addEventListener('keyup', checkpassvalidity);

function checkfnamevalidity(e) {
  var fnameval = fname.value;
  var validformat = /^[A-Z][a-z]{2,}$/;

  if (validformat.test(fnameval)) {
    fname.classList.add('is-valid');
    fname.classList.remove('is-invalid');
  } else {
    fname.classList.add('is-invalid');
    fname.classList.remove('is-valid');
  }
}
// Last Name Validity

function checklnamevalidity(e) {
  var lnameval = lname.value;
  var validformat = /^[A-Z][a-z]{2,}$/;

  if (validformat.test(lnameval)) {
    lname.classList.add('is-valid');
    lname.classList.remove('is-invalid');
  } else {
    lname.classList.add('is-invalid');
    lname.classList.remove('is-valid');
  }
}

// Email Validation

function checkemailvalidity(e) {
  var emailval = email.value;
  var validemail = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/;

  if (validemail.test(emailval)) {
    email.classList.add('is-valid');
    email.classList.remove('is-invalid');
  } else {
    email.classList.add('is-invalid');
    email.classList.remove('is-valid');
  }
}

// Phone Number Validation
// The numbers should start with a plus sign, followed by the country code and national number.

function checkphonevalidity(e) {
  var phoneval = phone.value;
  var validphone = /^\+(?:[0-9] ?){6,14}[0-9]$/;

  if (validphone.test(phoneval)) {
    phone.classList.add('is-valid');
    phone.classList.remove('is-invalid');
  } else {
    phone.classList.add('is-invalid');
    phone.classList.remove('is-valid');
  }
}

// District Validation

function checkdistrictvalidity(e) {
  var districtval = district.value;
  var districtformat = /^[A-Za-z]{3,}$/;

  if (districtformat.test(districtval)) {
    district.classList.add('is-valid');
    district.classList.remove('is-invalid');
  } else {
    district.classList.add('is-invalid');
    district.classList.remove('is-valid');
  }
}

// City Validation

function checkcityvalidity(e) {
  var cityval = city.value;
  var cityformat = /^[A-Za-z]{3,}$/;

  if (cityformat.test(cityval)) {
    city.classList.add('is-valid');
    city.classList.remove('is-invalid');
  } else {
    city.classList.add('is-invalid');
    city.classList.remove('is-valid');
  }
}

// Zip Validation

function checkzipvalidity(e) {
  var zipval = zip.value;
  var zipformat = /^[0-9]{4}$/;

  if (zipformat.test(zipval)) {
    zip.classList.add('is-valid');
    zip.classList.remove('is-invalid');
  } else {
    zip.classList.add('is-invalid');
    zip.classList.remove('is-valid');
  }
}

// Password Validation
// Minimum 8 characters max 32 chars at least 1 Uppercase Alphabet, 1 Lowercase Alphabet, 1 Number and 1 Special Character:

function checkpassvalidity(e) {
  var passval = pass.value;
  var passformat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@#!%*?&])[A-Za-z\d$@$!%*?&]{8,16}$/;

  if (passformat.test(passval)) {
    pass.classList.add('is-valid');
    pass.classList.remove('is-invalid');
  } else {
    pass.classList.add('is-invalid');
    pass.classList.remove('is-valid');
  }
}

// var form = document.getElementById('form');

// form.addEventListener('submit', (e) => {
//     e.preventDefault();
// });

function validation() {
  var firstnameval = fname.value;
  var lastnameval = lname.value;
  var emailvalue = email.value;
  var phonevalue = phone.value;
  var districtvalue = district.value;
  var cityvalue = city.value;
  var zipvalue = zip.value;
  var passvalue = pass.value;

  if (firstnameval == '') {
    fname.classList.add('is-invalid');
    return false;
  }
  if (lastnameval == '') {
    lname.classList.add('is-invalid');
    return false;
  }
  if (emailvalue == '') {
    email.classList.add('is-invalid');
    return false;
  }
  if (phonevalue == '') {
    phone.classList.add('is-invalid');
    return false;
  }
  if (districtvalue == '') {
    district.classList.add('is-invalid');
    return false;
  }
  if (cityvalue == '') {
    city.classList.add('is-invalid');
    return false;
  }
  if (zipvalue == '') {
    zip.classList.add('is-invalid');
    return false;
  }
  if (passvalue == '') {
    pass.classList.add('is-invalid');
    return false;
  }
}
