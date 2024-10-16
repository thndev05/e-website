$('.owl-carousel').owlCarousel({
  stagePadding: 20,
  loop: true,
  margin: 10,
  nav: true,
  responsive: {
    0: {
      items: 1,
    },
    576: {
      items: 2,
    },
    768: {
      items: 3,
    },
    992: {
      items: 4,
    },
  },
});

$('.more').showMoreItems({
  startNum: 4,
  afterNum: 4,
  moreText: 'Show more',
  noMoreText: 'No more',
  responsive: [
    {
      breakpoint: 1280,
      settings: {
        startNum: 4,
        afterNum: 4,
      },
    },
    {
      breakpoint: 576,
      settings: {
        startNum: 3,
        afterNum: 3,
      },
    },
  ],
});

// Data Table Js
$(document).ready(function () {
  $('#allproduct').DataTable();
  $('#allorders').DataTable();
  $('#recentorders').DataTable();
  $('#delproduct').DataTable();
});

// Cart Page Javascript
var decrease = document.getElementById('decrease');
var increase = document.getElementById('increase');
var itmval = document.getElementById('quantity');

decrease.addEventListener('click', decrease_qun);
increase.addEventListener('click', increase_qun);

function decrease_qun() {
  if (itmval.value <= 0) {
    itmval.value = 0;
  } else {
    itmval.value = parseInt(itmval.value) - 1;
    itmval.style.background = '#fff';
    itmval.style.color = '#000';
  }
}
function increase_qun() {
  if (itmval.value >= 5) {
    itmval.value = 5;
    alert('max 5 allowed');
    itmval.style.background = 'red';
    itmval.style.color = '#fff';
  } else {
    itmval.value = parseInt(itmval.value) + 1;
  }
}
