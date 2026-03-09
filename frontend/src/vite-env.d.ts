/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 声明 CSS 模块
declare module "ant-design-vue/dist/reset.css" {
  const content: any;
  export default content;
}

// 如果 reset.css 不存在，使用这个
declare module "ant-design-vue/dist/antd.css" {
  const content: any;
  export default content;
}

// 声明 less 模块
declare module "*.less" {
  const content: any;
  export default content;
}

// 声明 scss 模块
declare module "*.scss" {
  const content: any;
  export default content;
}
