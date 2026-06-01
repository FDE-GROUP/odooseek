# HR 模块原生功能对齐

> **版本**: 1.0
> **日期**: 2026-06-01
> **前置**: Phase 1-40 已完成（泛型视图引擎 + CRUD + Calendar/Form/Kanban/List/Pivot/Graph）
> **目标**: 将前端功能对齐 Odoo 19 `addons/hr` 模块的全部功能
> **Odoo 参照**: `addons/hr/models/`, `addons/hr/views/`, `addons/hr/security/`

---

## 一、当前状态 vs 目标差距

### 1.1 已对齐（泛型引擎自动覆盖）

| 功能 | OdooSeek | 说明 |
|------|:--------:|------|
| 表单渲染（sheet + notebook + header） | ✅ | 通用引擎，自动对齐 hr.employee 5-tab form |
| 列表渲染（tree + 可编辑 + 活动聚焦） | ✅ | 通用引擎，自动对齐 30+ 列 |
| 看板渲染（kanban） | ✅ | 通用引擎，自动对齐 QWeb 模板 |
| 图表渲染（graph） | ✅ | recharts 通用，自动对齐 hr_employee_view_graph |
| 透视表渲染（pivot） | ✅ | 通用引擎，自动对齐 hr_employee_view_pivot |
| 活动视图 | ✅ | 通用引擎，自动对齐 activity view |
| 搜索/过滤/分组 | ✅ | XML 驱动，自动对齐 view_employee_filter |
| Chatter（消息/日志/关注） | ✅ | 通用组件，对 hr.employee 立即可用 |
| ActivityPanel（活动追踪） | ✅ | 通用组件，对 hr.employee 立即可用 |
| 42+ 小部件（m2o/m2m/o2m/货币/状态栏等） | ✅ | 全部通用，自动处理 hr.employee 字段 |
| CRUD API（search_read/create/write/unlink） | ✅ | 模型无关，对 hr.employee 立即可用 |
| 按钮操作（object/action/special） | ✅ | 通用引擎，自动处理 hr.button 等 |
| 表达式求值（invisible/readonly/required） | ✅ | 通用引擎，自动处理 groups 条件（需后端配合） |

### 1.2 当前状态基线

**已存在的 HR 相关基础设施**：

- 无专属 `hr/` 路由
- codegen 未包含 `hr.employee`/`hr.department`/`hr.job` 等模型
- 无 `hr.version` 版本化引擎支持
- 无组织架构图 widget
- 无考勤状态图标系统
- 无印章/报告打印系统
- 无 wizard 系统（离职/薪资分配/合同模板）
- 无 SQL VIEW 代理（hr.employee.public）
- 无后端 HR 设置面板（res.config.settings 扩展）

### 1.3 未对齐清单（按优先级）

| # | 功能 | 复杂度 | Odoo 参照 | 依赖 |
|:--|------|:------:|-----------|:----:|
| 1 | 专属路由 + 菜单 | 低 | hr_views.xml | 无 |
| 2 | codegen 生成 hr.* 类型 | 低 | hr_employee.py 等 | 无 |
| 3 | 组织架构图 widget | 中 | hr_department_chart + form 右栏 | 无 |
| 4 | hr.employee.public SQL VIEW 代理 | 中 | hr_employee_public.py | 后端 |
| 5 | 考勤状态图标（看板+form） | 中 | hr_employee.py `_compute_presence_state` | 后端 |
| 6 | 印章打印（QWeb-PDF badge） | 中 | report/hr_employee_badge.xml | 报告系统 |
| 7 | hr.version 版本化架构 | 大 | hr_version.py + timeline widget | 无 |
| 8 | 离职向导 | 中 | hr/departure/wizard | 无 |
| 9 | 薪资分配 UI | 中 | bank allocation wizard | 无 |
| 10 | 合同模板加载 wizard | 中 | hr/version/wizard | 无 |
| 11 | 入职/离职计划按钮 | 低 | plan_wizard_action | 无 |
| 12 | 考勤设置面板 | 低 | res_config_settings_views.xml | 无 |
| 13 | 用户 ↔ 员工同步 | 中 | res_users.py write/create | 后端 |
| 14 | 部门自动订阅 discuss channel | 低 | discuss_channel.py | 后端 |
| 15 | 合同到期/工作许可提醒 cron | 低 | ir_cron_data_employee_* | 后端 |
| 16 | 演示数据加载 | 低 | hr_demo.xml | 无 |

