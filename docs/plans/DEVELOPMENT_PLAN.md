# OdooSeek 开发计划

> 基于 [VISION.md](../VISION.md) 的愿景，将"探寻 Odoo 最佳可能"的使命分解为可执行、可追踪的开发任务。
>
> **对接目标**：Odoo 19 Community Edition（源码 `~/EA/odoo`），JSON-RPC 协议，Session Cookie 认证。

---

## 一、总览

| 阶段 | 代号 | 工期 | 目标 |
|------|------|------|------|
| **Phase 0** | 地基 | ✅ 已完成 (5/28) | Docker Odoo 19 + oweb 脚手架 |
| **Phase 1** | 网关 | ✅ 已完成 (5/28) | Rust axum BFF — 代理、会话、菜单、WebSocket |
| **Phase 2** | 视界 | ✅ 已完成 (5/28) | 视图引擎、路由守卫、i18n、XML 解析、动态菜单 |
| **Phase 3** | 疆域 | ✅ 已完成 (5/28) | CRM + 销售 + 库存 + 会计 17 条路由 |
| **Phase 4** | 精工 | ✅ 已完成 (5/28) | 看板 QWeb 语义支持 + QWeb 引擎分析 |
| **Phase 5** | 交互 | ✅ 已完成 (5/28) | 编辑模式、搜索/过滤、分组、装饰、图标移植 |
| **Phase 6** | 磐石 | ✅ 已完成 (5/29) | 测试 143 个、Rust 后端测试、组件测试 |
| **Phase 7** | 精进 | ✅ 已完成 (5/29) | 表单 Header/Action 按钮、Sheet 布局、分页器、Binary Widget、Graph 视图、m2m 标签选择器 |

---

## 二、Phase 0：地基 ✅ 已完成

### 成果

| 任务 | 产出 | 状态 |
|------|------|:----:|
| Docker Odoo 19.0 CE | `docker/19.0/Dockerfile` | ✅ |
| PostgreSQL 16 + pgAdmin | `docker/docker-compose.yml` | ✅ |
| oweb 项目脚手架 | React 19 + TypeScript + Vite + TanStack Router | ✅ |
| Biome lint/format | `biome.json` | ✅ |
| JSON-RPC SDK | `apps/oweb/src/lib/api.ts` | ✅ |
| 运行时主题引擎 | 5 预设 + 8 强调色 + localStorage | ✅ |
| CI/CD | `.github/workflows/ci.yml` (Rust + 前端) | ✅ |
| 文档 | VISION.md, AGENTS.md, WSL 教程 | ✅ |

---

## 三、Phase 1：网关 — odoo-web-server ✅ 已完成

### 成果

| 模块 | 文件 | 功能 |
|------|------|------|
| JSON-RPC 透传 | `proxy.rs` | POST `/api/odoo/*path` → Odoo，Cookie 转发 |
| Session 管理 | `session.rs` | 登录 `/web/session/authenticate` (flat params)，19 字段 SessionInfo |
| 菜单 | `menu.rs` | `ir.ui.menu` search_read 根菜单 |
| WebSocket | `ws.rs` | `/websocket/peek_notifications` 轮询 + broadcast |
| 静态文件 | `static.rs` | oweb SPA 托管 |
| Rust toolchain | `clippy.toml`, `rust-toolchain.toml` | cognitive-complexity=30, Odoo terms |

### 关键决策
- **`call_kw` 单一入口**: 所有模型操作通过 `/web/dataset/call_kw` — 不使用 `fields_view_get()`（Odoo 19 已移除）
- **Nginx 移除**: Rust server (:3000) 是唯一入口点，简化部署
- **WebSocket 直连**: Vite proxy 不可靠 → dev mode 使用 `ws://localhost:3000/ws/events`

---

## 四、Phase 2：视界 — 前端视图引擎 ✅ 已完成

### 成果

