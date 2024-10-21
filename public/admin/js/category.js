const buttonsDelete = document.querySelectorAll('[button-delete]');
if (buttonsDelete) {
  const formDeleteItem = document.querySelector('#form-delete-item');
  const path = formDeleteItem.getAttribute('data-path');


  buttonsDelete.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      const isConfirm = confirm('Bạn có chắc chắn muốn xoá sản phẩm này?');

      if (isConfirm) {
        const id = btn.getAttribute('data-id');

        const action = path + `/${id}?_method=DELETE`;

        formDeleteItem.action = action;

        formDeleteItem.submit();
      }
    });
  })
}

const buttonsChangeStatus = document.querySelectorAll('[button-change-status]');
if (buttonsChangeStatus) {
  const formChangeStatus = document.querySelector('#form-change-status');
  const path = formChangeStatus.getAttribute('data-path');

  buttonsChangeStatus.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      const id = btn.getAttribute('data-id');
      const status = btn.getAttribute('data-status');

      let changedStatus = status == 'active' ? 'inactive' : 'active';

      const action = path + `/${changedStatus}/${id}?_method=PATCH`;

      formChangeStatus.action = action;

      formChangeStatus.submit();
    })
  });
}