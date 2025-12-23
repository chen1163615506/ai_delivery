# 部署指南

## 方式一：Vercel 部署（推荐）

### 步骤：

1. 访问 Vercel：https://vercel.com/new
2. 使用 GitHub 账号登录
3. 点击 "Import Git Repository"
4. 选择 `chen1163615506/ai_delivery` 仓库
5. 配置如下：
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. 点击 "Deploy"

部署完成后会得到类似这样的链接：`https://ai-delivery-xxx.vercel.app`

---

## 方式二：Netlify 部署

### 步骤：

1. 访问 Netlify：https://app.netlify.com/start
2. 使用 GitHub 账号登录
3. 选择 `chen1163615506/ai_delivery` 仓库
4. 配置如下：
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
5. 点击 "Deploy site"

---

## 本地运行

```bash
# 克隆项目
git clone https://github.com/chen1163615506/ai_delivery.git
cd ai-delivery

# 安装依赖并启动
npm install
npm run dev
```

访问：http://localhost:5177

---

## 注意事项

由于这是演示项目，后端使用 Mock 数据。如需完整功能，请按照上述方式本地运行。
