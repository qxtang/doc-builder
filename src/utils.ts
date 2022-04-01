import { IConfig } from './types.d';
import { IDirTree } from './types';
import fs from 'fs-extra';
import path from 'path';
import markdownItInstance from './markdownItInstance';
import ejs from 'ejs';
import getTocHtmlByMd from './getTocHtmlByMd';

// 获取文件树
export const getDirTree = (params: { inputPath: string; outputPath: string; config: IConfig }): Array<IDirTree> => {
  const { inputPath, outputPath, config } = params;

  const fn = (dir: string) => {
    const res: Array<IDirTree> = [];
    const filenames = fs.readdirSync(dir);

    for (const filename of filenames) {
      const extname = path.extname(filename);
      const basename = filename.substring(0, filename.indexOf(extname));
      const relative_path = path.relative(inputPath, dir);
      const output_path = path.join(outputPath, relative_path);
      const id = path.join(relative_path, filename);
      const real_path = path.join(dir, filename);
      const stat = fs.lstatSync(real_path);
      const isDirectory = stat.isDirectory();
      const isFile = stat.isFile();
      const isStartsWithDot = filename.startsWith('.');

      const isIgnore = (config.ignore as Array<string>).some((item) => {
        return path.join(inputPath, item) === real_path;
      });

      if (isStartsWithDot || isIgnore) {
        continue;
      }

      if (['.md', '.markdown'].includes(extname) && isFile) {
        res.push({
          id,
          filename,
          basename,
          path: dir,
          relative_path,
          output_path,
        });
      } else if (isDirectory) {
        res.push({
          id,
          dirname: filename,
          filename: '',
          basename,
          path: dir,
          relative_path,
          output_path,
          children: fn(path.join(dir, filename)),
        });
      }
    }

    res.sort((a) => {
      if (a.children) {
        return -1;
      } else {
        return 1;
      }
    });

    return res;
  };

  let res = fn(inputPath);
  res = res.filter((i) => i.dirname !== 'resource');

  return res;
};

const getMenuHtmlByDirTree = (dirTree: Array<IDirTree>, config: IConfig): string => {
  return dirTree
    .map((item: IDirTree) => {
      const isDir = !!item.dirname;
      if (isDir) {
        return `
            <ul>
              <li id="${item.id}" class="dir">${item.dirname}</li>
              ${getMenuHtmlByDirTree(item.children || [], config)}
            </ul>
          `;
      } else {
        const href = `${config.root}/${item.relative_path ? item.relative_path + '/' : ''}${item.basename}.html`;

        return `<li id="${item.id}" class="children"><a href="${href}">${item.basename}</a></li>`;
      }
    })
    .join('');
};

// 根据文件树执行渲染
export const renderDirTree = async (params: { dirTree: Array<IDirTree>; config: IConfig; outputPath: string }) => {
  const { dirTree, config, outputPath } = params;
  const menuHtml = getMenuHtmlByDirTree(dirTree, config);

  const renderByFileInfoArr = (fileInfoArr: Array<IDirTree> = []) => {
    fileInfoArr.forEach((info: IDirTree) => {
      const isDir = !!info.dirname;

      if (!isDir) {
        const markdown = fs.readFileSync(path.join(info.path, info.filename), { encoding: 'utf-8' });
        const html = markdownItInstance.render(markdown);
        const tocHtml = getTocHtmlByMd(markdown);
        const basename = info.basename;
        const ejsData = {
          root: config.root,
          html: html,
          title: config.title,
          basename: basename === 'index' ? '' : basename,
          favicon: config.favicon,
          tocHtml,
          menuHtml,
        };

        ejs.renderFile(path.resolve(__dirname, 'ejs/tpl.ejs'), ejsData, function (err: Error | null, str: string) {
          if (err) {
            throw err;
          }
          const isPathExists = fs.pathExistsSync(info.output_path);
          if (!isPathExists) {
            fs.mkdirSync(info.output_path, { recursive: true });
          }
          fs.writeFileSync(path.join(info.output_path, `${basename}.html`), str, { encoding: 'utf-8' });
        });
      } else {
        renderByFileInfoArr(info.children);
      }
    });
  };

  const hasUserIndex: boolean = dirTree.some((i) => i.basename === 'index');

  if (!hasUserIndex) {
    dirTree.push({
      id: 'index.md',
      filename: 'default_index.md',
      basename: 'index',
      path: __dirname,
      relative_path: '',
      output_path: outputPath,
    });
  }

  renderByFileInfoArr(dirTree);
};

// 拷贝模板资源
export const copyTplResource = async (outputPath: string) => {
  fs.copySync(path.resolve(__dirname, 'resource'), path.join(outputPath, 'resource'));
};

// 拷贝用户的资源
export const copyUserResource = async (params: { resourcePath: string; outputPath: string; config: IConfig }) => {
  const { resourcePath, outputPath, config } = params;

  try {
    fs.copySync(resourcePath, path.join(outputPath, config.resource));
  } catch (e) {
    //
  }
};
