const selectionsChangeStatus = document.querySelectorAll('select.form-select');
if (selectionsChangeStatus.length > 0) {
    selectionsChangeStatus.forEach(button => {
        const currentValue = button.value;

        const formChangeStatus = document.querySelector('#form-change-status');
        let path = ''

        if (formChangeStatus) {
            path = formChangeStatus.getAttribute('data-path');
        }

        button.onchange = (e) => {
            const id = button.getAttribute('id');
            const status = button.value;

            Swal.fire({
                title: 'Change Status?',
                text: `Do you want to set this order to ${status}?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, change'
            }).then((result) => {
                if (result.isConfirmed) {
                    const action = path + `/${status}/${id}/?_method=PATCH`;
                    formChangeStatus.action = action;

                    Swal.fire({
                        title: 'Success!',
                        text: 'Change status successfully',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    })

                    setTimeout(() => {
                        formChangeStatus.submit();
                    }, 1000);
                } else {
                    button.value = currentValue;
                }
            });

        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const toggleButtons = document.querySelectorAll('.toggle-details');

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const orderId = button.getAttribute('data-order-id');
            const detailsRow = document.getElementById(`details-${orderId}`);
            const icon = button.querySelector('i');

            detailsRow.classList.toggle('d-none');

            if (detailsRow.classList.contains('d-none')) {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            } else {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
        });
    });
});

