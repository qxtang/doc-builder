document.addEventListener('DOMContentLoaded', function () {
  (function () {
    const lastVisit = localStorage.getItem('last-visit');
    const menuItems = document.querySelectorAll('.menu > .item');

    menuItems.forEach((item) => {
      console.log(item.innerText);
      if (`/${item.innerText}.html` === lastVisit) {
        item.classList.add('active');
      }
    });
  })();

  (function () {
    const mobile_menu = document.getElementById('mobile_menu');
    const menu = document.getElementById('menu');
    mobile_menu.onclick = function () {
      menu.classList.toggle('show');
    };
  })();

  (function () {
    const pathname = window.location.pathname;
    localStorage.setItem('last-visit', pathname);
  })();
});
