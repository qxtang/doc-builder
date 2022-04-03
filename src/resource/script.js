document.addEventListener('DOMContentLoaded', function () {
  // menu
  (function () {
    const dirs = $('#menu .dir');

    dirs.on('click', function () {
      const p = $(this).parent('.parent');
      p.toggleClass('open');
    });

    const links = $('#menu .children > a');
    const host = window.location.protocol + '//' + window.location.host;
    const path = decodeURIComponent(window.location.pathname);

    links.each(function () {
      const url = decodeURIComponent($(this).prop('href'));
      const _path = url.replace(host, '');
      const isActive = path === _path;

      if (isActive) {
        $(this).parent('.children').addClass('active');
      }
    });
  })();

  // menu drag
  (function () {
    const drager = $('#drager');
    const body = $('body');
    const menu = $('#menu');

    drager.mouseover(function (e) {
      $(this).css('cursor', 'e-resize');
    });

    drager.mousedown(function () {
      $(this).css('cursor', 'e-resize');
      body.mousemove(function (e) {
        const _x = e.pageX;

        if (_x < 245) {
          return;
        }

        menu.animate(
          {
            width: _x,
          },
          0
        );
      });
    });

    body.mouseup(function (e) {
      $(this).unbind('mousemove');
      $(this).css('cursor', 'default');
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

  // menu switcher
  (function () {
    const menu = $('#menu');
    const switcher = $('#drager > #switcher');

    switcher.on('click', function () {
      menu.removeAttr('style');
      menu.toggleClass('expand');
      $(this).toggleClass('expand');
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

  // toc active
  (function () {
    const fn = function () {
      const links = $('.table-of-contents a');
      links.each(function () {
        const anchor = $(this).data('anchor');
        const hash = window.location.hash;

        if (anchor === hash) {
          $(this).addClass('active');
        } else {
          $(this).removeClass('active');
        }
      });
    };

    fn();

    if ('onhashchange' in window) {
      window.onhashchange = fn;
    }
  })();
});
