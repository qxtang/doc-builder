import { slugifyFn } from './index';

/**
 * @description 根据 markdown 生成 toc html
 */
const markdownToc = require('markdown-toc');

interface Item {
  lvl: number;
  content: string | null;
  slug: string | null;
  children?: Array<Item>;
  parent: Item | null;
}

const getMinLevel = (headlineItems: Array<Item>) => {
  return Math.min(...headlineItems.map((item) => item.lvl));
};

const addListItem = (lvl: number, content: string | null, slug: string | null, rootNode: Item | null) => {
  const listItem = { lvl, content, slug, children: [], parent: rootNode };
  rootNode?.children?.push(listItem);
  return listItem;
};

const flatHeadlineItemsToNestedTree = (headlineItems: Array<Item>) => {
  const toc: Item = { lvl: getMinLevel(headlineItems) - 1, slug: null, content: null, children: [], parent: null };
  let currentRootNode: Item | null = toc;
  let prevListItem = currentRootNode;

  headlineItems.forEach((item) => {
    if (item.lvl > prevListItem.lvl) {
      Array.from({ length: item.lvl - prevListItem.lvl }).forEach((_) => {
        currentRootNode = prevListItem;
        prevListItem = addListItem(item.lvl, null, null, currentRootNode);
      });
      prevListItem.content = item.content;
      prevListItem.slug = item.slug;
    } else if (item.lvl === prevListItem.lvl) {
      prevListItem = addListItem(item.lvl, item.content, item.slug, currentRootNode);
    } else if (item.lvl < prevListItem.lvl) {
      for (let i = 0; i < prevListItem.lvl - item.lvl; i++) {
        currentRootNode = currentRootNode?.parent as any;
      }
      prevListItem = addListItem(item.lvl, item.content, item.slug, currentRootNode);
    }
  });

  return toc;
};

const tocItemToHtml = (tocItem: Item): string => {
  return (
    '<ul>' +
    tocItem?.children
      ?.map((childItem: Item) => {
        let li = `<li title=${childItem.content}>`;
        const anchor = childItem.slug;
        const text = childItem.content;

        li += (anchor ? `<a href="#${anchor}" data-anchor="#${anchor}">${text}</a>` : text) || '';

        return li + ((childItem?.children?.length as number) > 0 ? tocItemToHtml(childItem) : '') + '</li>';
      })
      .join('') +
    '</ul>'
  );
};

const getTocHtmlByMd = (md: string): string => {
  const flatHeadlineItems = markdownToc(md, {
    slugify: slugifyFn,
  }).json;

  if (flatHeadlineItems.length === 0) {
    return '';
  }

  const nestedTree = flatHeadlineItemsToNestedTree(flatHeadlineItems);
  const html = tocItemToHtml(nestedTree);
  return html;
};

export default getTocHtmlByMd;