---

## 二、Phase 41 — 基础对齐（P0）

> Issue: #151

### 2.1 专属路由（`apps/oweb/src/routes/hr/`）

新增文件结构：

```
apps/oweb/src/routes/hr/
├── employees.tsx          # 员工列表（kanban/list/form/activity/graph/pivot）
├── employee.$id.tsx       # 员工表单
├── department.$id.tsx     # 部门表单
├── departments.tsx        # 部门列表
├── directory.tsx          # 公共目录（hr.employee.public）
└── index.tsx              # HR 应用入口（菜单获取 + 跳转）
```

每个路由文件遵循现有模式（`/crm/leads.tsx`），约 10-15 行样板代码。

**`employees.tsx` 要点**：

```typescript
// 复用通用 OdooViewLoader
// viewType 默认看板，支持 kanban/list/form/activity/graph/pivot
// 从菜单服务获取 action ID 或硬编码 action
export function HR_Employees() {
  return <OdooGenericView model="hr.employee" defaultViewType="kanban" />
}
```

### 2.2 菜单注册（`apps/oweb/src/hooks/useHomeMenu.ts` 扩展）

从 Odoo `/web/webclient/load_menus` 获取的菜单树中提取 HR 分支：

```
Employees (menu_hr_root) [id: 185]
├── Human Resources (menu_hr_main)
├── Employees (menu_hr_employee_payroll) → route: /hr/employees
├── Directory (menu_hr_employee) → route: /hr/directory
├── Departments (menu_hr_department_kanban) → route: /hr/departments
├── Reporting (hr_menu_hr_reports)
└── Configuration (menu_human_resources_configuration)
    ├── Settings → /settings/hr
    ├── Onboarding/Offboarding → /hr/plans
    ├── Work Locations → /hr/work-locations
    ├── Working Schedules → /hr/schedules
    ├── Departure Reasons → /hr/departure-reasons
    └── Job Positions → /hr/jobs
```

菜单 → 路由映射在 `web.tsx` 或 `hr/index.tsx` 中配置，复用现有 `menuData` → `MenuItem` 映射逻辑。

### 2.3 codegen 类型扩展（`packages/odoo-codegen/config/models.json`）

新增模型：

```json
[
  "hr.employee",
  "hr.employee.public",
  "hr.department",
  "hr.job",
  "hr.version",
  "hr.work.location",
  "hr.employee.category",
  "hr.departure.reason",
  "hr.contract.type",
  "hr.payroll.structure.type"
]
```

重跑 `bun run generate` 生成 `packages/odoo-types/src/generated/models/hr.*.ts`。

**重点关注字段 groups 标记**（影响前端字段可见性）：

```typescript
// hr.employee 自动生成类型示例（简化）
export interface HrEmployeeRecord {
  id: number
  display_name: string
  active: boolean
  // 公开字段（base.group_user）
  name: string
  department_id: [number, string] | false
  job_id: [number, string] | false
  parent_id: [number, string] | false
  work_email: string
  work_phone: string
  mobile_phone: string
  category_ids: number[]
  color: number
  image_1920: string | false
  // group_hr_user 字段
  private_phone?: string
  private_email?: string
  birthday?: string
  emergency_contact?: string
  // group_hr_manager 字段
  contract_date_start?: string
  contract_date_end?: string
  wage?: number
  contract_wage?: number
  employee_type?: string
  contract_type_id?: [number, string] | false
  structure_type_id?: [number, string] | false
  // presence 字段
  hr_presence_state?: string
  hr_icon_display?: string
  im_status?: string
  // version 字段
  current_version_id?: number
  versions_count?: number
  version_ids?: number[]
}
```

### 2.4 文件变更汇总（Phase 41）

**新文件**：

```
apps/oweb/src/routes/hr/
├── employees.tsx
├── employee.$id.tsx
├── departments.tsx
├── department.$id.tsx
├── directory.tsx
├── index.tsx
└── __tests__/
    └── hr-routes.test.tsx
```

