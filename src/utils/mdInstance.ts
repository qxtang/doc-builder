import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import { slugifyFn } from './index';
import hljs from 'highlight.js';

const mdInstance = markdownIt({
  html: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {
        //
      }
    }

    return '';
  },
});

mdInstance
  .use(markdownItAnchor, {
    slugify: (s) => slugifyFn(s),
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: 'before',
      symbol:
        '<svg viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"></path></svg>',
    }),
  })
  .use(require('markdown-it-sub'))
  .use(require('markdown-it-sup'))
  .use(require('markdown-it-mark'));

const defaultRender =
  mdInstance.renderer.rules.link_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

// a 标签新窗口打开
mdInstance.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const targetIndex = tokens[idx].attrIndex('target');

  if (targetIndex < 0 && tokens[idx].attrGet('class') !== 'header-anchor') {
    tokens[idx].attrPush(['target', '_blank']);
  }

  return defaultRender(tokens, idx, options, env, self);
};

export default mdInstance;
