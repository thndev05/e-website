const buttonsDelete = document.querySelectorAll('[button-delete]');
if (buttonsDelete) {
  const formDeleteItem = document.querySelector('#form-delete-item');
  let path = ''

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

document.addEventListener('DOMContentLoaded', () => {
  // Add SweetAlert for the submit button
  const nameInput = document.querySelector('#name');
  const birthdateInput = document.querySelector('#birthdate');
  const emailInput = document.querySelector('#email');

  if (nameInput && emailInput && birthdateInput) {
    var initialName = nameInput.value;
    var initialEmail = emailInput.value;
    var initialBirthdate = birthdateInput.value;
  }

  const buttonSubmit = document.querySelector('[button-edit]');
  if(buttonSubmit) {
    buttonSubmit.addEventListener('click', (event) => {
      event.preventDefault();

      if (initialName !== '' || initialEmail !== '' || initialBirthdate !== '') {
        Swal.fire({
          title: 'Confirm',
          text: 'Are you sure you want to update this user?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, update account!',
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.isConfirmed) {
            const form = buttonSubmit.closest('form');
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
})