**修改文件**：

| 文件 | 变更 |
|------|------|
| `packages/odoo-codegen/config/models.json` | 添加 10 个 HR 模型 |
| `packages/odoo-types/src/generated/core.ts` | 重新生成（含 HR 类型联合） |
| `apps/oweb/src/routes/web.tsx` | 可选：为 hr.employee 提供 fallback 路由 |

---

## 三、Phase 42 — 组织架构图 + 考勤状态（P1）

> Issue: #152

### 3.1 组织架构图（新 widget：`apps/oweb/src/views/widgets/orgchart.tsx`）

**Odoo 参照**：`web_graph/static/src/org_chart/` + `hr_department_chart` widget

**功能需求**：
- 渲染 hr.employee 和 hr.department 的树形层级
- 支持展开/折叠子树
- 显示节点信息：头像 + 姓名 + 职位
- 点击节点 → 跳转员工/部门表单
- 支持缩放和平移

**技术选型**：`react-d3-tree`（纯 D3 封装，SVG 渲染，无额外 DOM 依赖）

**接口设计**：

```typescript
interface OrgChartProps {
  rootId: number          // 根节点 ID（部门或员工）
  model: 'hr.employee' | 'hr.department'
  onNodeClick: (id: number, model: string) => void
  maxDepth?: number       // 默认 5
}
```

**数据获取**：

```typescript
// hr.department 有 parent_id + child_ids
// hr.employee 有 parent_id（manager）+ child_ids（subordinates）
async function fetchOrgTree(model: string, rootId: number): Promise<OrgNode[]> {
  const records = await searchRead(model, [
    // 递归获取所有层级
    // 或使用 Odoo 的 `search` + `read` 组合
  ], ['id', 'name', 'parent_id', 'child_ids', 'image_128', 'job_title'])
  return buildTree(records, rootId)
}
```

**集成点**：
- `view_employee_form` 的 Work tab 右栏 → 替换占位 div
- `view_department_form` → 全屏组织架构图

### 3.2 考勤状态图标

**Odoo 参照**：`hr_presence_state` 计算字段 + `hr_icon_display`

**状态值**：
| `hr_presence_state` | 图标 | 颜色 |
|:---|:---|:---:|
| `present` | 绿点 | `#28a745` |
| `absent` | 灰点 | `#6c757d` |
| `away` | 黄点 | `#ffc107` |
| `out_of_working_hour` | 灰空心 | `#ced4da` |

**集成点**：
- 看板卡片：员工头像右下角
- 表单 header：姓名右侧
- 搜索过滤："Present/Absent" 快速筛选

**实现**：

```typescript
function PresenceIcon({ state }: { state?: string }) {
  const config = {
    present: { color: '#28a745', icon: 'circle' },
    absent: { color: '#6c757d', icon: 'circle' },
    away: { color: '#ffc107', icon: 'circle' },
    out_of_working_hour: { color: '#ced4da', icon: 'circle-outline' },
  }[state ?? 'absent']
  return <span className="presence-dot" style={{ color: config.color }}>●</span>
}
```

**注意**：`hr_presence_state` 依赖 `hr_attendance` 和 `hr_presence` 模块。如果未安装，默认 `absent`。

### 3.3 文件变更汇总（Phase 42）

**新文件**：

```
apps/oweb/src/views/widgets/OrgChart.tsx
apps/oweb/src/views/widgets/PresenceIcon.tsx
apps/oweb/src/views/widgets/__tests__/OrgChart.test.tsx
apps/oweb/src/views/widgets/__tests__/PresenceIcon.test.tsx
```

**修改文件**：

| 文件 | 变更 |
|------|------|
| `apps/oweb/src/views/widgets/index.ts` | 注册 OrgChart、PresenceIcon widget |
| `apps/oweb/src/views/OdooFormRenderer.tsx` | 检测 `div` 的 `name="org_chart"` 或 `widget="org_chart"` |
| `apps/oweb/src/views/OdooKanbanRenderer.tsx` | 看板卡片渲染 PresenceIcon |
| `apps/oweb/src/views/calendar-theme.css` | 可选：考勤状态 CSS 变量 |

