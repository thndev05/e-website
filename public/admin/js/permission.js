// Permission
const tablePermissions = document.querySelector('[table-permissions]');
if (tablePermissions) {
  const buttonSubmit = document.querySelector('[button-submit-permissions]');

  buttonSubmit.onclick = () => {
    let permissions = [];

    const rows = tablePermissions.querySelectorAll('tr[data-name]');
    rows.forEach((row) => {
      const name = row.getAttribute('data-name');
      const inputs = row.querySelectorAll('input');

      if (name === 'id') {
        inputs.forEach((input) => {
          const id = input.value;

          permissions.push({
            id: id,
            permissions: []
          });
        });
      } else {
        inputs.forEach((input, index) => {
          const checked = input.checked;

          if (checked) {
            permissions[index].permissions.push(name);
          }
        });
      }
    });

    // Hiện SweetAlert2 xác nhận
    if (permissions.length > 0) {
      Swal.fire({
        title: 'Confirmation',
        text: 'Are you sure to change permissions?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, change!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          const formChangePermissions = document.querySelector('[form-change-permissions]');
          const inputPermissions = formChangePermissions.querySelector('input');

          inputPermissions.value = JSON.stringify(permissions);

          Swal.fire({
            title: 'Success!',
            text: 'Change permissions successfully.',
            icon: 'success',
            confirmButtonText: 'OK'
          });

          setTimeout(() => {
            formChangePermissions.submit();
          }, 1000);
        }
      });
    } else {
      Swal.fire({
        title: 'Info',
        text: 'Don\'t have permission to change.',
        icon: 'info',
        confirmButtonText: 'OK'
      });
    }
  };
}
// End Permissions


// Permissions data default
const dataDocuments = document.querySelector('[data-documents]');
if(dataDocuments) {
  const documents = JSON.parse(dataDocuments.getAttribute('data-documents'));
  const tablePermissions = document.querySelector('[table-permissions]');

  documents.forEach((document, index) => {
    const permissions = document.permissions;

    permissions.forEach((permission) => {
      const row = tablePermissions.querySelector(`[data-name=${permission}]`);

      const input = row.querySelectorAll('input')[index];
      input.setAttribute('checked', true);
    });
  })
}
// End Permissions data default