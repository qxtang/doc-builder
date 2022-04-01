document.addEventListener('DOMContentLoaded', function () {
  const LAST_VISIT_LOCALSTORAGE_KEY = '20220315210423_LAST_VISIT_LOCALSTORAGE_KEY';

  const insertMenuHtmlByFileInfoArr = (fileInfoArr = [], ele) => {
    if (!ele) {
      return;
    }

    for (let info of fileInfoArr) {
      const isDir = !!info.dirname;

      if (info.basename === 'index') {
        continue;
      }

      if (isDir) {
        const parentTextEle = $(`<span title="${info.dirname}">${info.dirname}</span>`);
        const parentEle = $(`<div class="parent expand" id="${info.id}"></div>`);

        parentTextEle.on('click', function () {
          parentEle.toggleClass('expand');
        });

        parentEle.append(parentTextEle);
        $(ele).append(parentEle);

        insertMenuHtmlByFileInfoArr(info.children, parentEle);
      } else {
        const href = `${window.root}/${info.relative_path ? info.relative_path + '/' : ''}${info.basename}.html`;
        const childrenEle = $(
          `<a id="${info.id}" href="${href}" class="children" title="${info.basename}">${info.basename}</a>`
        );

        const host = window.location.protocol + '//' + window.location.host;
        const url = decodeURIComponent(childrenEle.prop('href'));
        const _path = url.replace(host, '');

        const isActive = (function () {
          const path = decodeURIComponent(window.location.pathname);
          return path === _path;
        })();

        const isLastVisit = (function () {
          const lastVisit = window.localStorage.getItem(LAST_VISIT_LOCALSTORAGE_KEY);
          return lastVisit === _path;
        })();

        if (isActive) {
          childrenEle.addClass('active');
        }

        if (isLastVisit) {
          childrenEle.addClass('last_visit');
        }

        $(ele).append(childrenEle);
      }
    }
  };

  const insertAbout = (ele) => {
    const about = $(`<a href="${window.root}/" class="children about" title="关于">关于</a>`);

    const isActive = (function () {
      const path = decodeURIComponent(window.location.pathname);
      return [`${window.root}/`, `${window.root}/index.html`, '/', '/index.html'].includes(path);
    })();

    if (isActive) {
      about.addClass('active');
    }

    $(ele).append(about);
  };

  (function () {
    const menu = $('#menu');

    fetch(`${window.root}/dir_tree.json`)
      .then((res) => res.json())
      .then((data) => {
        // gen menu
        insertMenuHtmlByFileInfoArr(data, menu);
        insertAbout(menu);

        // set last visit
        const path = decodeURIComponent(window.location.pathname);
        if ([`${window.root}/`, `${window.root}/index.html`, '/', '/index.html'].includes(path)) {
          return;
        }
        window.localStorage.setItem(LAST_VISIT_LOCALSTORAGE_KEY, path);
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

  // TOC
  (function () {
    const toc = $('.table-of-contents:last');
    const content = $('.content.markdown-body');
    content.after(toc);
  })();
});
