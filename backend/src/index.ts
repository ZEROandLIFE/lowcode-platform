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
app.use(express.json({ limit: "10mb" }));

// 路由
app.use("/api", routes);

// 连接 MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB 连接成功");
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
      console.log(`📦 组件物料库已加载`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB 连接失败:", error);
    process.exit(1);
  });

// 错误处理
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: "服务器内部错误" });
  }
);
