/**
 * @description 根据 markdown 生成 toc html
 */

// TODO any类型
const markdownToc = require('markdown-toc');

const getMinLevel = (headlineItems: any[]) => {
  return Math.min(...headlineItems.map((item) => item.lvl));
};

const addListItem = (lvl: number, content: string | null, slug: string | null, rootNode: any) => {
  const listItem = { lvl, content, slug, children: [], parent: rootNode };
  rootNode.children.push(listItem);
  return listItem;
};

const flatHeadlineItemsToNestedTree = (headlineItems: any) => {
  const toc: any = { lvl: getMinLevel(headlineItems) - 1, slug: null, content: null, children: [], parent: null };
  let currentRootNode = toc;
  let prevListItem = currentRootNode;

  headlineItems.forEach((headlineItem: any) => {
    if (headlineItem.lvl > prevListItem.lvl) {
      Array.from({ length: headlineItem.lvl - prevListItem.lvl }).forEach((_) => {
        currentRootNode = prevListItem;
        prevListItem = addListItem(headlineItem.lvl, null, null, currentRootNode);
      });
      prevListItem.content = headlineItem.content;
      prevListItem.slug = headlineItem.slug;
    } else if (headlineItem.lvl === prevListItem.lvl) {
      prevListItem = addListItem(headlineItem.lvl, headlineItem.content, headlineItem.slug, currentRootNode);
    } else if (headlineItem.lvl < prevListItem.lvl) {
      for (let i = 0; i < prevListItem.lvl - headlineItem.lvl; i++) {
        currentRootNode = currentRootNode.parent;
      }
      prevListItem = addListItem(headlineItem.lvl, headlineItem.content, headlineItem.slug, currentRootNode);
    }
  });

  return toc;
};

const tocItemToHtml = (tocItem: any) => {
  return (
    '<ul>' +
    tocItem.children
      .map((childItem: any) => {
        let li = '<li>';
        const anchor = childItem.slug;
        const text = childItem.content;

        li += (anchor ? `<a href="#${anchor}">${text}</a>` : text) || '';

        return li + (childItem.children.length > 0 ? tocItemToHtml(childItem) : '') + '</li>';
      })
      .join('') +
    '</ul>'
  );
};

const getTocHtmlByMd = (md: string): string => {
  const flatHeadlineItems = markdownToc(md).json;
  if (flatHeadlineItems.length === 0) {
    return '';
  }

  const nestedTree = flatHeadlineItemsToNestedTree(flatHeadlineItems);
  const html = tocItemToHtml(nestedTree);
  return html;
};

export default getTocHtmlByMd;
