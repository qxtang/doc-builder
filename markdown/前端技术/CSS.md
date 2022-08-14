# CSS

# 层叠上下文

- z-index 属性值并不是在任何元素上都有效果。它仅在定位元素上有效果。（定义了 position 属性，且属性值为非 static 值的元素）
- 产生层叠上下文：设置 position 为非 static 值

# css3 新特性

- 选择器 nth-child
- 边框圆角
- 渐变色
- 颜色透明度
- 多列布局
- 弹性布局
- 过渡、动画
- flex
- 媒体查询

# 一行的时候居中，多行的时候左对齐

- 利用行内元素的特点，父元素 text-align: center，子元素设为行内元素，设置 text-align: left

# 怎么清除浮动

- clear:both;
- br 标签清浮动，br 标签存在一个属性：clear。这个属性能够清除浮动，在 br 标签中设置属性 clear，并赋值 all。即能清除掉浮动。

# CSS 选择器优先级

- !important
- 内联样式
- ID 选择器
- 类选择器/属性选择器/伪类选择器
- 元素选择器/关系选择器/伪元素选择器
- 通配符选择器

# BFC

- BFC 全称为块级格式化上下文
- BFC 提供了一个环境，HTML 元素在这个环境中按照一定规则进行布局
- 一个环境中的元素不会影响到其它环境中的布局
- 比如浮动元素会形成 BFC，浮动元素内部子元素的主要受该浮动元素影响，两个浮动元素之间是互不影响的
- 可以说 BFC 就是一个作用范围，把它理解成是一个独立的容器，并且这个容器里的布局与这个容器外毫不相干

## 触发 BFC 的条件

- 根元素或其它包含它的元素
- 浮动元素 (元素的 float 不是 none)
- 绝对定位元素 (元素具有 position 为 absolute 或 fixed)
- 内联块 (元素具有 display: inline-block)
- 表格单元格 (元素具有 display: table-cell，HTML 表格单元格默认属性)
- 表格标题 (元素具有 display: table-caption, HTML 表格标题默认属性)
- 具有 overflow 且值不是 visible 的块元素
- 弹性盒（flex 或 inline-flex）
- display: flow-root
- column-span: all

# 行级块级区别

- 块级可设置宽高，单独成行
- 行内元素设置宽高无效，宽高由内容撑起

# 盒模型

- 标准盒模型：高宽仅为内容
- 怪异盒模型：高宽包括内容+边框+内边距

# 水平居中

- 内行元素使用 text-align: center
- margin: auto
- 元素为绝对定位使用 left:0; right:0; margin: auto
- 使用 flex

# 垂直居中

- 单行文字使用 lineheight
- 使用 flex
- 绝对定位元素：bottom:0; top:0; margin:auto
- 绝对定位元素：top:50%; margin-top:-(元素高度一半)

# 各个单位区别 rem、em、vh、px

# 画一条 0.5px 的直线

```css
height: 1px;
transform: scale(0.5);
```

# link 与 @import 的区别

- link 功能较多，可以定义 RSS，定义 Rel 等作用，而@import 只能用于加载 css
- 当解析到 link 时，页面会同步加载所引的 css，而@import 所引用的 css 会等到页面加载完才被加载
- @import 需要 IE5 以上才能使用
- link 可以使用 js 动态引入，@import 不行

# 渐进增强和优雅降级

- 渐进增强：针对低版本浏览器进行构建页面，保证最基本的功能，然后再针对高级浏览器进行效果、交互等改进和追加功能达到更好的用户体验。
- 优雅降级：一开始就构建完整的功能，然后再针对低版本浏览器进行兼容。

# margin 重叠问题

- 兄弟级的垂直块之间，margin 这个属性上下边距，会发生重叠的情况，float 浮动或 display:inline-block
- 父子级的块之间，子级的上下 margin 会与父级上下 margin 重叠，父级加 overflow:hidden 或加 padding 或加 border，子级加 position:absolute

# 相邻盒子高度自动同步

- flex
- 不使用 flex 布局，使用 table 布局让左右两侧 div 元素高度一致：https://codepen.io/qxtang/pen/RwxdXqe
