import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// 组件 Schema 子文档 - 添加 _id: false 防止生成多余 ID
const ComponentSchemaSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    props: {
      type: Schema.Types.Mixed,
      default: {},
      // 确保 props 内的任意对象都能存储
      set: function (v: any) {
        console.log(
          "[ComponentSchema] Setting props:",
          JSON.stringify(v, null, 2)
        );
        return v;
      },
    },
    style: { type: Schema.Types.Mixed, default: {} },
    children: {
      type: [Schema.Types.Mixed], // 递归结构，使用 Mixed 类型
      default: [],
    },
    parentId: { type: String },
  },
  { _id: false } // 关键：禁用子文档的 _id
);

// Settings 子文档
const SettingsSchema = new Schema(
  {
    title: { type: String },
    description: { type: String },
    background: { type: String, default: "#f0f2f5" },
    padding: { type: String, default: "24px" },
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
    // 关键修复：明确指定 schema 字段的结构
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
          }),
        },
      },
      default: () => ({
        version: "1.0",
        components: [],
        settings: {
          background: "#f0f2f5",
          padding: "24px",
        },
      }),
    },
    isTemplate: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    // 关键：确保 toObject 时包含所有字段
    toObject: {
      transform: function (doc, ret) {
        console.log("[toObject] Transforming:", JSON.stringify(ret, null, 2));
        return ret;
      },
      getters: true,
      virtuals: false,
      minimize: false, // 关键：不删除空对象
    },
    toJSON: {
      transform: function (doc, ret) {
        return ret;
      },
      getters: true,
      virtuals: false,
      minimize: false,
    },
  }
);

// 更新时自动更新 updatedAt
PageSchema.pre("save", function () {
  console.log(
    "[pre-save] Saving page, schema:",
    JSON.stringify(this.schema, null, 2)
  );
  this.set({ updatedAt: new Date() });
});

// 关键：post save 钩子验证数据
PageSchema.post("save", function (doc) {
  console.log(
    "[post-save] Saved page, schema in doc:",
    JSON.stringify(doc.schema, null, 2)
  );
});

export const PageModel = mongoose.model("Page", PageSchema);