| 模块 | 文件 | 功能 |
|------|------|------|
| 路由守卫 | `__root.tsx`, 各路由 `beforeLoad` | 未认证 → `/login` |
| AuthProvider | `auth.tsx` | 14-field AuthState via `/api/session` |
| OdooViewLoader | `views/OdooViewLoader.tsx` | `get_views()` 一次调用 → 分发 List/Form/Kanban |
| OdooListRenderer | `views/OdooListRenderer.tsx` | 动态列 (from `<list>` XML)，TanStack Query |
| OdooFormRenderer | `views/OdooFormRenderer.tsx` | 递归布局 (sheet/group/notebook)，15 种 Widget |
| OdooViewSwitcher | `views/OdooViewSwitcher.tsx` | List/Form/Kanban 切换 |
| XML 解析器 | `lib/xml-parser.ts` | parseListXml, parseFormXml, parseKanbanXml, parseSearchXml |
| WebSocket 事件 | `hooks/useOdooBus.ts` | `/ws/events` 连接 + React Query 自动刷新 |
| i18n | `lib/i18n.tsx` | `use-intl` — zh_CN 默认, en fallback |
| 菜单导航 | `routes/menu.tsx` | `parseActionRef` + `callKw(ir.actions.act_window,read)` + 容器菜单子查询 |
| 通用路由 | 7 条 | `/`, `/login`, `/menu`, `/web`, `/dashboard`, `/settings`, `/home` |

---

## 五、Phase 3：疆域 — 业务模块 ✅ 已完成

### 实际架构（与早期设计不同）

采用**通用路由模式**而非每模块独立组件：
- `/web?model=MODEL` — 通用视图路由，不硬编码模型
- CRM pipeline 使用独立的 `/crm/pipeline` 路由（需要 domain 过滤）
- 各模块使用相同模式：列表 + 详情 + 索引重定向

### 路由表（17 条）

| 路由 | 视图类型 | 模型 | 域 |
|------|----------|------|-----|
| `/` | redirect | — | → `/menu` |
| `/login` | form | — | 登录 |
| `/menu` | grid | — | 动态菜单卡片 |
| `/web` | 通用 | search.model | 通用 ViewLoader |
| `/dashboard` | — | — | 占位 |
| `/settings` | — | — | 占位 |
| **CRM** | | | |
| `/crm/` | redirect | — | → `/crm/pipeline` |
| `/crm/pipeline` | kanban | crm.lead | `[['type','=','opportunity']]` |
| `/crm/leads` | list | crm.lead | `[['type','=','lead']]` |
| `/crm/lead/$id` | form | crm.lead | — |
| **Sales** | | | |
| `/sale/` | redirect | — | → `/sale/orders` |
| `/sale/orders` | list | sale.order | — |
| `/sale/order/$id` | form | sale.order | — |
| **Inventory** | | | |
| `/inventory/` | redirect | — | → `/inventory/pickings` |
| `/inventory/pickings` | list | stock.picking | — |
| `/inventory/picking/$id` | form | stock.picking | — |
| **Accounting** | | | |
| `/accounting/` | redirect | — | → `/accounting/moves` |
| `/accounting/moves` | list | account.move | — |
| `/accounting/move/$id` | form | account.move | — |

### 看板管线（Kanban）

| 功能 | 实现 |
|------|------|
| 数据获取 | `search_read` 全量 + 客户端 `stage_id` 分组 |
| 阶段列表 | `search_read('crm.stage', [['name','sequence','color']])` |
| 卡片渲染 | `parseKanbanFields(template)` → Widget 序列 + name 回退 |
| 拖拽 | HTML5 Drag & Drop + `callKw('write', [[id], {stage_id}])` + 乐观更新 |
| domain | pipeline 过滤 opportunity, leads 过滤 lead |

### 修复的关键 Bug

| 日期 | Bug | 修复 |
|------|-----|------|
| 5/28 | setState-during-render (menu.tsx:150) | `navigate()` 移入 `useEffect` |
| 5/28 | React duplicate keys (OdooListRenderer) | key 加索引前缀 |
| 5/28 | WebSocket CONNECTING close | `readyState` 检查 |
| 5/28 | 看板无数据 | `search_read` domain 双包裹修复 |

---

## 六、Phase 4：精工 — 看板 QWeb 语义 📋

> 详细技术方案：`PHASE4_TECHNICAL_DESIGN.md`

### 目标

将看板卡片从"扁平字段列表"升级为"符合 QWeb 语义的树状渲染"。

### 任务

