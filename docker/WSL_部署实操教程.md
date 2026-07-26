# Odoo 19.0 Docker 部署实操教程（WSL 环境）

## 目录

1. [概述](#概述)
2. [环境准备](#环境准备)
3. [安装 Docker Desktop](#安装-docker-desktop)
4. [修复 WSL Docker 权限](#修复-wsl-docker-权限)
5. [检查构建条件](#检查构建条件)
6. [更新 Dockerfile (Odoo 版本适配)](#更新-dockerfile)
7. [构建 odoo:19.0 镜像](#构建-odoo190-镜像)
8. [docker-compose 依赖检查](#docker-compose-依赖检查)
9. [启动全部服务](#启动全部服务)
10. [验证服务状态](#验证服务状态)
11. [访问服务](#访问服务)
12. [故障记录](#故障记录)

---

## 概述

本教程记录在 **Windows WSL + Docker Desktop** 环境下，从零部署 Odoo 19.0 + PostgreSQL + Nginx + pgAdmin 服务的完整实操过程。

实际部署架构：

```
docker-compose.yml
├── gateway (nginx:1.27-alpine)   → 统一入口 :8080
├── web (odoo:19.0)               → Odoo 服务 :8069
├── db (postgres:16)              → 数据库 :5432
└── pgadmin (dpage/pgadmin4)      → 数据库管理 :25050
```

### 部署环境

| 项目 | 详情 |
|------|------|
| 操作系统 | Windows + WSL (Ubuntu) |
| Docker | Docker Desktop 4.64.0 |
| Docker CLI | 29.2.1 |
| Docker Compose | 2.0+ |
| 磁盘空间 | 895G 可用 / 1T 总容量 |
| 内存 | 11 GB |

---

## 环境准备

### 前置条件

1. Windows 已启用 WSL2
2. 已安装 Docker Desktop for Windows
3. WSL 发行版中已安装 Docker CLI（随 Docker Desktop 自动提供）

### 验证 Docker Desktop 集成

在 Windows 中启动 Docker Desktop 后，打开 WSL 终端验证：

```bash
docker version
```

如果输出包含 Client 和 Server 信息，说明 Docker Desktop 已被 WSL 识别。

---

## 安装 Docker Desktop

如尚未安装，参考以下步骤（本次环境已具备，仅记录）。

### Windows 端

1. 下载 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
2. 安装时勾选 "Use WSL 2 instead of Hyper-V"
3. 安装完成后启动 Docker Desktop

### 启用 WSL 集成

在 Docker Desktop 设置中：

1. 进入 **Settings → Resources → WSL Integration**
2. 启用当前的 WSL 发行版
3. 点击 **Apply & Restart**

### WSL 端验证

```bash
docker --version
# Docker version 29.2.1

docker compose version
# Docker Compose version v2.x.x
```

---

## 修复 WSL Docker 权限

### 问题现象

```bash
docker ps
# permission denied while trying to connect to the docker API
# at unix:///var/run/docker.sock
```

### 原因分析

WSL 中 Docker socket (`/var/run/docker.sock`) 属于 `root:docker` 组，当前用户未加入 `docker` 组：

```bash
ls -la /var/run/docker.sock
# srw-rw---- 1 root docker 0 ... /var/run/docker.sock

groups
# abel adm dialout cdrom ...  (不含 docker)
```

### 解决方案

```bash
# 1. 将用户加入 docker 组（一次性操作）
sudo usermod -aG docker $USER

# 2. 刷新组权限（无需重新登录）
newgrp docker

# 3. 验证
docker ps
# CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

> **注意**：`newgrp docker` 仅在当前终端会话生效。打开新终端时，若用户已在 docker 组中则自动生效。

---

## 检查构建条件

### 1. 文件完整性

构建 `odoo:19.0` 镜像需要以下文件：

```bash
ls docker/19.0/
# Dockerfile  entrypoint.sh  odoo.conf  wait-for-psql.py  培训教程.md
```

| 文件 | 状态 |
|------|------|
| `Dockerfile` | ✅ 存在 |
| `entrypoint.sh` | ✅ 存在 |
| `odoo.conf` | ✅ 存在 |
| `wait-for-psql.py` | ✅ 存在 |

### 2. 网络可达性

```bash
# 测试基础镜像
docker pull --quiet ubuntu:noble
# (成功拉取)

# 测试 Odoo 夜间构建源
curl -sI http://nightly.odoo.com/19.0/nightly/deb/
# HTTP/1.1 200 OK
```

### 3. 系统资源

```bash
df -h /       # 磁盘: 895G 可用
free -h       # 内存: 11G
```

### 4. Odoo 夜间构建版本检查

**关键发现**：Dockerfile 中指定的 `ODOO_RELEASE=20251208` 已从 Odoo 夜间构建服务器移除。

```bash
# 查询当前可用版本
curl -s http://nightly.odoo.com/19.0/nightly/deb/ \
  | grep -oP 'odoo_19\.0\.\d+_all\.deb' | sort -u | tail -5
# odoo_19.0.20260524_all.deb
# odoo_19.0.20260525_all.deb
# odoo_19.0.20260526_all.deb
# odoo_19.0.20260527_all.deb   ← 最新
```

获取最新版本的 SHA1 校验和：

```bash
curl -sSLO http://nightly.odoo.com/19.0/nightly/deb/odoo_19.0.20260527_all.deb
sha1sum odoo_19.0.20260527_all.deb
# b4b0c5ca67fbb215230458f8aa410b7c4c22c158
rm odoo_19.0.20260527_all.deb
```

---

## 更新 Dockerfile

### 修改内容

> **文件**：`docker/19.0/Dockerfile`  
> **位置**：第 74-75 行

**修改前**：
```dockerfile
ARG ODOO_RELEASE=20251208
ARG ODOO_SHA=76c8b61b443676477eea546635aca37b8431dd9d
```

**修改后**：
```dockerfile
ARG ODOO_RELEASE=20260527
ARG ODOO_SHA=b4b0c5ca67fbb215230458f8aa410b7c4c22c158
```

### 验证修改

```bash
sed -n '73,76p' docker/19.0/Dockerfile
# ENV ODOO_VERSION 19.0
# ARG ODOO_RELEASE=20260527
# ARG ODOO_SHA=b4b0c5ca67fbb215230458f8aa410b7c4c22c158
# RUN curl -o odoo.deb -sSL ...
```

---

## 构建 odoo:19.0 镜像

### 执行构建

```bash
docker build -t odoo:19.0 docker/19.0/
```

### 构建过程

| 步骤 | 内容 | 耗时 |
|------|------|------|
| `[1/9]` | 拉取 `ubuntu:noble` 基础镜像 | - |
| `[2/9]` | 安装系统依赖 + wkhtmltopdf | ~162s |
| `[3/9]` | 安装 PostgreSQL 客户端 | ~16s |
| `[4/9]` | 安装 rtlcss (npm) | ~2s |
| `[5/9]` | 下载并安装 Odoo 19.0 | ~108s |
| `[6/9]` | 复制 entrypoint.sh | <1s |
| `[7/9]` | 复制 odoo.conf | <1s |
| `[8/9]` | 设置权限 | <1s |
| `[9/9]` | 复制 wait-for-psql.py | <1s |
| 导出 | 导出镜像层 | ~11s |

**总耗时**：约 5 分钟（实际约 300s，含 Odoo 包下载）。

### 构建结果

```bash
docker images | grep odoo
# odoo   19.0   sha256:9e560...   ... ago   xxx MB
```

> **构建警告**（可忽略）：
> - `MaintainerDeprecated`: Dockerfile 第 2 行使用了已弃用的 `MAINTAINER` 指令
> - `LegacyKeyValueFormat`: 部分 `ENV` 指令使用了旧格式，建议改为 `ENV key=value`

---

## docker-compose 依赖检查

`docker-compose.yml` 引用了以下挂载路径，需要在启动前确认：

```bash
# ┌─ docker-compose.yml 中的挂载 ──────────────────────────────────────┐
# │ ./config              → /etc/odoo           (Odoo 配置文件)       │
# │ ./nginx/default.conf  → Nginx 配置          (反向代理配置)        │
# │ ../apps/oweb/dist     → Nginx 静态资源      (前端 Vite 产物)      │
# └───────────────────────────────────────────────────────────────────┘
```

### 检查结果

| 路径 | 状态 | 处理 |
|------|------|------|
| `docker/config/odoo.conf` | ✅ 存在 | 无需操作 |
| `docker/nginx/default.conf` | ✅ 存在 | 无需操作 |
| `apps/oweb/dist/` | ❌ 不存在 | 创建空目录 `mkdir -p apps/oweb/dist` |

> **说明**：`apps/oweb/dist/` 是 Oweb 前端 Vite 构建产物目录。当前为空目录意味着 Nginx 网关将不提供前端页面（仅作为反向代理转发 Odoo API 请求）。如需前端功能，后续构建 Oweb 项目后会自动填充。

```bash
mkdir -p apps/oweb/dist
```

---

## 启动全部服务

### 执行命令

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

### 启动过程

Docker Compose 自动完成以下操作：

1. **拉取外部镜像**：
   - `nginx:1.27-alpine` (gateway)
   - `postgres:16` (db)
   - `dpage/pgadmin4` (pgadmin)

2. **创建数据卷**：
   - `docker_odoo-web-data` → Odoo 文件存储
   - `docker_odoo-db-data` → PostgreSQL 数据
   - `docker_pgadmin-data` → pgAdmin 配置

3. **启动容器**（按依赖顺序）：
   ```
   db → web + pgadmin → gateway
   ```

### 启动日志

```
Volume docker_pgadmin-data    Created
Volume docker_odoo-web-data   Created
Volume docker_odoo-db-data    Created
Container docker-db-1         Starting → Started
Container docker-web-1        Starting → Started
Container docker-pgadmin-1    Starting → Started
Container docker-gateway-1    Starting → Started
```

✅ 全部 4 个服务启动成功。

---

## 验证服务状态

### 查看运行容器

```bash
docker compose -f docker/docker-compose.yml ps
```

**输出**：

```
NAME               IMAGE               STATUS         PORTS
docker-db-1        postgres:16         Up            5432/tcp
docker-gateway-1   nginx:1.27-alpine   Up            0.0.0.0:8080->80/tcp
docker-pgadmin-1   dpage/pgadmin4      Up            0.0.0.0:25050->80/tcp
docker-web-1       odoo:19.0           Up            0.0.0.0:8069->8069/tcp
```

### 服务状态汇总

| 服务 | 容器名 | 镜像 | 端口映射 | 状态 |
|------|--------|------|----------|------|
| Odoo | docker-web-1 | odoo:19.0 | `8069:8069` | ✅ Running |
| PostgreSQL | docker-db-1 | postgres:16 | `5432` (内部) | ✅ Running |
| Nginx | docker-gateway-1 | nginx:1.27-alpine | `8080:80` | ✅ Running |
| pgAdmin | docker-pgadmin-1 | dpage/pgadmin4 | `25050:80` | ✅ Running |

### 查看 Odoo 日志（确认无报错）

```bash
docker logs docker-web-1 --tail 20
```

---

## 访问服务

| 服务 | 地址 | 说明 |
|------|------|------|
| **Odoo Web** | http://localhost:8069 | Odoo 主界面 |
| **统一入口** | http://localhost:8080 | Nginx 反向代理入口 |
| **pgAdmin** | http://localhost:25050 | 数据库管理工具 |

### pgAdmin 登录信息

| 字段 | 值 |
|------|-----|
| 邮箱 | `admin@admin.com` |
| 密码 | `admin` |

### 数据库连接信息（在 pgAdmin 中添加服务器）

| 字段 | 值 |
|------|-----|
| 主机 | `db` (容器内网络) |
| 端口 | `5432` |
| 用户 | `odoo` |
| 密码 | `odoo` |
| 数据库 | `postgres` |

> **注意**：在 pgAdmin 中添加服务器时，主机名使用 `db`（Docker 内部网络 DNS），而非 `localhost`。

---

## 故障记录

### 故障 1：Docker 权限被拒绝

**现象**：
```
permission denied while trying to connect to the docker API
at unix:///var/run/docker.sock
```

**原因**：WSL 用户未加入 `docker` 组。

**解决**：
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### 故障 2：Dockerfile 中 Odoo 构建包 URL 返回 404

**现象**：
```
HTTP/1.1 404 Not Found
http://nightly.odoo.com/19.0/nightly/deb/odoo_19.0.20251208_all.deb
```

**原因**：Odoo 夜间构建服务器仅保留最近约 10 个构建版本，旧版本（20251208）已被移除。

**解决**：
1. 查询最新可用版本
2. 更新 Dockerfile 中 `ODOO_RELEASE` 和 `ODOO_SHA`
3. 重新构建

### 故障 3：apps/oweb/dist 目录不存在

**现象**：Nginx 容器启动时报挂载路径不存在。

**解决**：
```bash
mkdir -p apps/oweb/dist
```

---

## 常用命令速查

### 服务管理

```bash
# 启动所有服务
docker compose -f docker/docker-compose.yml up -d

# 停止所有服务
docker compose -f docker/docker-compose.yml down

# 停止并删除数据卷
docker compose -f docker/docker-compose.yml down -v

# 重启单个服务
docker compose -f docker/docker-compose.yml restart web

# 查看日志
docker compose -f docker/docker-compose.yml logs -f web
```

### 镜像管理

```bash
# 重新构建 odoo 镜像（更新版本时）
docker build -t odoo:19.0 docker/19.0/

# 清理未使用的镜像
docker image prune -a
```

### 容器内操作

```bash
# 进入 Odoo 容器
docker exec -it docker-web-1 bash

# 进入数据库容器
docker exec -it docker-db-1 bash

# 数据库备份
docker exec docker-db-1 pg_dump -U odoo postgres > backup_$(date +%Y%m%d).sql
```

---

## 部署架构图

```
                           Docker Network
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   :8080                :8069              :5432     :25050       │
│   ┌──────────┐       ┌──────────┐       ┌──────┐  ┌──────────┐ │
│   │  gateway  │──────▶│   web    │──────▶│  db  │  │ pgadmin  │ │
│   │  (nginx)  │  /api │  (odoo)  │       │(pg16)│  │          │ │
│   └──────────┘       └──────────┘       └──────┘  └──────────┘ │
│        │                    │                                │  │
│   ┌────▼────┐          ┌───▼────┐                    ┌──────▼──┐│
│   │  oweb   │          │odoo-web│                    │pgadmin  ││
│   │  dist   │          │  -data │                    │  -data  ││
│   │(空目录) │          │(Volume)│                    │(Volume) ││
│   └─────────┘          └────────┘                    └─────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

**文档版本**：1.0  
**操作日期**：2026-05-28  
**环境**：Windows WSL + Docker Desktop
