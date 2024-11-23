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