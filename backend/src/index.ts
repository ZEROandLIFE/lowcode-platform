import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import routes from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/lowcode";

// 中间件
app.use(cors());
app.use(express.json({ limit: "50mb" })); // 增加限制以支持大的 schema

// 路由
app.use("/api", routes);

// 错误处理
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: "服务器内部错误" });
  }
);

// 连接 MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB 连接成功");
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
      console.log(`📦 网格布局系统已启用`);
      console.log(`   - 固定 12 列`);
      console.log(`   - 每格 60px`);
      console.log(`   - 三种尺寸: 4格(小) / 6格(中) / 12格(大)`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB 连接失败:", error);
    process.exit(1);
  });
