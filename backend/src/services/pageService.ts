// src/services/pageService.ts
import { PageModel } from "../models/Page.js";
import { PageData, PageSchema } from "../types/index.js";
import { Types } from "mongoose";

// 辅助函数：将 Mongoose 文档转换为 PageData
function toPageData(doc: any): PageData {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    _id: obj._id?.toString(), // 将 ObjectId 转为 string
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
      .select("id name updatedAt isPublished")
      .lean();

    return pages.map(toPageData);
  }

  // 获取单个页面
  static async getPage(id: string): Promise<PageData | null> {
    const page = await PageModel.findOne({ id }).lean();
    return page ? toPageData(page) : null;
  }

  // 更新页面 Schema - 修复：使用 returnDocument 代替 new
  static async updatePage(
    id: string,
    updates: Partial<PageData>
  ): Promise<PageData | null> {
    const page = await PageModel.findOneAndUpdate(
      { id },
      {
        ...updates,
        updatedAt: new Date(),
      },
      {
        returnDocument: "after", // 替代 new: true
        upsert: false,
      }
    ).lean();

    return page ? toPageData(page) : null;
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

    // 排除 MongoDB 生成的字段
    const { _id, id: oldId, createdAt, updatedAt, ...rest } = original;

    const newPage = new PageModel({
      ...rest,
      name: newName,
      isPublished: false,
    });

    await newPage.save();
    return toPageData(newPage);
  }
}
