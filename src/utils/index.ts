import { IConfig, IEjsData } from '../types';
import { IDirTree } from '../types';
import fs from 'fs-extra';
import path from 'path';
import mdInstance from './mdInstance';
import ejs from 'ejs';
import getTocHtmlByMd from './getTocHtmlByMd';
import chalk from 'chalk';
import md5 from 'md5';

export const sleep = (t = 3000) => new Promise(resolve => setTimeout(resolve, t));

// 获取文件树
export const getDirTree = (params: { inputPath: string; config: IConfig }): Array<IDirTree> => {
  const { inputPath, config } = params;

  const fn = (dir: string) => {
    const res: Array<IDirTree> = [];
    const filenames = fs.readdirSync(dir);

    for (const filename of filenames) {
      const extname = path.extname(filename);
      const basename = filename.substring(0, filename.indexOf(extname));
      const realPath = path.join(dir, filename);
      const id = basename === 'index' ? 'index' : md5(realPath);
      const stat = fs.lstatSync(realPath);
      const isDirectory = stat.isDirectory();
      const isFile = stat.isFile();
      const isStartsWithDot = filename.startsWith('.');

      const isIgnore = config.ignore.some((item) => {
        return path.join(inputPath, item) === realPath;
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
          content: mdInstance
            .render(markdown)
            .replace(/<[^>]+>/g, '')
            .replace(/[\r\n]/g, '')
        });
      } else if (isDirectory) {
        res.push({
          id,
          dirname: filename,
          filename: '',
          basename,
          path: dir,
          children: fn(path.join(dir, filename))
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
      const href = `${config.root}/${item.id}.html`;

      res += `
          <li id="${item.id}" class="children" title="${item.basename}">
            <a href="${href}">${item.basename}</a>
          </li>
        `;
    }
  }

  return res;
};

// 根据文件树执行渲染 ejs 生成 html
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
        const ejsData: IEjsData = {
          root: config.root,
          html: html,
          title: config.title,
          basename: basename === 'index' ? '' : basename,
          tocHtml,
          menuHtml
        };

        ejs.renderFile(
          path.resolve(__dirname, '../ejs/tpl.ejs'),
          ejsData,
          function (err: Error | null, str: string) {
            if (err) {
              throw err;
            }

            fs.writeFileSync(
              path.join(outputPath, `${info.id}.html`),
              str,
              { encoding: 'utf-8' }
            );
          });
      } else {
        renderByFileInfoArr(info.children);
      }
    });
  };

  const hasUserIndex: boolean = dirTree.some((i) => i.basename === 'index');

  if (!hasUserIndex) {
    dirTree.push({
      id: 'index',
      filename: 'default_index.md',
      basename: 'index',
      path: path.resolve(__dirname, '..')
    });
  }

  renderByFileInfoArr(dirTree);
};

// 拷贝模板资源
export const copyTplResource = async (outputPath: string) => {
  fs.copySync(path.resolve(__dirname, '../resource'), path.join(outputPath, 'resource'));
};

// 禁用 github 的 jekyll
export const genNojekyllFile = async (outputPath: string) => {
  fs.writeFileSync(
    path.join(outputPath, '.nojekyll'),
    '',
    { encoding: 'utf-8' }
  );
};

// 生成文件树 json
export const genDirTreeJson = async (dirTree: Array<IDirTree>, outputPath: string) => {
  fs.writeFileSync(
    path.join(outputPath, 'dir_tree.json'),
    JSON.stringify(dirTree),
    { encoding: 'utf-8' }
  );
};

// 拷贝用户的资源
export const copyUserResource = async (params: { resourcePath: string; outputPath: string; config: IConfig }) => {
  const { resourcePath, outputPath, config } = params;

  try {
    fs.copySync(resourcePath, path.join(outputPath, config.resource));
  } catch (_) {
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

// 生成 manifest.json
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
        sizes: '128x128'
      },
      {
        src: `${config.root}/resource/icons/144.png`,
        sizes: '144x144'
      },
      {
        src: `${config.root}/resource/icons/192.png`,
        sizes: '192x192'
      },
      {
        src: `${config.root}/resource/icons/256.png`,
        sizes: '256x256'
      },
      {
        src: `${config.root}/resource/icons/512.png`,
        sizes: '512x512'
      }
    ]
  };

  fs.writeFileSync(path.join(outputPath, 'manifest.json'), JSON.stringify(res), { encoding: 'utf-8' });
};

export const printWelcomeInfo = (config: IConfig) => {
  console.log(chalk.blueBright(`
----------------- DOB BUILDER -----------------

your config: 

${JSON.stringify(config, null, 2)}

-----------------------------------------------
  `));
};