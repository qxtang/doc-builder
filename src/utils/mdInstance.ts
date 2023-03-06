import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import { slugifyFn } from './index';
import hljs from 'highlight.js';

const mdInstance = markdownIt({
  html: true,
  linkify: true,
  // 代码高亮
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (_) {
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
  .use(require('markdown-it-attrs'))
  .use(require('markdown-it-task-lists'))
  .use(require('markdown-it-footnote'))
  .use(require('markdown-it-imsize'))
  .use(require('markdown-it-image-figures'), { figcaption: true })
  .use(require('markdown-it-container'), 'info')
  .use(require('markdown-it-container'), 'note')
  .use(require('markdown-it-container'), 'tip')
  .use(require('markdown-it-container'), 'warning')
  .use(require('markdown-it-container'), 'danger');

// a 标签新窗口打开
const defaultRender =
  mdInstance.renderer.rules.link_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

mdInstance.renderer.rules.link_open = function (
  tokens,
  idx,
  options,
  env,
  self,
) {
  const targetIndex = tokens[idx].attrIndex('target');

  if (
    targetIndex < 0 &&
    !['header-anchor', 'current'].includes(String(tokens[idx].attrGet('class')))
  ) {
    tokens[idx].attrPush(['target', '_blank']);
  }

  return defaultRender(tokens, idx, options, env, self);
};

export default mdInstance;
