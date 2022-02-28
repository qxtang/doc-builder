document.addEventListener('DOMContentLoaded', function () {
  function getHtmlName() {
    const pathname = window.location.pathname;
    const lastIndex = pathname.lastIndexOf('/');
    const result = pathname.substring(lastIndex);
    return result;
  }

  (function () {
    const lastVisit = localStorage.getItem('last-visit');
    const menuItems = document.querySelectorAll('.menu > .item');
    const htmlName = getHtmlName();

    menuItems.forEach((item) => {
      if (`/${item.innerText}.html` === decodeURIComponent(lastVisit)) {
        item.classList.add('last-visit');
      }

      if (`/${item.innerText}.html` === decodeURIComponent(htmlName)) {
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
    const htmlName = getHtmlName();
    localStorage.setItem('last-visit', htmlName);
  })();
});