| # | 任务 | 说明 | 工时 |
|---|------|------|------|
| 4.1 | `parseKanbanTemplate()` | 解析 t-if/t-foreach/t-elif/t-else 为 AST 树 | 1d |
| 4.2 | `KanbanNode` 递归渲染 | 条件、循环、footer 分区 | 1d |
| 4.3 | 表达式求值器 | 安全白名单，仅 `record.*` | 0.5d |
| 4.4 | `highlight_color` | 卡片颜色标记 | 0.3d |
| 4.5 | 测试 | 5 新测试 | 0.5d |

**共 3.3 天**

---

## 七、Phase 5：交互 — 编辑 + 搜索 + 分页 📋

| # | 任务 | 优先级 |
|---|------|--------|
| 5.1 | OdooFormRenderer 编辑模式 | P0 |
| 5.2 | `<search>` 视图 → 过滤器 UI | P1 |
| 5.3 | 列表分页 | P1 |
| 5.4 | many2one 搜索下拉 | P1 |
| 5.5 | `<xpath>` 视图继承 | P2 |
| 5.6 | `ir.actions.server` 支持 | P2 |

---

## 八、Phase 6：磐石 — 生产就绪 📋

| # | 任务 | 优先级 |
|---|------|--------|
| 6.1 | 测试扩展 (50+ tests) | P0 |
| 6.2 | Storybook 组件库 | P1 |
| 6.3 | 部署文档 + `make dev/prod` | P1 |
| 6.4 | E2E (Playwright) | P2 |
| 6.5 | Kubernetes Helm chart | P2 |

---

## 九、Phase 7：精进 — UI 完善 + 业务闭环 ✅ 已完成

> 详细技术方案：`PHASE7_TECHNICAL_DESIGN.md`

### 成果

| 任务 | Issue | 产出 |
|------|:-----:|------|
| 表单 Header + Action 按钮 + Sheet 布局 | #45 | xml-parser 解析 `<header>`/`<button>`，FormRenderer 布局重构，Action button 执行 (object/action/edit) |
| Sheet 居中布局 | #37 | Header 区域分离 (statusbar + buttons) vs Sheet 内容区 (max-w-860px) |
| 分页器改进 | #39, #46 | Pagination 组件 (40/80/200/500 页大小, « ‹ Page X of Y › ») |
| Binary/Image Widget | #46 | 文件上传/下载/图片预览，修复 binary 错误映射 |
| Graph 图表视图 | #46 | recharts 集成 (BarChart/LineChart/PieChart)，parseGraphXml |
| m2m 标签选择器 | #47 | 搜索+添加/移除标签，Odoo ORM 命令格式 |

### 新增文件

| 文件 | 说明 |
|------|------|
| `src/components/Pagination.tsx` | 分页器组件 |
| `src/views/OdooGraphRenderer.tsx` | Graph 图表视图 |
| `src/components/__tests__/Pagination.test.tsx` | 分页器测试 |
| `src/views/__tests__/OdooGraphRenderer.test.tsx` | Graph 测试 |

### 测试统计

| 阶段 | 测试数 |
|------|:------:|
| Phase 6 完成时 | 143 |
| Phase 7 完成后 | **157** |
| 新增 | +14 |

---

## 十、Phase 8：扩展 — 深度交互 ✅ 已完成 (5/30)

| # | 任务 | 优先级 | 说明 |
|---|------|:------:|------|
| 8.1 | one2many 内联列表 | P0 | ✅ 内联编辑 + Widget 渲染 + 行装饰 |
| 8.2 | 列表内联编辑 | P1 | ✅ editable=top/bottom + 验证 + 键盘导航 |
| 8.3 | Calendar 日历视图 | P1 | ✅ react-big-calendar 月/周/日视图 |
| 8.4 | ControlPanel 工具栏 | P1 | ✅ Print/Action 下拉 + 报表执行 |
| 8.5 | Activity 日程管理 | P2 | ✅ mail.activity 日程管理面板 |
| 8.6 | Chatter 消息线程 | P2 | ✅ 消息/笔记/关注者线程 |

---

## 十之一、Phase 9：Form 视图企业级对齐 ✅ 已完成 (5/30)

