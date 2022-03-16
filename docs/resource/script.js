"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

document.addEventListener('DOMContentLoaded', function () {
  var LAST_VISIT_LOCALSTORAGE_KEY = '20220315210423_LAST_VISIT_LOCALSTORAGE_KEY';

  var insertMenuHtmlByFileInfoArr = function insertMenuHtmlByFileInfoArr() {
    var fileInfoArr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var ele = arguments.length > 1 ? arguments[1] : undefined;

    if (!ele) {
      return;
    }

    var _iterator = _createForOfIteratorHelper(fileInfoArr),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var info = _step.value;
        var isDir = !!info.dirname;

        if (info.basename === 'index') {
          continue;
        }

        if (isDir) {
          (function () {
            var parentTextEle = document.createElement('span');
            parentTextEle.innerText = info.dirname;
            parentTextEle.title = info.dirname;
            var parentEle = document.createElement('div');
            parentEle.className = 'parent expand';
            parentEle.id = info.id;
            parentTextEle.addEventListener('click', function () {
              parentEle.classList.toggle('expand');
            });
            parentEle.appendChild(parentTextEle);
            ele.appendChild(parentEle);
            insertMenuHtmlByFileInfoArr(info.children, parentEle);
          })();
        } else {
          (function () {
            var href = "".concat(window.root, "/").concat(info.relative_path ? info.relative_path + '/' : '').concat(info.basename, ".html");
            var childrenEle = document.createElement('a');
            childrenEle.className = 'children';
            childrenEle.innerText = info.basename;
            childrenEle.title = info.basename;
            childrenEle.id = info.id;
            childrenEle.href = href;
            var host = window.location.protocol + '//' + window.location.host;
            var url = decodeURIComponent(childrenEle.href);

            var _path = url.replace(host, '');

            var isActive = function () {
              var path = decodeURIComponent(window.location.pathname);
              return path === _path;
            }();

            var isLastVisit = function () {
              var lastVisit = window.localStorage.getItem(LAST_VISIT_LOCALSTORAGE_KEY);
              return lastVisit === _path;
            }();

            if (isActive) {
              childrenEle.classList.add('active');
            }

            if (isLastVisit) {
              childrenEle.classList.add('last_visit');
            }

            ele.appendChild(childrenEle);
          })();
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  };

  (function () {
    var menu = document.getElementById('menu');
    fetch("".concat(window.root, "/dir_tree.json")).then(function (res) {
      return res.json();
    }).then(function (data) {
      // gen menu
      insertMenuHtmlByFileInfoArr(data, menu); // set last visit

      var path = decodeURIComponent(window.location.pathname);

      if (['/', '/index.html'].includes(path)) {
        return;
      }

      window.localStorage.setItem(LAST_VISIT_LOCALSTORAGE_KEY, path);
    });
  })(); // mobile_menu


  (function () {
    var mobile_menu = document.getElementById('mobile_menu');
    var menu = document.getElementById('menu');
    mobile_menu.addEventListener('click', function () {
      menu.classList.toggle('show');
    });
  })();
});
