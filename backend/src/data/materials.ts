import { ComponentMaterial } from "../types/index.js";

// 三种固定宽度：4(1/3), 6(半宽), 12(全宽)
export const componentMaterials: ComponentMaterial[] = [
  // 基础组件 - 小尺寸 (4格)
  {
    type: "Button",
    name: "按钮",
    icon: "🔘",
    category: "basic",
    description: "点击触发操作的按钮",
    defaultProps: {
      text: "按钮",
      type: "primary",
      size: "middle",
      span: 4, // 固定占4格
      disabled: false,
      danger: false,
      rowSpan: 1,
    },
    propsConfig: [
      {
        key: "text",
        label: "按钮文本",
        type: "string",
        defaultValue: "按钮",
        required: true,
      },
      {
        key: "type",
        label: "按钮类型",
        type: "select",
        options: ["default", "primary", "dashed", "link", "text"],
        defaultValue: "primary",
      },
      {
        key: "size",
        label: "尺寸",
        type: "select",
        options: ["small", "middle", "large"],
        defaultValue: "middle",
      },
      {
        key: "danger",
        label: "危险样式",
        type: "boolean",
        defaultValue: false,
      },
      { key: "disabled", label: "禁用", type: "boolean", defaultValue: false },
    ],
  },
  {
    type: "Text",
    name: "文本",
    icon: "📝",
    category: "basic",
    description: "普通文本段落",
    defaultProps: {
      content: "这是一段文本",
      fontSize: "14px",
      color: "#000000",
      align: "left",
      fontWeight: "normal",
      span: 4,
      rowSpan: 1,
    },
    propsConfig: [
      {
        key: "content",
        label: "文本内容",
        type: "textarea",
        defaultValue: "这是一段文本",
        required: true,
      },
      {
        key: "fontSize",
        label: "字体大小",
        type: "select",
        options: ["12px", "14px", "16px", "18px", "20px", "24px"],
        defaultValue: "14px",
      },
      {
        key: "color",
        label: "文字颜色",
        type: "color",
        defaultValue: "#000000",
      },
      {
        key: "align",
        label: "对齐方式",
        type: "select",
        options: ["left", "center", "right"],
        defaultValue: "left",
      },
      {
        key: "fontWeight",
        label: "字重",
        type: "select",
        options: ["normal", "bold"],
        defaultValue: "normal",
      },
    ],
  },

  // 中等组件 - 中尺寸 (6格)
  {
    type: "Input",
    name: "输入框",
    icon: "⌨️",
    category: "form",
    description: "单行文本输入",
    defaultProps: {
      placeholder: "请输入内容",
      span: 6,
      disabled: false,
      rowSpan: 1,
    },
    propsConfig: [
      {
        key: "placeholder",
        label: "占位符",
        type: "string",
        defaultValue: "请输入内容",
      },
      { key: "disabled", label: "禁用", type: "boolean", defaultValue: false },
    ],
  },
  {
    type: "Select",
    name: "下拉选择",
    icon: "📋",
    category: "form",
    description: "下拉选择器",
    defaultProps: {
      placeholder: "请选择",
      span: 6,
      rowSpan: 1,
      options: ["选项1", "选项2", "选项3"],
    },
    propsConfig: [
      {
        key: "placeholder",
        label: "占位符",
        type: "string",
        defaultValue: "请选择",
      },
    ],
  },
  {
    type: "Image",
    name: "图片",
    icon: "🖼️",
    category: "basic",
    description: "图片展示组件",
    defaultProps: {
      src: "https://via.placeholder.com/400x200",
      alt: "图片",
      span: 6,
      rowSpan: 1,
      objectFit: "cover",
    },
    propsConfig: [
      {
        key: "src",
        label: "图片地址",
        type: "string",
        defaultValue: "https://via.placeholder.com/400x200",
        required: true,
      },
      { key: "alt", label: "替代文本", type: "string", defaultValue: "图片" },
      {
        key: "objectFit",
        label: "填充模式",
        type: "select",
        options: ["cover", "contain", "fill", "none"],
        defaultValue: "cover",
      },
    ],
  },

  // 大型组件 - 全宽 (12格)
  {
    type: "Card",
    name: "卡片",
    icon: "🃏",
    category: "advanced",
    description: "带标题的内容区域",
    isContainer: true,
    defaultProps: {
      title: "卡片标题",
      bordered: true,
      hoverable: false,
      rowSpan: 1,
      span: 12,
    },
    propsConfig: [
      { key: "title", label: "标题", type: "string", defaultValue: "卡片标题" },
      {
        key: "bordered",
        label: "显示边框",
        type: "boolean",
        defaultValue: true,
      },
      {
        key: "hoverable",
        label: "悬浮效果",
        type: "boolean",
        defaultValue: false,
      },
    ],
  },
  {
    type: "Table",
    name: "表格",
    icon: "📊",
    category: "advanced",
    description: "数据表格",
    defaultProps: {
      span: 12,
      bordered: true,
      rowSpan: 1,
      pagination: false,
    },
    propsConfig: [
      {
        key: "bordered",
        label: "显示边框",
        type: "boolean",
        defaultValue: true,
      },
      {
        key: "pagination",
        label: "分页",
        type: "boolean",
        defaultValue: false,
      },
    ],
  },
];