> 详细技术方案：`FORM_VIEW_OPTIMIZATION.md`

对比 Odoo 19 企业版 Form 视图源码（4318 行），识别 18 个优化项。

### Phase 21 — 低复杂度（6 项）

| # | 任务 | 说明 |
|---|------|------|
| 6 | Char 字段增强 | 密码遮罩、maxLength、autocomplete |
| 7 | Text 字段自动高度 | textarea 自动扩展、resize-none |
| 5 | Priority Tooltip | 从 selection 动态获取级别、hover 显示名称 |
| 18 | Timestamp 显示 | sheet 底部显示 create/write 时间和用户 |
| 9 | 状态指示器动画 | Unsaved/Saved/Invalid 过渡动画 |
| 12 | 字段帮助 Popover | 点击 ? 图标弹出帮助气泡 |

### Phase 22 — 中等复杂度（7 项）

| # | 任务 | 说明 |
|---|------|------|
| 3 | Monetary 字段 | 货币符号 + 精度控制 |
| 4 | Progressbar 可编辑 | 点击进度条修改值 |
| 8 | 状态栏按钮折叠 | 超过 3 个按钮折叠为 More 下拉 |
| 10 | Button Box 折叠 | 超过 4 个按钮折叠为 More 下拉 |
| 11 | Notebook 增强 | 必填字段红点标记 |
| 13 | Attachment Image | many2one 包装显示附件图片 |
| 16 | Many2one Domain | 搜索受 meta.domain 约束 |

### Phase 23 — 高复杂度（5 项）

| # | 任务 | 说明 |
|---|------|------|
| 1 | 图片字段增强 | WebP 转换、缩放、尺寸约束、lightbox |
| 2 | Many2One 增强 | 键盘导航、Search More 对话框、no_create |
| 14 | Binary 文件增强 | filename 关联、MIME 校验、文件大小 |
| 15 | HTML/Richtext | 集成轻量级富文本编辑器 |
| 17 | Form Autosave | 自动保存 + 草稿恢复 |

---

## 十一、依赖关系图

```
Phase 0 ✅ (Docker + 脚手架)
    │
Phase 1 ✅ (Rust BFF: proxy, session, menu, ws)
    │
Phase 2 ✅ (前端: ViewEngine, XML parser, Auth, i18n, Menu)
    │
Phase 3 ✅ (17 routes: CRM, Sales, Inventory, Accounting + Kanban DnD)
    │
Phase 4 ✅ (Kanban QWeb tree rendering, highlight_color)
    │
Phase 5 ✅ (Edit mode, search, pagination, many2one dropdown)
    │
Phase 6 ✅ (Tests 143, Storybook, deployment)
    │
Phase 7 ✅ (Header/Action buttons, Sheet, Pagination, Binary, Graph, m2m)
    │
Phase 8 ✅ (o2m inline, list editing, Calendar, Chatter)
    │
Phase 8A ✅ (菜单系统对齐: load_menus + NavBar + HomeMenu)
    │
Phase 9 ✅ (Form 视图企业级对齐: 18 项优化, Phase 21-23)
    │
Phase 10 ✅ (Widget 系统: 41 Widget + O2M 增强)
    │
Phase 11 ✅ (生产构建优化: Code Splitting + 压缩)
    │
Phase 12 ✅ (List 视图企业级对齐: 10 项优化)
    │
Phase 13 ✅ (Graph 视图增强: area 类型 + 图表切换 + 度量选择 + 排序)
    │
Phase 14 ✅ (Pivot 视图增强: 行列总计 + 度量切换 + 翻转轴 + CSV 导出)
    │
Phase 15 ✅ (Dashboard 重构: 阶段分布图 + 最近记录 + 快捷操作计数)
```

---

## 十二、当前进度

