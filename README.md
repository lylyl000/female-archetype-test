# 《你的“女性力量”是哪种能量形态？》网页测试

一个 **20 题原型测试 + 自我照见** 的可运行网页作品集项目（移动端优先，兼容桌面端）。

## 本地运行

这是一个零依赖静态项目，你可以用任意本地静态服务器打开。

### 方式 A：Python（推荐）

```bash
cd /Users/luyilin/Desktop/AIDM_Portfolio/test
python3 -m http.server 5173
```

然后在浏览器打开 `http://localhost:5173`。

### 方式 B：VSCode / Cursor Live Server

直接右键 `index.html` 用 Live Server 打开即可。

## 部署建议

- Vercel / Netlify / Cloudflare Pages：选择 **静态站点** 部署，发布目录为仓库根目录（含 `index.html`）。

## 目录结构

- `index.html`：入口页面
- `src/`：逻辑与页面渲染
  - `src/data/`：题库、计分规则、原型向量、结果文案（可维护数据）
  - `src/logic/`：计分、压缩、匹配主副原型、复制分享等逻辑
  - `src/ui/`：页面渲染与基础组件
- `styles/`：全局样式与动效

