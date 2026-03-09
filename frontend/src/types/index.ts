// 与后端共享的类型定义
export interface PropConfig {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "select" | "color" | "textarea";
  options?: string[];
  defaultValue?: any;
  required?: boolean;
}

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

export interface ComponentSchema {
  id: string;
  type: string;
  props: Record<string, any>;
  style?: Record<string, string>;
  children?: ComponentSchema[];
  parentId?: string;
}

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

export interface PageData {
  id: string;
  name: string;
  schema: PageSchema;
  updatedAt: string;
  isPublished?: boolean;
}

// 设计器状态
export interface DesignerState {
  pageId: string | null;
  pageName: string;
  schema: PageSchema;
  selectedId: string | null;
  materials: ComponentMaterial[];
  history: PageSchema[];
  historyIndex: number;
  isDragging: boolean;
}
