# Odoo Docker 配置

## 概述

本目录包含 Odoo 19 的 Docker 配置，使用**原生纯净的 Odoo 镜像**，不包含任何自定义插件。

## 文件结构

```
docker/
├── docker-compose.yml    # Docker Compose 配置文件
├── config/
│   └── odoo.conf        # Odoo 服务器配置文件
└── README.md            # 本文件
```

## 服务说明

### web (Odoo 服务器)

- **镜像**: `odoo:19.0` (官方镜像)
- **端口**: `8069:8069`
- **数据持久化**: `odoo-web-data` 卷
- **配置**: `./config/odoo.conf`

**特点**:

- ✅ 使用原生 Odoo 镜像，无自定义插件
- ✅ 使用 Odoo 19 原生 CORS 配置
- ✅ 依赖浏览器自动发送 Cookie（不使用自定义请求头）

### db (PostgreSQL 数据库)

- **镜像**: `postgres:16`
- **数据持久化**: `odoo-db-data` 卷
- **默认数据库**: `postgres`（Odoo 业务库多为 `odoo19` 等，见「本机 Odoo 库与管理员」）

### server (Oweb BFF / Rust)

- **构建**: `docker/Dockerfile.rust`
- **端口**: `3000:3000`（代理 Odoo + 托管 `apps/oweb/dist` 静态资源）
- **环境**: `ODOO_URL=http://web:8069`
- **用途**: 前端与 `odoo-codegen` 的统一 API 入口（`/api/session/login`、`/api/odoo/...`）

### pgadmin (数据库管理工具)

- **镜像**: `dpage/pgadmin4`
- **端口**: `25050:80`
- **默认登录**（pgAdmin 自身账号，与 Odoo 无关）:
  - 邮箱: `admin@admin.com`
  - 密码: `admin`

## 快速开始

### 启动服务

```bash
cd docker
docker-compose up -d
```

### 停止服务

```bash
docker-compose down
```

### 查看日志

```bash
docker-compose logs -f web
```

### 访问服务

- **Odoo**: <http://localhost:8069>
- **Oweb BFF**（`docker-compose` 含 `server` 服务时）: <http://localhost:3000>
- **pgAdmin**: <http://localhost:25050>

### 本机 Odoo 库与管理员（首次建库后）

通过 Odoo Web 向导创建的数据库名、管理员账号因环境而异。当前 WSL/Docker 常见配置为：

| 项 | 值 |
|:---|:---|
| 数据库名 | `odoo19` |
| 登录名 | `admin@admin.com`（**不是** `admin`） |
| 密码 | 建库时设置；演示环境常为 `admin` |

查看本机已有数据库：

```bash
docker exec docker-db-1 psql -U odoo -d postgres -tAc \
  "SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY 1;"
```

## 配置说明

### Odoo 配置 (`config/odoo.conf`)

**关键配置**:

- `addons_path`: 只包含原生插件路径，不包含自定义插件
- `server_wide_modules`: 只包含原生模块（`base,web`）
- 使用 Odoo 19 原生 CORS 配置

### CORS 配置

**不再需要自定义 CORS 配置**，因为：

- ✅ 使用 Odoo 19 原生 CORS 配置
- ✅ 依赖浏览器自动发送 Cookie（`credentials: 'include'`）
- ✅ 不再使用自定义请求头（如 `X-Openerp-Session-Id`）

**Odoo 19 原生 CORS 配置包含**:

- `Access-Control-Allow-Origin: *` (通过 `@route(cors='*')`)
- `Access-Control-Allow-Methods: POST` (JSON-RPC) 或 `GET,POST` (HTTP)
- `Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization`
- `Access-Control-Max-Age: 86400`

## 数据持久化

所有数据都存储在 Docker 卷中：

- `odoo-web-data`: Odoo 应用数据
- `odoo-db-data`: PostgreSQL 数据库数据
- `pgadmin-data`: pgAdmin 配置数据

**备份数据**（将 `odoo19` 换成你的库名）:

```bash
docker compose exec db pg_dump -U odoo odoo19 > backup-odoo19.sql
```

**恢复数据**:

```bash
docker compose exec -T db psql -U odoo -d odoo19 < backup-odoo19.sql
```

## 开发环境

### 前端连接

前端应用可以通过以下方式连接 Odoo：

1. **使用 Vite 代理**（推荐，开发环境）:
   - 前端地址: `http://localhost:5173`
   - 代理路径: `/api/odoo`
   - 自动转发到: `http://localhost:8069`

2. **直接连接**（需要 CORS 配置）:
   - 前端地址: `http://localhost:5173`
   - Odoo 地址: `http://localhost:8069`
   - 使用 Odoo 19 原生 CORS 配置

### 环境变量

前端应用可以通过环境变量配置连接：

