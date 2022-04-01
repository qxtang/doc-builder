document.addEventListener('DOMContentLoaded', function () {
  const LAST_VISIT_LOCALSTORAGE_KEY = '20220315210423_LAST_VISIT_LOCALSTORAGE_KEY';

  // set last visit
  (function () {
    const path = decodeURIComponent(window.location.pathname);
    if ([`${window.root}/`, `${window.root}/index.html`, '/', '/index.html'].includes(path)) {
      return;
    }
    window.localStorage.setItem(LAST_VISIT_LOCALSTORAGE_KEY, path);
  })();

  // viewer
  (function () {
    $('.markdown-body img').viewer({
      title: false,
      toolbar: false,
      navbar: false,
    });
  })();

  // mobile_menu
  (function () {
    const mobile_menu = $('#mobile_menu');
    const menu = $('#menu');
    mobile_menu.on('click', function () {
      menu.toggleClass('show');
    });
  })();
});
