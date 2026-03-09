# 低代码页面设计平台

基于 Vue 3 + TypeScript + Node.js + MongoDB 的低代码页面可视化设计平台。采用网格布局系统，支持拖拽式组件设计，可快速构建和发布页面。

## 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 下一代前端构建工具
- **Pinia** - Vue 3 状态管理库
- **Vue Router** - 官方路由管理器
- **Ant Design Vue** - 企业级 UI 组件库
- **Axios** - HTTP 客户端

### 后端
- **Node.js** - JavaScript 运行时
- **Express** - Web 应用框架
- **TypeScript** - 类型系统
- **Mongoose** - MongoDB 对象建模库
- **MongoDB** - NoSQL 数据库
- **CORS** - 跨域资源共享中间件

## 功能特性

### 网格布局系统
- 固定 12 列网格布局
- 每格 60px，支持响应式设计
- 组件可占据 4/6/12 格宽度（小/中/大）
- 组件高度支持 1-4 行（60px-240px）

### 组件库
| 组件   | 类型 | 特性                   |
| ------ | ---- | ---------------------- |
| Button | 基础 | 多种类型、尺寸、状态   |
| Text   | 基础 | 字体大小、对齐、加粗   |
| Image  | 基础 | 填充模式、自适应       |
| Input  | 表单 | 占位符、禁用状态       |
| Select | 表单 | 动态选项配置、多选模式 |
| Card   | 高级 | 标题、边框、悬浮效果   |
| Table  | 高级 | 动态列配置、分页       |

### 核心功能
- 🎨 **可视化设计器** - 拖拽式页面搭建
- 📐 **网格辅助线** - 精准对齐，可开关显示
- ↩️ **撤销/重做** - 操作历史管理
- 💾 **自动保存** - 页面数据持久化
- 👁️ **实时预览** - 设计效果即时查看
- 📱 **页面管理** - 增删改查、复制、发布

## 项目结构

```
lowcode-platform/
├── frontend/                    # 前端项目
│   ├── src/
│   │   ├── api/                # API 接口封装
│   │   │   └── index.ts
│   │   ├── components/         # 业务组件
│   │   │   ├── CanvasArea.vue      # 画布区域
│   │   │   ├── CanvasRenderer.vue  # 组件渲染器
│   │   │   ├── DesignerToolbar.vue # 设计器工具栏
│   │   │   ├── MaterialPanel.vue   # 物料面板
│   │   │   ├── PreviewRenderer.vue # 预览渲染器
│   │   │   └── PropsPanel.vue      # 属性面板
│   │   ├── router/            # 路由配置
│   │   │   └── index.ts
│   │   ├── stores/            # Pinia 状态管理
│   │   │   └── designer.ts
│   │   ├── types/             # TypeScript 类型定义
│   │   │   └── index.ts
│   │   ├── views/             # 页面视图
│   │   │   ├── Home.vue       # 首页（页面列表）
│   │   │   ├── Designer.vue   # 设计器页面
│   │   │   └── Preview.vue    # 预览页面
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                     # 后端项目
│   ├── src/
│   │   ├── data/              # 静态数据
│   │   │   └── materials.ts   # 组件物料定义
│   │   ├── models/            # 数据模型
│   │   │   └── Page.ts        # 页面模型
│   │   ├── routes/            # 路由处理器
│   │   │   └── index.ts       # API 路由
│   │   ├── services/          # 业务逻辑层
│   │   │   └── pageService.ts # 页面服务
│   │   ├── types/             # 类型定义
│   │   │   └── index.ts
│   │   └── index.ts           # 入口文件
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 快速开始

### 环境要求
- Node.js >= 16.x
- MongoDB >= 4.4

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd lowcode-platform

# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 配置环境变量

后端创建 `.env` 文件：

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/lowcode
```

### 启动服务

```bash
# 启动 MongoDB（本地）
mongod

# 启动后端服务（在 backend 目录）
npm run dev
# 或
npx ts-node src/index.ts

# 启动前端开发服务器（在 frontend 目录，新终端）
npm run dev
```

### 访问应用

- 前端页面：`http://localhost:5173`
- 后端 API：`http://localhost:3001`
- API 健康检查：`http://localhost:3001/api/health`

## 使用指南

