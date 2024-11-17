document.addEventListener('DOMContentLoaded', () => {
    const wishlistButtons = document.querySelectorAll('.wishlist-btn');

  wishlistButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
      const productId = button.getAttribute('data-product-id');

      if (!productId) {
        console.error('ID does not exist!');
        return;
      }

      try {
        const response = await fetch('/wishlist/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId }),
        });

        const result = await response.json();
        console.log(result);

        if (result.success) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: result.message,
            showConfirmButton: false,
            timer: 1500
          });

          button.classList.toggle('isWishlist');
        } else {
          Swal.fire({
            icon: 'info',
            title: 'Warning',
            text: result.message,
            showConfirmButton: false,
            timer: 1500
          });
        }
      } catch (error) {
        console.log('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error has occurred, please try again!',
          showConfirmButton: false,
          timer: 1500
        });
      }
    });
  });
});