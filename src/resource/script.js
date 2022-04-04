document.addEventListener('DOMContentLoaded', function () {
  const utils = {
    getQueryString: function (variable) {
      const query = window.location.search.substring(1);
      const vars = query.split('&');
      for (var i = 0; i < vars.length; i++) {
        const pair = vars[i].split('=');
        if (pair[0] == variable) {
          return decodeURIComponent(pair[1]);
        }
      }
      return false;
    },
  };

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

    drager.mouseover(function () {
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

    body.mouseup(function () {
      $(this).unbind('mousemove');
      $(this).css('cursor', 'default');
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

  // search_bar
  (function () {
    const input = $('#search_bar > input');
    const clear = $('#search_bar > #clear');
    let timer = null;

    const getSearchResult = (str) => {
      str = str.toLowerCase();
      const tree = window.__doc_builder_dirTree__ || [];
      const res = [];

      const fn = (arr) => {
        arr.forEach((info) => {
          const isDir = !!info.dirname;
          if (isDir) {
            fn(info.children);
          } else {
            const findInTitle = info.basename.toLowerCase().indexOf(str) !== -1;
            const findInContent = info.content.toLowerCase().indexOf(str) !== -1;

            if (findInTitle || findInContent) {
              res.push(info);
            }
          }
        });
      };

      fn(tree);
      return res;
    };

    const addHighlight = (str, keyword) => {
      const regExp = new RegExp(keyword, 'gi');
      const text = regExp.exec(str);
      return str.replace(regExp, '<mark class="keyword">' + (text?.[0] || keyword) + '</mark>');
    };

    const handleInputChange = (value) => {
      value = value.trim().toLowerCase();
      const res = getSearchResult(value);
      const showSearchResult = value.length !== 0;
      const showEmpty = res.length === 0;
      const wrapEle = $('#search_result');
      let html = '';

      if (value.length !== 0) {
        clear.show();
      } else {
        clear.hide();
      }

      if (showEmpty) {
        html = '<div class="empty">No Results!</div>';
      } else {
        html = res
          .map((info) => {
            const index = info.content.toLowerCase().indexOf(value);
            const summary = `...${info.content.substring(index, index + 30)}...`;
            const href = `${window.root}/${info.relative_path ? info.relative_path + '/' : ''}${
              info.basename
            }.html?search=${value}`;

            return `
              <a class="item" href="${href}">
                <div class="title">${addHighlight(info.basename, value)}</div>
                <div class="content">${addHighlight(summary, value)}</div>
              </a>
            `;
          })
          .join('');
      }

      if (showSearchResult) {
        wrapEle.html(html);
        wrapEle.show();
      } else {
        wrapEle.hide();
      }
    };

    input.bind('input propertychange', function (e) {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        handleInputChange(e.target.value);
      }, 500);
    });

    clear.on('click', function () {
      input.val('');
      handleInputChange('');
    });
  })();

  // keyword highlight
  (function () {
    const search = utils.getQueryString('search');

    if (search) {
      $('.content.markdown-body').mark(search, { className: 'keyword' });
    }
  })();

  // viewer
  (function () {
    $('.markdown-body img').viewer({
      title: false,
      toolbar: false,
      navbar: false,
    });
  })();
});