```
Phase 0  ████████████████████ 100% ✅ (2026-05-28)
Phase 1  ████████████████████ 100% ✅ (2026-05-28)
Phase 2  ████████████████████ 100% ✅ (2026-05-28)
Phase 3  ████████████████████ 100% ✅ (2026-05-28)
Phase 4  ████████████████████ 100% ✅ (2026-05-28)
Phase 5  ████████████████████ 100% ✅ (2026-05-28)
Phase 6  ████████████████████ 100% ✅ (2026-05-29)
Phase 7  ████████████████████ 100% ✅ (2026-05-29)
Phase 8  ████████████████████ 100% ✅ (2026-05-30)
Phase 8A ████████████████████ 100% ✅ (2026-05-31) (菜单系统对齐)
Phase 9  ████████████████████ 100% ✅ (2026-05-30) (Form 视图企业级对齐)
Phase 10 ████████████████████ 100% ✅ (2026-05-30) (Widget 系统 41 个)
Phase 11 ████████████████████ 100% ✅ (2026-05-31) (生产构建优化)
Phase 12 ████████████████████ 100% ✅ (2026-05-31) (List 视图企业级对齐)
Phase 13 ████████████████████ 100% ✅ (2026-05-31) (Graph 视图增强)
Phase 14 ████████████████████ 100% ✅ (2026-05-31) (Pivot 视图增强)
Phase 15 ████████████████████ 100% ✅ (2026-05-31) (Dashboard 重构)
```

---

## 十三、文档索引

| 文档 | 路径 | 版本 |
|------|------|------|
| VISION | `docs/VISION.md` | v1.7 |
| 架构哲学 | `docs/technologies/odoo-architecture-philosophy.md` | v2.0 |
| M→A→V→M 链路 | `docs/technologies/ODOOSEEK_MVAM_CHAIN.md` | v1.0 |
| QWeb 引擎 | `docs/technologies/ODOO_QWEB_ENGINE_ANALYSIS.md` | v1.0 |
| Phase 1 设计 | `docs/plans/PHASE1_TECHNICAL_DESIGN.md` | — |
| Phase 2 设计 | `docs/plans/PHASE2_TECHNICAL_DESIGN.md` | — |
| Phase 3 设计 | `docs/plans/PHASE3_TECHNICAL_DESIGN.md` | v3.0 |
| Phase 4 设计 | `docs/plans/PHASE4_TECHNICAL_DESIGN.md` | v1.0 |
| Phase 7 设计 | `docs/plans/PHASE7_TECHNICAL_DESIGN.md` | v1.0 |
| Form 视图优化 | `docs/plans/FORM_VIEW_OPTIMIZATION.md` | v1.0 |

---

---

## 十四、Phase 10：Widget 系统 ✅ 已完成 (5/30)

### 成果

| 任务 | Issue | 产出 |
|------|:-----:|------|
| Widget 模块化拆分 | #115 | `field-widgets.tsx` → `widgets/` 目录 (index/basic/selection/relational/media/utility) |
| Phase 24-26 新增 Widget | #115, #116, #117 | 15 新 Widget (float_time, percentage, statusbar, radio, many2many_checkboxes 等) |
| One2ManyWidget 增强 | #56 | 内联编辑 + Widget 渲染 + 行装饰 |

### Widget 统计

| 阶段 | Widget 数 |
|------|:---------:|
| Phase 7 完成时 | 26 |
| Phase 10 完成后 | **41** |
| 新增 | +15 |

---

## 十五、Phase 11：生产构建优化 ✅ 已完成 (5/31)

| 任务 | 说明 |
|------|------|
| Vite Code Splitting | lazy() 懒加载视图 + manualChunks 分包，初始加载 1131KB → ~400KB (-65%) |
| Rust gzip/brotli 压缩 | tower-http CompressionLayer 自动协商压缩 |
| 视图切换 hover 预加载 | onMouseEnter 预加载 chunk，消除懒加载延迟 |

---

## 十六、Phase 12：List 视图企业级对齐 ✅ 已完成 (5/31)

> 详细技术方案：Phase 18 计划文件

对比 Odoo 19 企业版 `list_renderer.js`（2301 行），识别 10 个优化项，全部实现。

