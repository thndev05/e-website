document.addEventListener('DOMContentLoaded', () => {
  const avatarInput = document.querySelector('#avatar');
  const avatarLabel = document.querySelector('#avatar-label');
  const previewContainer = document.querySelector('#image-preview-container');

  avatarInput.addEventListener('change', (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      avatarLabel.textContent = `${files.length} file(s) selected`;
    } else {
      avatarLabel.textContent = 'Choose files...';
    }

    previewContainer.innerHTML = "";
    files.forEach(file => {
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const col = document.createElement("div");
          col.classList.add("col-6", "col-md-4", "col-lg-3", "mb-3");

          const img = document.createElement("img");
          img.src = e.target.result;
          img.classList.add("img-fluid", "rounded");
          img.style.maxHeight = "150px";

          col.appendChild(img);
          previewContainer.appendChild(col);
        };
        reader.readAsDataURL(file);
      }
    })
  });

  // Add SweetAlert for the submit button
  const nameInput = document.querySelector('#name');
  const emailInput = document.querySelector('#email');
  const passwordInput = document.querySelector('#password');

  if (nameInput && emailInput && passwordInput) {
    var initialName = nameInput.value;
    var initialEmail = emailInput.value;
    var initialPassword = passwordInput.value;
  }

  const buttonSubmit = document.querySelector('[button-create]');
  if(buttonSubmit) {
    buttonSubmit.addEventListener('click', (event) => {
      event.preventDefault();

      const newName = nameInput.value !== initialName;
      const newEmail = emailInput.value !== initialEmail;
      const newPassword = passwordInput.value !== initialPassword;

      if (newName && newEmail && newPassword) {
        Swal.fire({
          title: 'Confirm',
          text: 'Are you sure you want to create this account?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, create account!',
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

});


