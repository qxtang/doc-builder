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
        const parentTextEle = document.createElement('span');
        parentTextEle.innerText = info.dirname;
        parentTextEle.title = info.dirname;

        const parentEle = document.createElement('div');
        parentEle.className = 'parent expand';
        parentEle.id = info.id;
        parentTextEle.addEventListener('click', function () {
          parentEle.classList.toggle('expand');
        });

        parentEle.appendChild(parentTextEle);
        ele.appendChild(parentEle);

        insertMenuHtmlByFileInfoArr(info.children, parentEle);
      } else {
        const href = `${window.root}/${info.relative_path ? info.relative_path + '/' : ''}${info.basename}.html`;

        const childrenEle = document.createElement('a');
        childrenEle.className = 'children';
        childrenEle.innerText = info.basename;
        childrenEle.title = info.basename;
        childrenEle.id = info.id;
        childrenEle.href = href;

        const host = window.location.protocol + '//' + window.location.host;
        const url = decodeURIComponent(childrenEle.href);
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
          childrenEle.classList.add('active');
        }

        if (isLastVisit) {
          childrenEle.classList.add('last_visit');
        }

        ele.appendChild(childrenEle);
      }
    }
  };

  (function () {
    const menu = document.getElementById('menu');
    fetch(`${window.root}/dir_tree.json`)
      .then((res) => res.json())
      .then((data) => {
        // gen menu
        insertMenuHtmlByFileInfoArr(data, menu);

        // set last visit
        const path = decodeURIComponent(window.location.pathname);
        if (['/', '/index.html'].includes(path)) {
          return;
        }
        window.localStorage.setItem(LAST_VISIT_LOCALSTORAGE_KEY, path);
      });
  })();

  // mobile_menu
  (function () {
    const mobile_menu = document.getElementById('mobile_menu');
    const menu = document.getElementById('menu');
    mobile_menu.addEventListener('click', function () {
      menu.classList.toggle('show');
    });
  })();
});
