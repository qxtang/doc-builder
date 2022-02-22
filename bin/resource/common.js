document.addEventListener('DOMContentLoaded', function () {
  const mobile_menu = document.getElementById('mobile_menu');
  const menu = document.getElementById('menu');
  mobile_menu.onclick = function () {
    menu.classList.toggle('show');
  };
});
