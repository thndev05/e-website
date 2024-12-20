const btnCancels = document.querySelectorAll('.btn-cancel');
if (btnCancels.length > 0) {
    btnCancels.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const orderId = btn.getAttribute('data-orderId');

            const confirmResult = await Swal.fire({
                title: 'Are you sure?',
                text: "Do you really want to cancel this order?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, cancel it!',
                cancelButtonText: 'No, keep it'
            });

            if (confirmResult.isConfirmed) {
                try {
                    const response = await fetch(`/user/purchase/cancel/${orderId}`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ orderId }),
                    });

                    const result = await response.json();

                    if (result.success) {
                        Swal.fire({
                          icon: 'success',
                          title: 'Success',
                          text: result.message,
                          showConfirmButton: false,
                          timer: 1500
                        });

                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
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
            } else {
                Swal.fire({
                  icon: 'info',
                  title: 'Cancelled',
                  text: 'Your order is safe!',
                  showConfirmButton: false,
                  timer: 1500
                });
            }
        });
    });
}