| # | 任务 | 说明 |
|---|------|------|
| #7 | 列宽自动计算 | FIELD_TYPE_WIDTHS 按字段类型设置宽度 |
| #3 | 字段格式化器 | renderCell 提取到 list-formatters.ts，增强 monetary/float/integer/html |
| #5 | 单元格 Tooltip | 长文本 (>30字符) hover 显示完整内容 |
| #10 | 可选列持久化 | localStorage 保存列显隐状态 |
| #4 | editable=top/bottom | 区分新建行渲染位置 |
| #6 | 内联编辑校验 | 必填/类型检查，无效单元格 ring-red-400 |
| #1 | 行内按钮 | ListButtonElement/ListButtonGroup + confirm/states 支持 |
| #2 | 键盘导航 | ↑↓ F2 Ctrl+A Enter Shift+Space |
| #8 | 多级分组 | 递归 GroupRow，支持任意深度 |
| #9 | 多记录编辑 | 批量 write + 确认对话框 |

---

## 十七、Phase 8A：菜单系统对齐 ✅ 已完成 (5/31)

| 任务 | Issue | 产出 |
|------|:-----:|------|
| load_menus 代理 | #55 | `menu.rs` GET /api/menus → 代理 Odoo `/web/webclient/load_menus` |
| Menu Service | #55 | `menu-service.ts` — fetchMenus/getApps/getMenuAsTree/getAppSections/searchMenus |
| NavBar App 切换器 + 子菜单 | #55 | App 切换器 + 当前 App 子菜单 + 下拉导航 |
| HomeMenu 全屏覆盖 | #55 | Ctrl+H 触发 App 网格，搜索 + 拖拽排序 + 顺序持久化 |
| Menu Service 测试 | #55 | 15 个单元测试覆盖所有函数 |

---

**文档版本**: 9.0 (Phase 16-22 完成)
**更新日期**: 2026-05-31
**维护团队**: OdooSeek

---

## 十八、Phase 13：Graph 视图增强 ✅ 已完成 (5/31)

| 任务 | Issue | 说明 |
|------|:-----:|------|
| Area 图表类型 | #120 | AreaChart + 渐变填充 |
| 图表类型切换 | #120 | bar/line/pie/area 下拉选择器 |
| 度量选择 | #120 | 多度量时显示下拉切换 |
| 排序 | #120 | 按度量值升/降序 |
| 响应式尺寸 | #120 | ResponsiveContainer 自适应宽度 |
| 数据标签 | #120 | 饼图百分比 + 柱状图顶部数值 |

---

## 十九、Phase 14：Pivot 视图增强 ✅ 已完成 (5/31)

| 任务 | Issue | 说明 |
|------|:-----:|------|
| 行列总计 | #121 | Total 行 + Total 列 + 角落总计 |
| 度量切换 | #121 | 多度量 toggle 按钮显示/隐藏 |
| 翻转轴 | #121 | 行 ↔ 列互换按钮 |
| 导出 CSV | #121 | escapeCsv 处理特殊字符 |
| 行展开/折叠 | #121 | ▶/▼ 按钮控制行展开状态 |
| 度量排序 | #121 | 按度量值排序行 |

---

## 二十、Phase 15：Dashboard 重构 ✅ 已完成 (5/31)

| 任务 | Issue | 说明 |
|------|:-----:|------|
| 阶段分布图 | #122 | read_group 按阶段/状态分组条形图 |
| 最近记录 | #122 | search_read 最近 5 条 Opportunities/Orders |
| 快捷操作计数 | #122 | search_count 实时计数 |
| 日期头部 | #122 | 当前日期 + 用户信息 |
| 响应式布局 | #122 | max-w-6xl 网格 |

---

## 二十一、Phase 16：全局错误处理 ✅ 已完成 (5/31)

| 任务 | 说明 |
|------|------|
| RootErrorComponent | 路由级错误边界，显示错误信息 + "Try Again" 按钮 |
| API 401 自动重定向 | `api.ts` 检测 401 自动跳转 `/login`，抛出 'Session expired' |
| QueryClient 全局配置 | retry 跳过 Session expired，mutations.onError 全局处理 |
| JSX 现代化 | `import { StrictMode }` + `import { createRoot }` 替代旧导入 |

---

## 二十二、Phase 17：登录页增强 ✅ 已完成 (5/31)

| 任务 | 说明 |
|------|------|
| 密码显示/隐藏 | showPassword toggle + 眼睛图标 |
| 输入验证 | db/login/password 必填检查 |
| 友好错误分类 | 网络故障、401、服务器错误分别提示 |
| 预填数据库名 | 从 session.db 预填 db 字段 |
| 移除 Guest 按钮 | 仅保留登录功能 |
| autoComplete 属性 | username / current-password |

