document.addEventListener('DOMContentLoaded', function () {
  // menu
  (function () {
    const dirs = $('.dir');
    dirs.on('click', function () {
      const p = $(this).parent('.parent');
      p.toggleClass('open');
    });

    const links = $('.children > a');
    const host = window.location.protocol + '//' + window.location.host;
    const path = decodeURIComponent(window.location.pathname);

    links.each(function () {
      const url = decodeURIComponent($(this).prop('href'));
      const _path = url.replace(host, '');
      const isActive = (path === _path);

      if (isActive) {
        $(this).parent('.children').addClass('active');
      }
    });
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