---

## 四、Phase 43 — hr.version 版本化架构（P1-P2）

> Issue: #153
> **复杂度**: 高（架构级变更）

### 4.1 当前局限

`hr.employee` 使用 `_inherits = {'hr.version': 'version_id'}` 架构。所有核心字段（部门、职位、工资、合同等）实际存储在 `hr.version` 中。`hr.employee` 通过 `_inherits` 委托读取。

当前 OdooSeek 的通用 form 引擎通过 `_inherits` 展平的字段列表直接读写 `hr.employee.field_name`，Odoo 后端自动映射到 `hr.version`。**基本 CRUD 立即可用**，但 timeline 版本化 UI 缺失。

### 4.2 功能需求

**Odoo 参照**：`hr_version.py` + `hr_version_views.xml`

1. **版本时间线选择器**：员工 form header 显示 timeline，点击切换 `current_version_id`
2. **历史版本浏览**：查看过去的版本（只读）
3. **版本对比**：对比两个版本的字段差异
4. **创建新版本**：手动创建新版（`create_version` 方法）

### 4.3 接口设计

```typescript
interface VersionTimelineProps {
  employeeId: number
  currentVersionId: number
  versions: VersionInfo[]
  onVersionSelect: (versionId: number) => void
}

interface VersionInfo {
  id: number
  dateVersion: string           // hr.version.date_version
  contractDateStart?: string
  contractDateEnd?: string
  department?: [number, string]
  job?: [number, string]
  wage?: number
  isCurrent: boolean
  isFuture: boolean
  isPast: boolean
  isInContract: boolean
}
```

### 4.4 数据流

```
用户选择版本 → setVersion(versionId)
  → read('hr.version', [versionId], allFields)
  → 渲染表单（只读模式）
  → "Back to Current" 按钮恢复
```

### 4.5 文件变更汇总（Phase 43）

**新文件**：

```
apps/oweb/src/views/widgets/VersionTimeline.tsx
apps/oweb/src/views/widgets/__tests__/VersionTimeline.test.tsx
```

**修改文件**：

| 文件 | 变更 |
|------|------|
| `apps/oweb/src/views/widgets/index.ts` | 注册 VersionTimeline |
| `apps/oweb/src/views/OdooFormRenderer.tsx` | 检测 `version_id` timeline widget、只读模式切换 |
| `apps/oweb/src/views/OdooViewLoader.tsx` | 版本化 model 的特殊字段处理 |
| `apps/oweb/src/hooks/useVersioning.ts` | **新文件**：版本化状态管理 hook |

---

## 五、Phase 44 — 印章打印 + 报告（P2）

> Issue: #154

### 5.1 功能需求

**Odoo 参照**：`report/hr_employee_badge.xml`

- 员工 form Settings tab "Print Badge" 按钮（当 `barcode` 字段有值）
- QWeb-PDF 报告：头像 + 姓名 + 职位 + 条形码
- 每页多张 badge（Inline-block 布局）

### 5.2 实现方式

**方式一**：前端直接渲染 PDF（`@react-pdf/renderer`）

```typescript
// 不需要新依赖，用现有打印系统
const handlePrintBadge = async (employeeId: number) => {
  const data = await read('hr.employee', [employeeId], ['name', 'job_title', 'image_128', 'barcode'])
  // 构造打印布局 → window.print()
}
```

**方式二**：调用 Odoo 报告服务

```typescript
// 复用 generateReport API
// 如果 report action 已注册
await generateReport('hr.action_report_employee_badge', [employeeId])
```

### 5.3 文件变更

**修改文件**：

| 文件 | 变更 |
|------|------|
| `apps/oweb/src/views/OdooFormRenderer.tsx` | 按钮 type="object" 中检测 `print_badge` 等打印动作 |
| `apps/oweb/src/views/widgets/BadgeWidget.tsx` | **新文件**：条形码 + 印章预览 |

---

## 六、Phase 45 — Wizard 系统（P2）

> Issue: #155

### 6.1 现有局限

Odoo 的 wizard 是基于后端 `TransientModel` 的多步表单弹出框。当前 OdooSeek 的 FormDialog 仅支持单步 form view，不支持 wizard 的 `state` 切换、按钮步骤、`default_*` 上下文传递。

