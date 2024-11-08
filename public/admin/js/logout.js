const logoutButton = document.querySelector("[button-logout]");

if (logoutButton) {
  logoutButton.addEventListener("click", function (e) {
    e.preventDefault();

    Swal.fire({
      title: "Are you sure to log out system?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Success!',
          text: 'Log out successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        })

        setTimeout(() => {
          window.location.href = logoutButton.getAttribute("href");
        }, 1000)
      }
    });
  });
}
