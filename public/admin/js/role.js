document.addEventListener('DOMContentLoaded', () => {
  const buttonsDelete = document.querySelectorAll('[button-delete]');
  if (buttonsDelete) {
    const formDeleteItem = document.querySelector('#form-delete-item');
    let path = '';
    if (formDeleteItem) {
      path = formDeleteItem.getAttribute('data-path');
    }

    buttonsDelete.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();

        // Show SweetAlert2 confirmation dialog
        Swal.fire({
          title: 'Are you sure?',
          text: "Do you really want to delete this item?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
          if (result.isConfirmed) {
            const id = btn.getAttribute('data-id');
            const action = path + `/${id}?_method=DELETE`;
            formDeleteItem.action = action;

            Swal.fire({
              title: 'Success!',
              text: 'Delete successfully',
              icon: 'success',
              confirmButtonText: 'OK'
            })

            setTimeout(() => {
              formDeleteItem.submit();

            }, 1000);
          }
        });
      });
    });
  }


  const buttonsChangeStatus = document.querySelectorAll('[button-change-status]');
  if (buttonsChangeStatus) {
    const formChangeStatus = document.querySelector('#form-change-status');
    let path = '';
    if (formChangeStatus) {
      path = formChangeStatus.getAttribute('data-path');
    }

    buttonsChangeStatus.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();

        const id = btn.getAttribute('data-id');
        const status = btn.getAttribute('data-status');
        let changedStatus = status === 'active' ? 'inactive' : 'active';

        // Show SweetAlert2 confirmation dialog
        Swal.fire({
          title: 'Change Status?',
          text: `Do you want to set this account to ${changedStatus}?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, change'
        }).then((result) => {
          if (result.isConfirmed) {
            const action = path + `/${changedStatus}/${id}?_method=PATCH`;
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
          }
        });
      });
    });
  }


  // Add SweetAlert for submit buttons
  const nameInput = document.querySelector('#name');
  const initialName = nameInput ? nameInput.value : null;

  function handleButtonClick(button, confirmText) {
    button.addEventListener('click', (event) => {
      event.preventDefault();

      if (nameInput.value || nameInput.value !== initialName) {
        Swal.fire({
          title: 'Confirm',
          text: confirmText,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, create account!',
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.isConfirmed) {
            const form = button.closest('form');
            form.submit();
          }
        });
      } else {
        Swal.fire({
          title: 'Invalid information',
          text: 'Please fill valid information.',
          icon: 'info',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  const buttonSubmit = document.querySelector('[button-create]');
  const buttonEdit = document.querySelector('[button-edit]');

  if (buttonSubmit) handleButtonClick(buttonSubmit, 'Are you sure you want to create this role?');
  if (buttonEdit) handleButtonClick(buttonEdit, 'Are you sure you want to update this role?');

})