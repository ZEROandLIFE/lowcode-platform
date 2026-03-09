import { Types } from "mongoose";
// 组件属性配置项
export interface PropConfig {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "select" | "color" | "textarea";
  options?: string[]; // select 类型用
  defaultValue?: any;
  required?: boolean;
}

// 组件元数据（物料）
export interface ComponentMaterial {
  type: string;
  name: string;
  icon: string;
  category: "basic" | "form" | "layout" | "advanced";
  description?: string;
  defaultProps: Record<string, any>;
  propsConfig: PropConfig[];
  isContainer?: boolean;
  maxChildren?: number;
}

// Schema 节点
export interface ComponentSchema {
  id: string;
  type: string;
  props: Record<string, any>;
  style?: Record<string, string>;
  children?: ComponentSchema[];
  parentId?: string;
}

// 页面 Schema
export interface PageSchema {
  version: string;
  components: ComponentSchema[];
  settings?: {
    title?: string;
    description?: string;
    background?: string;
    padding?: string;
  };
}

// 页面数据
export interface PageData {
  _id?: Types.ObjectId;
  id: string;
  name: string;
  schema: PageSchema;
  createdAt?: Date;
  updatedAt?: Date;
  isTemplate?: boolean;
  isPublished?: boolean;
}
