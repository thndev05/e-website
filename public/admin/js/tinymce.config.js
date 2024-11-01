tinymce.init({
  selector: 'textarea.textarea-mce',
  plugins: 'image wordcount fullscreen',
  file_picker_types: 'image',
  file_picker_callback: function(callback, value, meta) {
    if (meta.filetype === 'image') {
      var input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');

      input.onchange = function() {
        var file = this.files[0];
        var reader = new FileReader();

        reader.onload = function(e) {
          callback(e.target.result, {
            alt: file.name
          });
        };

        reader.readAsDataURL(file);
      };

      input.click();
    }
  },
  license_key: 'gpl'
});