### 6.2 需要支持的 wizard

| Wizard | Odoo Model | 功能 |
|:-------|:-----------|------|
| 离职 | `hr.departure.wizard` | 选择离职原因 + 日期 + 描述 + 删除用户选项 |
| 薪资分配 | `hr.bank.account.allocation.wizard` | 编辑各银行账户的薪资分配百分比 |
| 合同模板 | `hr.version.wizard` | 从合同模板加载默认值 |

### 6.3 多步 Wizard 对话框扩展

```typescript
interface WizardDialogProps {
  model: string               // wizard 模型名
  actionId?: number           // action id（解析后获取 fields/views）
  steps: WizardStep[]         // 步骤定义
  onDone: (result: unknown) => void
  onCancel: () => void
}

interface WizardStep {
  title: string
  fields: string[]
  buttons: WizardButton[]
}

interface WizardButton {
  label: string
  special?: 'cancel' | 'close'
  type: 'object' | 'action'
  name: string
}
```

**数据流**：

```
open wizard → create wizard record (default_get) 
  → render step 1 fields
  → button click → callKw(wizard_model, button_method, [wizard_id])
  → get updated state → render step 2 (or close/writeback)
```

### 6.4 文件变更汇总（Phase 45）

**新文件**：

```
apps/oweb/src/components/WizardDialog.tsx
apps/oweb/src/components/__tests__/WizardDialog.test.tsx
```

**修改文件**：

| 文件 | 变更 |
|------|------|
| `apps/oweb/src/views/OdooFormRenderer.tsx` | 检测 `open_wizard` action → 打开 WizardDialog |
| `apps/oweb/src/views/OdooViewLoader.tsx` | action 解析中处理 wizard 模型 |

---

## 七、Phase 46 — 安全 + 公开视图（P2）

> Issue: #156

### 7.1 安全组前端集成

**Odoo 参照**：`hr_security.xml` + `ir.model.access.csv`

OdooSeek 的前端已从 Odoo `/web/session/get_session_info` 获取 `group_ids`。需要：

1. **字段级可见性**：通用 form 引擎已解析 `groups="hr.group_hr_manager"` 等属性，但需要在前端评估用户是否属于对应组。
2. **菜单隐藏**：根据用户 group 动态显示/隐藏 HR 菜单项。
3. **按钮/操作禁用**：无权限时隐藏操作按钮。

### 7.2 hr.employee.public SQL VIEW

**Odoo 参照**：`hr_employee_public.py` — `_auto = False`

OdooSeek 前端无法直接读取 SQL VIEW。需要方法：

1. **后端 BFF 层代理**（推荐）：在 Rust proxy 中添加 `/api/hr/employees/public` 端点，读 `hr.employee.public` 模型。
2. **或直接使用 `hr.employee` + 字段过滤**：前端只请求公开字段（name, department, job, work_email 等），不请求 private/payroll 字段。

**方案 2 更简单**，因为 `searchRead` 只返回请求的字段。

### 7.3 文件变更

**修改文件**：

| 文件 | 变更 |
|------|------|
| `apps/oweb/src/lib/auth.tsx` | 导出用户 `group_ids`，提供 `hasGroup(groupId)` |
| `apps/oweb/src/views/widgets/index.ts` | `getFieldWidget` 检查 `groups` 属性 |
| `apps/oweb/src/components/Navbar.tsx` | 菜单项权限控制 |
| `apps/oweb/src/hooks/useHomeMenu.ts` | 菜单过滤基于 group |

---

## 八、Phase 47 — 设置面板 + 数据（P3）

> Issue: #157

### 8.1 HR 设置面板

Odoo 的 `res.config.settings` 为 HR 模块提供设置面板：

| 设置 | 字段 | 影响 |
|:-----|:-----|:-----|
| 考勤控制 | `hr_presence_control_login/email/ip/attendance` | 考勤状态计算 |
| 技能模块 | `module_hr_skills` | 启用技能跟踪 |
| 考勤模块 | `module_hr_attendance` | 启用考勤 |
| 合同提醒 | `contract_expiration_notice_period` | 到期提醒天数 |
| 工作许可 | `work_permit_expiration_notice_period` | 许可到期提醒天数 |