---

## 二十三、Phase 18：Form 视图完善 ✅ 已完成 (5/31)

| 任务 | 说明 |
|------|------|
| Form save invalidate 修复 | 新建记录使用 newRecordId 而非 recordId |
| Sheet/Header 间距 | Header 区域与 Sheet 内容区之间增加间距 |

---

## 二十四、Phase 19：Calendar 增强 ✅ 已完成 (5/31)

| 任务 | Issue | 说明 |
|------|:-----:|------|
| 事件创建 | #126 | onSelectSlot → callKw create |
| 拖拽移动 | #126 | onEventDrop → callKw write (dateStart + dateStop) |
| 拖拽调整时长 | #126 | onEventResize → callKw write (dateStop) |
| Toast 通知 | #126 | 成功/失败 toast 提示 |

---

## 二十五、Phase 20：One2Many CRUD 补全 ✅ 已完成 (5/31)

| 任务 | Issue | 说明 |
|------|:-----:|------|
| 稳定虚拟 ID | #127 | 使用负数 cmd[1] 替代 Date.now()+random，修复内联编辑 |
| 精确保存定位 | #127 | handleSaveEdit 按 cmd[1] 定位命令，不再更新所有 [0,0,...] |
| 删除新建记录 | #127 | 负数 ID 时移除 [0,0,...] 命令而非添加 [2,id] |
| 测试覆盖 | #127 | 6 项 CRUD 测试 (创建/删除/稳定 ID/空状态) |

---

## 二十六、Phase 21：Form Autosave ✅ 已完成 (5/31)

| 任务 | Issue | 说明 |
|------|:-----:|------|
| 草稿保存 | #128 | localStorage debounce 保存编辑中表单值 |
| 草稿恢复 | #128 | 重新打开表单时从 localStorage 恢复 |
| 保存后清除 | #128 | 成功保存后删除草稿 |
| 自动保存 | #128 | 5s idle 自动保存 (仅已有记录) |
| 快捷键 | #128 | Ctrl+S 保存 + Escape 取消 + beforeUnload 警告 |

---

## 二十七、Phase 22：搜索收藏 ✅ 已完成 (5/31)

| 任务 | Issue | 说明 |
|------|:-----:|------|
| 加载过滤器 | #129 | useFavoriteFilters → ir.filters.get_filters |
| 保存过滤器 | #129 | ir.filters.create_filter (含 domain + group_by context) |
| 删除过滤器 | #129 | ir.filters.unlink |
| SearchBar 集成 | #129 | ★ 按钮下拉 → 已保存列表 + 保存当前 + 删除 |
| 测试覆盖 | #129 | 7 项 FavoriteFilters 组件测试 |

---

## 二十八、Phase 23-25：Calendar 视图原生功能对齐 ✅ 已完成 (6/1)

> 详细技术方案：`CALENDAR_ALIGNMENT_PLAN.md`

| Phase | Issue | 内容 |
|:-----:|:-----:|------|
| 23 | #142 | 核心交互：XML 解析器扩展、全天事件、事件弹出详情(CalendarPopover)、快速创建对话框、颜色系统对齐、日历表单视图 |
| 24 | #143 | 业务逻辑：RSVP 按钮 (Yes/No/Maybe)、隐私锁图标 + "Busy" 替换、重复事件只读展示 |
| 25 | #144 | 高级功能：重复更新策略对话框(RecurrenceUpdateDialog)、多选编辑(multiEdit)、视频会议链接 |

**新增文件**: `CalendarPopover.tsx`, `CalendarQuickCreate.tsx`, `RecurrenceUpdateDialog.tsx`
**修改文件**: `types.ts`, `xml-parser.ts`, `OdooCalendarRenderer.tsx`, `OdooViewLoader.tsx`, `OdooFormRenderer.tsx`

---

## 二十九、Phase 26-31：P0 工作流闭环补全 ✅ 已完成 (6/1)

