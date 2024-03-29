Array.prototype.remove = function (val) {
  const index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};

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

  const LAST_VISIT_STORAGE_KEY = 'LAST_VISIT_KEY_FJHY3PHJ00';
  const COLLAPSE_STORAGE_KEY = 'COLLAPSE_KEY_IXIFMU64D7';

  const isMobile = Boolean(document.body.clientWidth < 900);
  const currPath = decodeURIComponent(window.location.pathname);
  const isIndex = [
    `${window.root}/`,
    `${window.root}/index.html`,
    '/',
    '/index.html',
  ].includes(currPath);
  const lastVisitPathInStore = window.localStorage.getItem(
    LAST_VISIT_STORAGE_KEY,
  );

  // navigate to last visit
  /*(function () {
    if (isIndex && lastVisitPathInStore) {
      fetch(lastVisitPathInStore)
        .then(res => {
          if (res.status === 200) {
            window.location.href = lastVisitPathInStore;
          } else {
            window.localStorage.removeItem(LAST_VISIT_STORAGE_KEY);
          }
        });
    }
  })();*/

  // menu
  (function () {
    const $dirs = $('#menu .dir');
    const $loading = $('#menu .loading');
    const $links = $('#menu .children > a');
    const host = window.location.protocol + '//' + window.location.host;

    const getCurrCollapseArr = function () {
      return JSON.parse(
        window.localStorage.getItem(COLLAPSE_STORAGE_KEY) || '[]',
      );
    };
    const currCollapseArr = getCurrCollapseArr();

    const toggleMenu = function (id) {
      const $parent = $(`#${id}`).parent('.parent');
      $parent.toggleClass('expand');
      const currCollapseArr = getCurrCollapseArr();

      const hasExpand = $parent.hasClass('expand');

      if (hasExpand) {
        currCollapseArr.remove(id);
      } else {
        currCollapseArr.push(id);
      }
      window.localStorage.setItem(
        COLLAPSE_STORAGE_KEY,
        JSON.stringify(currCollapseArr),
      );
    };

    const expandMenuById = function (id) {
      const $parents = $(`#${id}`).parents('.parent');
      $parents.each(function () {
        $(this).addClass('expand');
      });
    };

    const scrollToId = function (id) {
      if (!id) {
        return;
      }
      const ele = $(`#${id}`);
      if (ele.length > 0) {
        $('#menu').scrollTop(ele.offset().top - 100);
      }
    };

    // 设置 dir
    $dirs.each(function () {
      const id = $(this).attr('id');
      const $parent = $(this).parent('.parent');
      const $triangle = $(this).children('.triangle');
      const href = decodeURIComponent($(this).data('href'));

      if (currCollapseArr.includes(id)) {
        $parent.removeClass('expand');
      }

      if (href) {
        const _path = href.replace(host, '');
        const isActive = currPath === _path;

        if (isActive) {
          expandMenuById(id);
          scrollToId(id);
          $(this).addClass('active');
        }
      }

      // 跳转指引
      $(this).on('click', function () {
        if (href) {
          window.location.href = href;
        } else {
          toggleMenu(id);
        }
      });

      // 三角点击事件
      $triangle.on('click', function (event) {
        event.stopPropagation();
        toggleMenu(id);
      });
    });

    // 设置 links
    $links.each(function () {
      const href = decodeURIComponent($(this).prop('href'));
      const _path = href.replace(host, '');
      const isActive = currPath === _path;
      const isLastVisit = lastVisitPathInStore === _path;
      const $children = $(this).parent('.children');
      const id = $children.attr('id');

      if (isActive) {
        expandMenuById(id);
        scrollToId(id);
        $children.addClass('active');
      }

      if (isLastVisit) {
        $(this).addClass('last-visit');
      }
    });

    $loading.remove();
  })();

  // expand-all
  (function () {
    if (isMobile) {
      return;
    }

    const $expandAll = $('#expand-all');
    const $parents = $('#menu .parent');

    $expandAll.on('click', function () {
      $parents.addClass('expand');
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, '[]');
    });
  })();

  // collapse-all
  (function () {
    if (isMobile) {
      return;
    }

    const $collapseAll = $('#collapse-all');
    const $parents = $('#menu .parent');
    const $dirs = $('#menu .dir');
    const ids = $.map($dirs, function (item) {
      return $(item).attr('id');
    });

    $collapseAll.on('click', function () {
      $parents.removeClass('expand');
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(ids));
    });
  })();

  // menu drag
  (function () {
    if (isMobile) {
      return;
    }

    const $drager = $('#drager');
    const $body = $('body');
    const $menu = $('#menu');

    $drager.mouseover(function () {
      if ($menu.hasClass('expand')) {
        $(this).css('cursor', 'e-resize');
      } else {
        $(this).css('cursor', 'unset');
      }
    });

    $drager.mousedown(function () {
      if ($menu.hasClass('expand')) {
        $(this).css('cursor', 'e-resize');
      } else {
        $(this).css('cursor', 'unset');
      }
      $body.mousemove(function (e) {
        const _x = e.pageX;

        if (_x < 245) {
          return;
        }

        $menu.animate(
          {
            width: _x,
          },
          0,
        );
      });
    });

    $body.mouseup(function () {
      $(this).unbind('mousemove');
      $(this).css('cursor', 'default');
    });
  })();

  // menu switcher
  (function () {
    if (isMobile) {
      return;
    }

    const $menu = $('#menu');
    const $expandAll = $('#expand-all');
    const $collapseAll = $('#collapse-all');
    const $switcher = $('#drager > #switcher');

    $switcher.on('click', function () {
      $menu.removeAttr('style');
      $menu.toggleClass('expand');
      $expandAll.toggle();
      $collapseAll.toggle();
      $(this).toggleClass('expand');
    });
  })();

  // mobile_menu
  (function () {
    if (!isMobile) {
      return;
    }

    const $mobileMenu = $('#mobile_menu');
    const $menu = $('#menu');
    const $content = $('body > .content.markdown-body');
    $mobileMenu.on('click', function () {
      $menu.toggleClass('show');
    });

    $content.on('click', function () {
      $menu.removeClass('show');
    });
  })();

  // search_bar
  (function () {
    const $input = $('#search_bar > input');
    const $clear = $('#search_bar > #clear');
    let timer = null;

    const getSearchResult = (str) => {
      str = str.toLowerCase();
      const tree = window.__doc_builder_dir_tree__ || [];
      const res = [];

      const fn = (arr) => {
        arr.forEach((info) => {
          const isDir = !!info.dirname;
          if (isDir) {
            fn(info.children);
          } else {
            const findInTitle = info.basename.toLowerCase().indexOf(str) !== -1;
            const findInContent =
              info.content.toLowerCase().indexOf(str) !== -1;

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
      return str.replace(
        regExp,
        '<mark class="keyword">' + (text?.[0] || keyword) + '</mark>',
      );
    };

    const handleInputChange = (value) => {
      value = value.trim().toLowerCase();
      const res = getSearchResult(value);
      const showSearchResult = value.length !== 0;
      const showEmpty = res.length === 0;
      const $wrapEle = $('#search_result');
      let html = '';

      if (value.length !== 0) {
        $clear.show();
      } else {
        $clear.hide();
      }

      if (showEmpty) {
        html = '<div class="empty">No Results!</div>';
      } else {
        html = res
          .map((info) => {
            const index = info.content.toLowerCase().indexOf(value);
            const summary = `...${info.content.substring(
              index,
              index + 50,
            )}...`;
            const href = `${window.root}/${info.id}.html?search=${value}`;

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
        $wrapEle.html(html);
        $wrapEle.show();
      } else {
        $wrapEle.hide();
      }
    };

    $input.bind('input propertychange', function (e) {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        handleInputChange(e.target.value);
      }, 500);
    });

    $clear.on('click', function () {
      $input.val('');
      handleInputChange('');
    });

    // add search input hotkey
    document.addEventListener('keyup', (e) => {
      if (e.key === 's') {
        $input.trigger('focus');
      }
    });
  })();

  // keyword highlight
  (function () {
    const search = utils.getQueryString('search');

    if (search) {
      $('.content.markdown-body').mark(search, { className: 'keyword' });
    }
  })();

  // image viewer
  (function () {
    $('.markdown-body img').viewer({
      title: false,
      toolbar: false,
      navbar: false,
    });
  })();

  // back to top
  (function () {
    if (isMobile) {
      return;
    }

    const $btt = $('#btt');
    const $content = $('body > .content');

    $content.scroll(function () {
      if ($content.scrollTop() > 50) {
        $btt.fadeIn(200);
      } else {
        $btt.fadeOut(200);
      }
    });

    $btt.on('click', function () {
      $content.animate(
        {
          scrollTop: 0,
        },
        200,
      );
    });
  })();

  // navigate to hash
  (function () {
    const hash = window.location.hash.slice(1);
    const $content = $('body > .content.markdown-body');

    if (hash) {
      const ele = document.getElementById(hash);
      $content.scrollTop($(ele)?.offset()?.top || 0);
    }
  })();

  // set last visit
  (function () {
    if (isIndex) {
      return;
    }
    window.localStorage.setItem(LAST_VISIT_STORAGE_KEY, currPath);
  })();
});
