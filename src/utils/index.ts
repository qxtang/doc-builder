import { IConfig } from '../types';
import { IDirTree } from '../types';
import fs from 'fs-extra';
import path from 'path';
import mdInstance from './mdInstance';
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

      const isIgnore = config.ignore.some((item) => {
        return path.join(inputPath, item) === real_path;
      });

      if (isStartsWithDot || isIgnore) {
        continue;
      }

      if (['.md', '.markdown'].includes(extname) && isFile) {
        const markdown = fs.readFileSync(path.join(dir, filename), { encoding: 'utf-8' });

        res.push({
          id,
          filename,
          basename,
          path: dir,
          relative_path,
          output_path,
          content: mdInstance
            .render(markdown)
            .replace(/<[^>]+>/g, '')
            .replace(/[\r\n]/g, ''),
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

// 根据文件树生成菜单 html
const getMenuHtmlByDirTree = (dirTree: Array<IDirTree>, config: IConfig): string => {
  let res = '';

  for (const item of dirTree) {
    if (item.basename === 'index') {
      continue;
    }

    const isDir = !!item.dirname;
    if (isDir) {
      res += `
            <ul class="parent expand">
              <li id="${item.id}" class="dir" title="${item.dirname}">
                <span>${item.dirname}</span>
                <div class="triangle"></div>
              </li>
              ${getMenuHtmlByDirTree(item.children || [], config)}
            </ul>
          `;
    } else {
      const href = `${config.root}/${item.relative_path ? item.relative_path + '/' : ''}${item.basename}.html`;

      res += `
          <li id="${item.id}" class="children" title="${item.basename}">
            <a href="${href}">${item.basename}</a>
          </li>
        `;
    }
  }

  return res;
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
        const html = mdInstance.render(markdown);
        const tocHtml = getTocHtmlByMd(markdown);
        const basename = info.basename;
        const ejsData = {
          root: config.root,
          html: html,
          title: config.title,
          basename: basename === 'index' ? '' : basename,
          tocHtml,
          menuHtml,
        };

        ejs.renderFile(path.resolve(__dirname, '../ejs/tpl.ejs'), ejsData, function (err: Error | null, str: string) {
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
      path: path.resolve(__dirname, '..'),
      relative_path: '',
      output_path: outputPath,
    });
  }

  renderByFileInfoArr(dirTree);
};

// 拷贝模板资源
export const copyTplResource = async (outputPath: string) => {
  fs.copySync(path.resolve(__dirname, '../resource'), path.join(outputPath, 'resource'));
};

// 生成文件树 json
export const genDirTreeJson = async (dirTree: Array<IDirTree>, outputPath: string) => {
  fs.writeFileSync(path.join(outputPath, 'dir_tree.json'), JSON.stringify(dirTree), { encoding: 'utf-8' });
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

// 通用 slugification function
export const slugifyFn = (str: string, opt?: any) => {
  const r = encodeURIComponent(String(str).trim().toLowerCase().replace(/\s+/g, '-'));
  if (opt) {
    if (opt.num === 0) {
      return r;
    }
    return r + '-' + opt.num;
  }
  return r;
};

// 生成默认 manifest.json
export const genManifest = (params: { config: IConfig; outputPath: string }) => {
  const { config, outputPath } = params;

  const res = {
    name: config.title,
    short_name: config.title,
    display: 'standalone',
    start_url: config.root,
    orientation: 'natural',
    icons: [
      {
        src: `${config.root}/resource/icons/128.png`,
        sizes: '128x128',
      },
      {
        src: `${config.root}/resource/icons/144.png`,
        sizes: '144x144',
      },
      {
        src: `${config.root}/resource/icons/192.png`,
        sizes: '192x192',
      },
      {
        src: `${config.root}/resource/icons/256.png`,
        sizes: '256x256',
      },
      {
        src: `${config.root}/resource/icons/512.png`,
        sizes: '512x512',
      },
    ],
  };

  fs.writeFileSync(path.join(outputPath, 'manifest.json'), JSON.stringify(res), { encoding: 'utf-8' });
};
