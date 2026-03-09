import { Router } from "express";
import { PageService } from "../services/pageService.js";
import { componentMaterials } from "../data/materials.js";

const router = Router();

// 健康检查
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 获取组件物料库
router.get("/materials", (req, res) => {
  res.json({
    success: true,
    data: componentMaterials,
  });
});

// 按分类获取物料
router.get("/materials/:category", (req, res) => {
  const { category } = req.params;
  const filtered = componentMaterials.filter((m) => m.category === category);
  res.json({ success: true, data: filtered });
});

// 创建页面
router.post("/pages", async (req, res) => {
  try {
    const { name, isTemplate } = req.body;
    console.log("[POST /pages] Creating page:", { name, isTemplate });

    if (!name) {
      return res
        .status(400)
        .json({ success: false, error: "页面名称不能为空" });
    }

    const page = await PageService.createPage(name, isTemplate);
    console.log("[POST /pages] Created:", page.id);
    res.json({ success: true, data: page });
  } catch (error) {
    console.error("[POST /pages] Error:", error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// 获取页面列表
router.get("/pages", async (req, res) => {
  try {
    const { template } = req.query;
    console.log("[GET /pages] Listing pages, template:", template);

    const pages = await PageService.getPages(template === "true");
    console.log(`[GET /pages] Found ${pages.length} pages`);
    res.json({ success: true, data: pages });
  } catch (error) {
    console.error("[GET /pages] Error:", error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// 获取单个页面
router.get("/pages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("[GET /pages/:id] Fetching page:", id);

    const page = await PageService.getPage(id);
    console.log("[GET /pages/:id] Result:", page ? "found" : "not found");

    if (!page) {
      return res.status(404).json({ success: false, error: "页面不存在" });
    }

    // 详细打印 schema 内容
    console.log(
      "[GET /pages/:id] Schema:",
      JSON.stringify(page.schema, null, 2)
    );
    res.json({ success: true, data: page });
  } catch (error) {
    console.error("[GET /pages/:id] Error:", error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// 更新页面
router.put("/pages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, schema, isPublished } = req.body;

    console.log("\n[PUT /pages/:id] ====================");
    console.log("[PUT /pages/:id] Page ID:", id);
    console.log("[PUT /pages/:id] Name:", name);
    console.log(
      "[PUT /pages/:id] Schema components count:",
      schema?.components?.length || 0
    );
    console.log(
      "[PUT /pages/:id] Full schema:",
      JSON.stringify(schema, null, 2)
    );

    // 先检查页面是否存在
    const existingPage = await PageService.getPage(id);
    console.log(
      "[PUT /pages/:id] Existing page:",
      existingPage ? "found" : "NOT FOUND"
    );
    if (existingPage) {
      console.log(
        "[PUT /pages/:id] Current schema:",
        JSON.stringify(existingPage.schema, null, 2)
      );
    }

    const page = await PageService.updatePage(id, {
      name,
      schema,
      isPublished,
    });

    console.log("[PUT /pages/:id] Update result:", page ? "success" : "FAILED");

    if (!page) {
      console.error("[PUT /pages/:id] Page not found or update failed");
      return res
        .status(404)
        .json({ success: false, error: "页面不存在或更新失败" });
    }

    // 验证更新后的数据
    console.log(
      "[PUT /pages/:id] Updated schema:",
      JSON.stringify(page.schema, null, 2)
    );
    console.log("[PUT /pages/:id] ====================\n");

    res.json({ success: true, data: page });
  } catch (error) {
    console.error("[PUT /pages/:id] Error:", error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// 删除页面
router.delete("/pages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("[DELETE /pages/:id] Deleting page:", id);

    const success = await PageService.deletePage(id);
    console.log(
      "[DELETE /pages/:id] Result:",
      success ? "success" : "not found"
    );

    if (!success) {
      return res.status(404).json({ success: false, error: "页面不存在" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("[DELETE /pages/:id] Error:", error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// 发布页面
router.post("/pages/:id/publish", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("[POST /pages/:id/publish] Publishing page:", id);

    const page = await PageService.publishPage(id);
    console.log(
      "[POST /pages/:id/publish] Result:",
      page ? "success" : "not found"
    );

    if (!page) {
      return res.status(404).json({ success: false, error: "页面不存在" });
    }
    res.json({ success: true, data: page });
  } catch (error) {
    console.error("[POST /pages/:id/publish] Error:", error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// 复制页面
router.post("/pages/:id/duplicate", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    console.log(
      "[POST /pages/:id/duplicate] Duplicating page:",
      id,
      "new name:",
      name
    );

    const page = await PageService.duplicatePage(id, name);
    console.log(
      "[POST /pages/:id/duplicate] Result:",
      page ? "success" : "not found"
    );

    if (!page) {
      return res.status(404).json({ success: false, error: "页面不存在" });
    }
    res.json({ success: true, data: page });
  } catch (error) {
    console.error("[POST /pages/:id/duplicate] Error:", error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
