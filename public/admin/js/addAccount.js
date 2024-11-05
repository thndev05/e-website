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

});