| Phase | Issue | 内容 |
|:-----:|:-----:|------|
| 26 | #132 | Action 按钮执行系统：object/action/special="cancel"、new record 自动保存、StatButton 修复 |
| 27 | #133 | Context 传递系统：action→ViewLoader→Form default_xxx 合并 |
| 28 | #134 | Dialog/Modal 系统：FormDialogOverlay + special="cancel" |
| 29 | #135 | default_get + 删除/归档/复制（已有实现） |
| 30 | #136 | 搜索面板 SearchPanel（已有实现） |

**修改文件**: `OdooFormRenderer.tsx`, `OdooViewLoader.tsx`, `web.tsx`, `xml-parser.ts`, `api.ts`

---

## 三十、Phase 31-36：增强项 + BFF 优化 ✅ 已完成 (6/1)

| Phase | Issue | 内容 |
|:-----:|:-----:|------|
| 31 | #137 | 搜索增强：日期过滤器、自定义过滤器、filter_domain（已有实现） |
| 32 | #138 | PDF 报告 (generateReport) + Modifier + Discard（已有实现） |
| 33 | #139 | BFF 优化：WS keepalive、with_cookie 去重、缓存追踪、菜单缓存清除 |
| 34 | #140 | i18n 动态翻译（BFF 代理 Odoo translations） |
| 35 | #141 | SDK 拆分 `@odooseek/odoo-client`（已有独立包） |

**Rust 修改**: `proxy.rs` (with_cookie + 菜单缓存 invalidate), `cache.rs` (invalidate prefix)

---

## 三十一、Phase 37-40：Odoo 模型 TypeScript 类型代码生成 ✅ 已完成 (6/1)

> 详细技术方案：`CODEGEN_TECHNICAL_DESIGN.md`

| Phase | Issue | 内容 |
|:-----:|:-----:|------|
| 37 | #145 | Codegen 1：`odoo-codegen` (CLI) + `odoo-types` (生成产物) 包搭建 |
| 38 | #146 | Codegen 2：16 模型类型生成 (Odoo 19 CE) + `typed-api.ts` 包装器 |
| 39 | #147 | Codegen 3：ActivityPanel 迁移 → `searchRead<MailActivityRecord[]>` |
| 40 | #148 | Codegen 4：Widget 类型收窄（延后至架构重构） |

**新增包**:
```
packages/odoo-codegen/  ← CLI: bun run generate → fields_get → .ts
packages/odoo-types/    ← 16 models × 150 rows 生成类型 · 零运行时
```

**关键发现**:
- `fields_get` 不返回 virtual/computed 字段 → Chatter 保留手写接口
- `searchReadModel` 与 Vitest mock 不兼容 → 用 `searchRead<T[]>` 参数化

---

**文档版本**: 11.0 (Phase 41 开始)
**更新日期**: 2026-06-01

---

## 三十二、Phase 41-47：HR 模块原生功能对齐 🚧 进行中 (6/1)

> 详细技术方案：`HR_ALIGNMENT_PLAN.md`

| Phase | Issue | 内容 |
|:-----:|:-----:|------|
| 41 | #151 | 基础对齐：专属路由（/hr/employees, /hr/employee/$id, /hr/departments, /hr/directory）+ codegen 10 模型类型 + Navbar 菜单映射 |
| 42 | #152 | 组织架构图 widget（react-d3-tree）+ 考勤状态图标（4 种 present/absent/away/off） |
| 43 | #153 | hr.version 版本化架构：timeline 选择器、历史版本浏览（只读）、版本对比 |
| 44 | #154 | 印章打印：employee badge QWeb-PDF 报告 |
| 45 | #155 | Wizard 系统：多步对话框（离职/薪资分配/合同模板） |
| 46 | #156 | 安全集成：hasGroup() + 字段可见性 + 公开目录 |
| 47 | #157 | HR 设置面板 + 演示数据 |

**Phase 41 文件**:
- `apps/oweb/src/routes/hr/` — 6 个新路由文件（index, employees, employee.$id, departments, department.$id, directory）
- `packages/odoo-codegen/config/models.json` — 新增 10 个 HR 模型
- `apps/oweb/src/components/Navbar.tsx` — routeAppMap 添加 `hr: 'hr'`
- `apps/oweb/src/components/HomeMenu.tsx` — Employees/Human Resources 图标
