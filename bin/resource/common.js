document.addEventListener('DOMContentLoaded', function () {
  (function () {
    const lastVisit = localStorage.getItem('last-visit');
    const menuItems = document.querySelectorAll('.menu > .item');

    menuItems.forEach((item) => {
      if (`/${item.innerText}.html` === decodeURIComponent(lastVisit)) {
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
    const lastIndex = pathname.lastIndexOf('/');
    const result = pathname.substring(lastIndex);

    localStorage.setItem('last-visit', result);
  })();
});