### 创建页面
1. 访问首页，点击"新建页面"
2. 输入页面名称，进入设计器

### 设计页面
1. **添加组件**：从左侧物料面板拖拽组件到画布网格
2. **调整位置**：拖拽已放置的组件移动位置
3. **修改属性**：选中组件，在右侧面板调整宽度、高度和组件特性
4. **网格辅助**：使用顶部工具栏开关网格显示

### 组件配置
- **基础设置**：宽度（4/6/12格）、高度（1-4行）、网格位置
- **组件属性**：
  - Button：文本、类型、尺寸、危险样式、禁用状态
  - Text：内容、字体大小、对齐方式、加粗
  - Image：URL、替代文本、填充模式
  - Input：占位符、禁用状态
  - Select：选项列表（动态增删）、多选模式、禁用状态
  - Card：标题、边框、悬浮效果
  - Table：列配置（动态增删）、边框、分页

### 保存与发布
- **保存**：点击顶部"保存"按钮，自动保存到数据库
- **预览**：点击"预览"按钮，在新标签页查看效果
- **发布**：点击"发布"按钮，标记页面为已发布状态

## API 文档

### 页面管理

| 方法   | 路径                       | 描述           |
| ------ | -------------------------- | -------------- |
| GET    | `/api/health`              | 健康检查       |
| GET    | `/api/materials`           | 获取组件物料库 |
| POST   | `/api/pages`               | 创建页面       |
| GET    | `/api/pages`               | 获取页面列表   |
| GET    | `/api/pages/:id`           | 获取单个页面   |
| PUT    | `/api/pages/:id`           | 更新页面       |
| DELETE | `/api/pages/:id`           | 删除页面       |
| POST   | `/api/pages/:id/publish`   | 发布页面       |
| POST   | `/api/pages/:id/duplicate` | 复制页面       |

### 请求示例

**创建页面**
```http
POST /api/pages
Content-Type: application/json

{
  "name": "我的页面",
  "isTemplate": false
}
```

**更新页面 Schema**
```http
PUT /api/pages/:id
Content-Type: application/json

{
  "name": "更新后的名称",
  "schema": {
    "version": "1.0",
    "components": [
      {
        "id": "Button_abc123",
        "type": "Button",
        "props": {
          "text": "点击我",
          "type": "primary",
          "span": 4,
          "rowSpan": 1
        },
        "gridPosition": {
          "row": 0,
          "col": 0
        }
      }
    ],
    "settings": {
      "background": "#f0f2f5",
      "padding": "24px"
    }
  }
}
```

## 数据模型

### 页面 Schema (Page)
```typescript
{
  id: string;           // 唯一标识 (UUID)
  name: string;         // 页面名称
  schema: {
    version: string;    // 版本号
    components: ComponentSchema[];  // 组件列表
    settings: {
      title?: string;
      background?: string;
      padding?: string;
    };
  };
  isTemplate: boolean;  // 是否为模板
  isPublished: boolean; // 是否已发布
  createdAt: Date;
  updatedAt: Date;
}
```

### 组件 Schema (Component)
```typescript
{
  id: string;           // 组件唯一ID
  type: string;         // 组件类型
  props: {
    span: number;       // 宽度占几列 (4/6/12)
    rowSpan: number;    // 高度占几行 (1-4)
    // ... 组件特有属性
  };
  gridPosition: {
    row: number;        // 起始行 (0-based)
    col: number;        // 起始列 (0-based)
  };
  children?: ComponentSchema[];  // 子组件（容器类）
}
```

## 开发计划

- [ ] 更多组件类型（表单、图表、媒体）
- [ ] 组件嵌套拖拽
- [ ] 数据源绑定与动态渲染
- [ ] 页面模板市场
- [ ] 协作编辑功能
- [ ] 版本历史管理
- [ ] 导出静态页面

## 常见问题

### Q: 组件拖拽后位置重叠怎么办？
A: 系统会自动检测碰撞，如果目标位置已被占用，会提示"该位置已被占用"。调整位置或删除占用组件后再放置。

### Q: 如何调整组件高度？
A: 选中组件，在右侧"基础"标签页中选择高度（1-4行）。

### Q: 预览时样式与设计器不一致？
A: 确保组件的 `rowSpan` 属性已正确保存，预览页面会读取该值计算实际高度。