**当前设置面板**：`apps/oweb/src/routes/settings.tsx`（或等效）添加 HR tab。

### 8.2 演示数据

**Odoo 参照**：`hr_demo.xml`

在 `apps/oweb` 中添加 `scripts/load-hr-demo.ts`：

```typescript
// 从 demo 员工数据创建 16 条记录
// 调用 hr 模块的 _load_demo_data 方法
await callKw('hr.employee', '_load_demo_data', [])
```

### 8.3 文件变更

**新文件**：

```
apps/oweb/src/routes/settings/hr.tsx    # HR 设置子页面
apps/oweb/scripts/load-hr-demo.ts
```

---

## 九、文件变更总览

### 新文件

```
apps/oweb/src/
├── routes/hr/
│   ├── index.tsx                    # HR 入口
│   ├── employees.tsx                # 员工列表
│   ├── employee.$id.tsx             # 员工表单
│   ├── departments.tsx              # 部门列表
│   ├── department.$id.tsx           # 部门表单
│   ├── directory.tsx                # 公共目录
│   ├── settings.tsx                 # HR 设置
│   └── __tests__/
│       └── hr-routes.test.tsx
├── views/widgets/
│   ├── OrgChart.tsx                 # 组织架构图
│   ├── PresenceIcon.tsx             # 考勤状态图标
│   ├── VersionTimeline.tsx          # 版本时间线
│   ├── BadgeWidget.tsx              # 印章预览
│   └── __tests__/
│       ├── OrgChart.test.tsx
│       ├── PresenceIcon.test.tsx
│       └── VersionTimeline.test.tsx
├── components/
│   ├── WizardDialog.tsx             # 多步 wizard 对话框
│   └── __tests__/
│       └── WizardDialog.test.tsx
└── hooks/
    ├── useVersioning.ts             # 版本化状态管理
    └── __tests__/
        └── useVersioning.test.ts
```

### 修改文件

| 文件 | Phase | 变更 |
|------|:-----:|------|
| `packages/odoo-codegen/config/models.json` | 41 | 添加 10 个 HR 模型 |
| `packages/odoo-types/src/generated/core.ts` | 41 | 重新生成类型 |
| `packages/odoo-types/src/generated/models/` | 41 | 10 个新类型文件 |
| `apps/oweb/src/views/widgets/index.ts` | 42-43 | 注册 OrgChart/PresenceIcon/VersionTimeline |
| `apps/oweb/src/views/OdooFormRenderer.tsx` | 42-46 | 检测 org_chart/version_timeline widget、wizard action |
| `apps/oweb/src/views/OdooKanbanRenderer.tsx` | 42 | 看板渲染 PresenceIcon |
| `apps/oweb/src/views/OdooViewLoader.tsx` | 45-46 | wizard 模型处理、权限过滤 |
| `apps/oweb/src/components/Navbar.tsx` | 46 | 菜单权限控制 |
| `apps/oweb/src/lib/auth.tsx` | 46 | `hasGroup()` 方法 |
| `apps/oweb/src/hooks/useHomeMenu.ts` | 41 | 菜单 → 路由映射 |
| `apps/oweb/src/routes/settings.tsx` | 47 | HR 设置 tab |

### 无新外部依赖

| Phase | 依赖 |
|:-----:|------|
| 41 | 无 |
| 42 | `react-d3-tree`（组织架构图，42 kB gzip） |
| 43 | 无 |
| 44 | 无（复用 `window.print()` 或现有报告系统） |
| 45 | 无（复用现有 FormDialog） |
| 46 | 无 |
| 47 | 无 |

---

## 十、与 Odoo 的 delta（不会实现的功能）

| 功能 | 原因 |
|:-----|------|
| `hr.mixin` 上下文权限绕过 | 纯后端逻辑，前端无需处理 |
| `ir_ui_menu` 黑名单 | 后端已处理，前端复用菜单响应 |
| `mail_alias` "employees" 联系人类型 | 纯后端邮件网关配置 |
| `resource.resource` 合同感知日历 | 后端 `_get_calendars_validity_within_period` 已处理 |
| `resource.calendar.leaves` 合同感知请假 | 后端 `_compute_calendar_id` 已处理 |
| `res.config.settings` 模块安装 | 后端 `module_hr_*` 字段自动处理 |
| cron 定时任务 | 后端执行 |
| digest 邮件 | 后端发送 |

