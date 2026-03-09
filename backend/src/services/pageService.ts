// src/services/pageService.ts
import { PageModel } from "../models/Page.js";
import { PageData, PageSchema } from "../types/index.js";

// 辅助函数：将 Mongoose 文档转换为 PageData
function toPageData(doc: any): PageData {
  if (!doc) return null as any;

  const obj = doc.toObject ? doc.toObject() : doc;

  // 确保 schema 结构完整
  const schema = obj.schema || {
    version: "1.0",
    components: [],
    settings: {
      background: "#f0f2f5",
      padding: "24px",
      gridSize: 60,
    },
  };

  // 确保每个组件都有 gridPosition
  if (schema.components && Array.isArray(schema.components)) {
    schema.components = schema.components.map((comp: any) => ({
      ...comp,
      gridPosition: comp.gridPosition || { row: 0, col: 0 },
      props: comp.props || {},
    }));
  }

  return {
    id: obj.id,
    name: obj.name,
    schema: schema,
    updatedAt: obj.updatedAt?.toISOString() || new Date().toISOString(),
    isPublished: obj.isPublished || false,
    isTemplate: obj.isTemplate || false,
    createdAt: obj.createdAt?.toISOString(),
  } as PageData;
}

export class PageService {
  // 创建页面
  static async createPage(name: string, isTemplate = false): Promise<PageData> {
    const emptySchema: PageSchema = {
      version: "1.0",
      components: [],
      settings: {
        title: name,
        background: "#f0f2f5",
        padding: "24px",
        gridSize: 60,
      },
    };

    const page = new PageModel({
      name,
      schema: emptySchema,
      isTemplate,
    });

    await page.save();
    return toPageData(page);
  }

  // 获取页面列表
  static async getPages(isTemplate = false): Promise<PageData[]> {
    const pages = await PageModel.find({ isTemplate })
      .sort({ updatedAt: -1 })
      .lean();

    return pages.map(toPageData);
  }

  // 获取单个页面
  static async getPage(id: string): Promise<PageData | null> {
    const page = await PageModel.findOne({ id }).lean();
    return page ? toPageData(page) : null;
  }

  // 更新页面
  static async updatePage(
    id: string,
    updates: Partial<PageData>
  ): Promise<PageData | null> {
    console.log("[PageService] Updating page:", id);
    console.log("[PageService] Updates:", JSON.stringify(updates, null, 2));

    // 先查找现有页面
    const existingPage = await PageModel.findOne({ id }).lean();
    if (!existingPage) {
      console.error("[PageService] Page not found:", id);
      return null;
    }

    // 合并更新
    const currentSchema = existingPage.schema || {
      version: "1.0",
      components: [],
      settings: {},
    };

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updates.name) {
      updateData.name = updates.name;
    }

    if (updates.schema) {
      // 确保 components 是数组
      const components =
        updates.schema.components || currentSchema.components || [];

      // 清理组件数据，确保可以正确存储
      const cleanComponents = components.map((comp: any) => ({
        id: comp.id,
        type: comp.type,
        props: comp.props || {},
        style: comp.style || {},
        children: comp.children || [],
        parentId: comp.parentId,
        gridPosition: comp.gridPosition || { row: 0, col: 0 },
      }));

      updateData.schema = {
        version: updates.schema.version || currentSchema.version || "1.0",
        components: cleanComponents,
        settings: {
          ...currentSchema.settings,
          ...updates.schema.settings,
        },
      };

      console.log("[PageService] Cleaned components:", cleanComponents.length);
    }

    // 使用 findOneAndUpdate 并设置 returnDocument: 'after'
    const page = await PageModel.findOneAndUpdate(
      { id },
      { $set: updateData },
      {
        returnDocument: "after",
        upsert: false,
        new: true, // 兼容旧版本
      }
    ).lean();

    if (!page) {
      console.error("[PageService] Update failed for page:", id);
      return null;
    }

    console.log(
      "[PageService] Update successful, components:",
      page.schema?.components?.length || 0
    );

    return toPageData(page);
  }

  // 删除页面
  static async deletePage(id: string): Promise<boolean> {
    const result = await PageModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  // 发布页面
  static async publishPage(id: string): Promise<PageData | null> {
    return this.updatePage(id, { isPublished: true });
  }

  // 复制页面
  static async duplicatePage(
    id: string,
    newName: string
  ): Promise<PageData | null> {
    const original = await this.getPage(id);
    if (!original) return null;

    // 创建新页面，复制 schema
    const newPage = await this.createPage(newName, false);

    // 更新新页面的 schema
    return this.updatePage(newPage.id, {
      schema: original.schema,
    });
  }
}
