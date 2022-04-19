import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import { slugifyFn } from './index';
import hljs from 'highlight.js';

const mdInstance = markdownIt({
  html: true,
  linkify: true,
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
    permalink: markdownItAnchor.permalink.headerLink(),
  })
  .use(require('markdown-it-sub'))
  .use(require('markdown-it-sup'))
  .use(require('markdown-it-mark'))
  .use(require('markdown-it-attrs'));

const defaultRender =
  mdInstance.renderer.rules.link_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

// a 标签新窗口打开
mdInstance.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const targetIndex = tokens[idx].attrIndex('target');

  if (targetIndex < 0 && !['header-anchor', 'current'].includes(String(tokens[idx].attrGet('class')))) {
    tokens[idx].attrPush(['target', '_blank']);
  }

  return defaultRender(tokens, idx, options, env, self);
};

export default mdInstance;