---

## 十一、测试计划

### Phase 41：路由 + 类型

| # | 测试 | 覆盖 |
|:--|------|:----:|
| 1 | `/hr/employees` 渲染看板视图 | 路由整合 |
| 2 | `/hr/employee/1` 渲染表单视图 | 路由 + 数据获取 |
| 3 | `/hr/departments` 渲染列表视图 | 路由整合 |
| 4 | codegen 生成 `HrEmployeeRecord` 类型 | 类型完整性 |
| 5 | 菜单 → 路由映射正确 | 导航 |

### Phase 42：组织架构图 + 考勤

| # | 测试 | 覆盖 |
|:--|------|:----:|
| 6 | OrgChart 渲染树形结构 | 组件 |
| 7 | 展开/折叠子树 | 交互 |
| 8 | 点击节点触发 onNodeClick | 事件 |
| 9 | PresenceIcon 渲染 4 种状态 | 视觉 |
| 10 | Kanban 卡片显示考勤图标 | 集成 |

### Phase 43：版本化

| # | 测试 | 覆盖 |
|:--|------|:----:|
| 11 | VersionTimeline 渲染时间线 | 组件 |
| 12 | 选择版本后表单切换到只读 | 数据流 |
| 13 | "Back to Current" 恢复编辑 | 交互 |

### Phase 45：Wizard

| # | 测试 | 覆盖 |
|:--|------|:----:|
| 14 | WizardDialog 渲染多步骤 | 组件 |
| 15 | 按钮触发后端 method | API |
| 16 | wizard 关闭后父表单刷新 | 数据流 |

---

## 十二、验证方案

每个 Phase 完成后执行：

```bash
cd apps/oweb
bun run build     # tsc + vite build
bun run lint      # biome check
bun run test      # vitest（291+ tests）
```

**手动验证**（使用 `hr.employee` 模型）：

| Phase | 验证方式 |
|:------|----------|
| 41 | ① 打开 `/hr/employees` → 看到员工看板 ② 点员工 → 看到 5-tab 表单 ③ 编辑保存 → CRUD 正常 ④ Chatter 发消息 → 正常 |
| 42 | ① 打开员工表单 Work tab → 看到组织架构图 ② 展开/折叠 ③ 点击节点跳转 ④ 看板卡片右下角有考勤图标 |
| 43 | ① 员工 form header 看到版本时间线 ② 点击历史版本 → 表单只读 ③ 点击 current → 恢复编辑 |
| 45 | ① 点 "Departure" 按钮 → 弹出离职 wizard → 多步完成 |
| 46 | ① 非 HR 用户看不到 Private/Payroll tab ② 公开目录可访问 |

---

## 十三、实施顺序建议

```
Phase 41（路由+类型）→ Phase 42（org chart + 考勤）
  ↗                    ↘
Phase 46（安全）    Phase 44（印章打印）
  ↘                    ↗
Phase 43（版本化）→ Phase 45（wizard）→ Phase 47（设置+数据）
```

**最短可用路径**：Phase 41 → Phase 46 → Phase 42 → 其余可选

---

## 十四、关联文档

| 文档 | 用途 |
|:-----|:-----|
| `docs/plans/DEVELOPMENT_PLAN.md` | 全局路线图，Phase 41+ 追加到此文档 |
| `docs/plans/CODEGEN_TECHNICAL_DESIGN.md` | codegen 工具参考 |
| `docs/plans/WIDGET_SYSTEM_DESIGN.md` | widget 注册机制参考 |
| `docs/plans/PHASE1_TECHNICAL_DESIGN.md` | 泛型视图引擎架构参考 |

---

**文档版本**: 1.0
**更新日期**: 2026-06-01
**关联 Issues**: #151 (Phase 41), #152 (Phase 42), #153 (Phase 43), #154 (Phase 44), #155 (Phase 45), #156 (Phase 46), #157 (Phase 47)