```env
VITE_ODOO_BASE_URL=http://localhost
VITE_ODOO_PORT=8069
VITE_ODOO_DB=odoo19
VITE_ODOO_AUTH_TYPE=session
VITE_DISABLE_ODOO_PROXY=false  # 设置为 true 可禁用代理，测试直接连接
```

登录 Oweb 时使用与 Odoo 相同的库名、登录名和密码（见上文「本机 Odoo 库与管理员」）。

### TypeScript 类型生成（`odoo-codegen`）

`packages/odoo-codegen` 通过 **BFF**（`odoo-web-server`）登录并调用 `fields_get`，将 `config/models.json` 中的模型生成到 `packages/odoo-types/src/generated/`。

**前置条件**：

1. Docker 栈已启动：`cd docker && docker compose up -d`
2. BFF 可访问：本机 `http://localhost:3000`（`server` 服务）或本地运行的 `odoo-web-server`
3. Odoo 中已安装需要生成类型的模块（例如 HR：`hr` 为 `installed`）

**推荐命令**（生成 manifest 中的全部模型，勿单独 `--models` 以免覆盖 `index.ts` 仅保留子集）：

```bash
cd packages/odoo-codegen

export ODOO_URL=http://localhost:3000
export ODOO_DB=odoo19
export ODOO_LOGIN=admin@admin.com
export ODOO_PASSWORD=admin   # 改为你的管理员密码

bun run generate
```

仅检查是否与 Odoo 一致、不写文件：

```bash
bun run generate --check
```

**CI / 预提交**：在能连上 Odoo 的环境用相同变量；无 Odoo 时跳过生成，依赖仓库内已提交的 `generated/`。

**常见错误**：

| 现象 | 原因 | 处理 |
|:---|:---|:---|
| `database "odoo" does not exist` | 默认 `ODOO_DB=odoo` 与本机库名不符 | 设为 `odoo19` 或 `psql` 查到的库名 |
| `Access Denied` | 登录名或密码错误 | 使用 `admin@admin.com` 及建库密码，勿用 `admin` 作登录名 |
| `Login failed: 401` 且 BFF 不可达 | `server` 未启动或端口未映射 | `docker compose ps`，确认 `3000:3000` 或改 `ODOO_URL` |
| `index.ts` 只剩 HR 导出 | 使用了 `--models hr.*` 未再全量生成 | 再执行一次无参数的 `bun run generate` |

更完整的设计说明在本地 `docs/`（已 gitignore，不入远程仓库）；克隆后可在工作区查看 `docs/ODOO_CODEGEN_AND_TYPES.md` 等文件。

## 注意事项

### 1. 原生纯净配置

- ✅ 不包含任何自定义插件
- ✅ 不挂载 `./addons` 目录
- ✅ 只使用 Odoo 官方插件

### 2. CORS 配置

- ✅ 使用 Odoo 19 原生 CORS 配置
- ✅ 不需要自定义 CORS 模块（如 `hl8_cors`）
- ✅ 依赖浏览器自动发送 Cookie

### 3. 会话管理

- ✅ 使用标准 HTTP Cookie 机制
- ✅ 浏览器自动发送 Cookie（`credentials: 'include'`）
- ✅ Odoo 服务器从 Cookie 中读取 `session_id`

## 故障排除

### 问题：无法连接 Odoo

**检查**:

1. 确认服务正在运行: `docker-compose ps`
2. 查看日志: `docker-compose logs web`
3. 检查端口: `netstat -an | grep 8069`

### 问题：CORS 错误

**解决方案**:

1. 开发环境：使用 Vite 代理（推荐）
2. 生产环境：使用 Nginx 反向代理
3. 确保 Odoo 路由配置了 `cors='*'`

### 问题：数据库连接失败

**检查**:

1. 确认数据库服务正在运行: `docker-compose ps db`
2. 检查数据库连接配置: `config/odoo.conf`
3. 查看数据库日志: `docker-compose logs db`

### 问题：codegen 登录失败

**检查**:

1. `ODOO_DB` 是否为实际库名（常见为 `odoo19`）
2. `ODOO_LOGIN` 是否为 Odoo 用户登录名（常见为 `admin@admin.com`）
3. `curl -s -X POST http://localhost:3000/api/session/login -H 'Content-Type: application/json' -d '{"db":"odoo19","login":"admin@admin.com","password":"YOUR_PASSWORD"}'` 是否返回 200

## 升级和维护

### 升级 Odoo 版本

```bash
# 停止服务
docker-compose down

# 更新镜像版本（在 docker-compose.yml 中）
# image: odoo:19.0 -> odoo:20.0

# 启动服务
docker-compose up -d
```

### 清理数据

**警告**: 这将删除所有数据！

```bash
docker-compose down -v
```

## 相关文档

- [Odoo 官方文档](https://www.odoo.com/documentation/19.0/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
