# Satpad web (Next.js)

## 本地同时看「前端 + 后端 API」（推荐）

后端（Ponder + `/api`）和本站点 **域名/端口不同** 时，浏览器会遇到 **CORS**。  
默认配置下：**不设置** `NEXT_PUBLIC_API_BASE_URL`，前端请求走 **本站相对路径**（如 `/api/...`），由 **Next 开发服务器转发** 到 Ponder，效果类似你在后端直接打开 Swagger。

1. 启动后端（仓库内 `backend/`，需 Postgres 与 `.env`，见 `backend/README.md`）：

   ```bash
   cd backend && npm install && npm run dev
   ```

   默认 API 端口为 **3333**（可用环境变量 `PORT` 修改）。

2. 启动前端（**注意端口是 5000**，不是 3000）：

   ```bash
   cd web && npm install && npm run dev
   ```

3. 浏览器打开：

   - 前端站点：<http://127.0.0.1:5000>
   - 经 Next 转发的文档（与直连后端一致）：<http://127.0.0.1:5000/swagger>  
   - 健康检查：<http://127.0.0.1:5000/health>

4. 若后端 **不是** `http://127.0.0.1:3333`，在 `web/` 下建 `.env.local`（可参考 `.env.local.example`）设置：

   ```bash
   BACKEND_PROXY_TARGET=http://127.0.0.1:<你的PORT>
   ```

## 直连 API（不设代理）

在 `web/.env.local` 里设置完整地址，并 **自行保证** 后端已配置 CORS 或同源：

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3333
```

此时可关闭对相对路径的依赖；一般仅用于生产或特殊调试。

## 构建

```bash
npm run build && npm start
```

生产环境若 API 在另一域名，请设置 `NEXT_PUBLIC_API_BASE_URL`；`next.config.mjs` 里的 `rewrites` 仅适合本地或你在部署平台把同域流量反代到 API 的场景。
