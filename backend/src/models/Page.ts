import mongoose, { Schema, Query } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// 组件 Schema 子文档
const ComponentSchemaSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    props: {
      type: Schema.Types.Mixed,
      default: {},
    },
    style: { type: Schema.Types.Mixed, default: {} },
    children: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    parentId: { type: String },
    // 网格位置 - 使用 row 和 col
    gridPosition: {
      row: { type: Number, default: 0 },
      col: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

// Settings 子文档
const SettingsSchema = new Schema(
  {
    title: { type: String },
    description: { type: String },
    background: { type: String, default: "#f0f2f5" },
    padding: { type: String, default: "24px" },
    gridSize: { type: Number, default: 60 },
  },
  { _id: false }
);

// Page Schema 定义
const PageSchema = new Schema(
  {
    id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // 使用 Object 类型存储嵌套 schema，避免 Mongoose 的严格模式问题
    schema: {
      type: {
        version: { type: String, default: "1.0" },
        components: {
          type: [ComponentSchemaSchema],
          default: [],
        },
        settings: {
          type: SettingsSchema,
          default: () => ({
            background: "#f0f2f5",
            padding: "24px",
            gridSize: 60,
          }),
        },
      },
      default: () => ({
        version: "1.0",
        components: [],
        settings: {
          background: "#f0f2f5",
          padding: "24px",
          gridSize: 60,
        },
      }),
    },
    isTemplate: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    // 允许存储未在 schema 中定义的字段
    strict: false,
    // 确保返回完整的对象
    toObject: {
      getters: true,
      virtuals: false,
      minimize: false,
    },
    toJSON: {
      getters: true,
      virtuals: false,
      minimize: false,
    },
  }
);

// 更新时自动更新 updatedAt - save 钩子
PageSchema.pre("save", function (next) {
  this.updatedAt = new Date();

});

// 更新时自动更新 updatedAt - findOneAndUpdate 钩子
// 注意：findOneAndUpdate 的 pre 钩子不需要 next 参数，直接修改 this 即可
PageSchema.pre("findOneAndUpdate", function () {
  this.set({ updatedAt: new Date() });
});

export const PageModel = mongoose.model("Page", PageSchema);
