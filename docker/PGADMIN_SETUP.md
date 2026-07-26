# pgAdmin4 使用指南

## 📋 概述

pgAdmin4 是一个用于管理和开发 PostgreSQL 数据库的 Web 界面工具。本文档说明如何在 Docker 环境中使用 pgAdmin4 连接和管理 Odoo 数据库。

## 🚀 快速开始

### 1. 启动服务

```bash
cd docker
docker compose up -d pgadmin
```

### 2. 访问 pgAdmin4

打开浏览器访问：`http://localhost:25050`

### 3. 登录

- **邮箱**：`admin@admin.com`
- **密码**：`admin`

## 🔌 连接 PostgreSQL 数据库

### 步骤 1：添加服务器

1. 登录 pgAdmin4 后，右键点击左侧的 **"Servers"**
2. 选择 **"Register" → "Server"**

### 步骤 2：配置连接

在 **"General"** 标签页：

- **Name**：`Odoo Database`（或任意名称）

在 **"Connection"** 标签页：

- **Host name/address**：`db`（Docker 服务名称）
- **Port**：`5432`
- **Maintenance database**：`postgres`
- **Username**：`odoo`
- **Password**：`odoo`
- ✅ **Save password**（可选，方便后续使用）

### 步骤 3：测试连接

点击 **"Save"** 保存配置。如果配置正确，pgAdmin4 会连接到 PostgreSQL 数据库。

## 📊 常用操作

### 查看数据库列表

1. 展开 **"Servers" → "Odoo Database" → "Databases"**
2. 可以看到所有数据库，包括：
   - `postgres`（默认数据库）
   - `odoo19`（Odoo 数据库，如果已创建）

### 执行 SQL 查询

1. 选择目标数据库（如 `odoo19`）
2. 点击工具栏的 **"Query Tool"** 图标
3. 在查询编辑器中输入 SQL 语句
4. 点击 **"Execute"** 或按 `F5` 执行

### 查看表结构

1. 展开数据库 → **"Schemas" → "public" → "Tables"**
2. 可以看到所有表，例如：
   - `res_users`（用户表）
   - `product_template`（产品模板表）
   - `res_partner`（合作伙伴表）

### 查看表数据

1. 右键点击表名
2. 选择 **"View/Edit Data" → "All Rows"**
3. 可以查看和编辑表数据

## 🔧 配置说明

### 环境变量

在 `docker-compose.yml` 中配置的环境变量：

```yaml
environment:
  - PGADMIN_DEFAULT_EMAIL=admin@admin.com # 默认登录邮箱
  - PGADMIN_DEFAULT_PASSWORD=admin # 默认登录密码
  - PGADMIN_CONFIG_SERVER_MODE=False # 服务器模式（单用户模式）
  - PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED=False # 不需要主密码
```

### 端口映射

- **容器端口**：`80`
- **主机端口**：`25050`
- **访问地址**：`http://localhost:25050`

### 数据持久化

pgAdmin4 的配置和数据存储在 Docker volume `pgadmin-data` 中，即使容器重启也不会丢失。

## 🛠️ 故障排除

### 问题 1：无法连接到数据库

**症状**：在 pgAdmin4 中添加服务器时提示连接失败

**解决方案**：

1. **检查服务是否运行**：

   ```bash
   docker compose ps
   ```

2. **检查网络连接**：
   - 确保使用 `db` 作为主机名（Docker 服务名称）
   - 不要使用 `localhost` 或 `127.0.0.1`

3. **检查数据库凭据**：
   - 用户名：`odoo`
   - 密码：`odoo`
   - 数据库：`postgres`（维护数据库）或 `odoo19`（Odoo 数据库）

### 问题 2：忘记密码

**解决方案**：

1. **重置 pgAdmin4 密码**：

   ```bash
   docker compose exec pgadmin python /usr/pgadmin4/web/setup.py
   ```

2. **或者删除 volume 重新创建**：
   ```bash
   docker compose down -v
   docker compose up -d
   ```

### 问题 3：无法访问 pgAdmin4

**解决方案**：

1. **检查容器状态**：

   ```bash
   docker compose logs pgadmin
   ```

2. **检查端口是否被占用**：

   ```bash
   netstat -tuln | grep 25050
   ```

3. **重启服务**：
   ```bash
   docker compose restart pgadmin
   ```

## 📝 常用 SQL 查询示例

### 查看所有数据库

```sql
SELECT datname FROM pg_database;
```

### 查看所有表

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

### 查看用户表

```sql
SELECT id, login, name, active
FROM res_users
ORDER BY id;
```

### 查看产品表

```sql
SELECT id, name, list_price, active
FROM product_template
ORDER BY id
LIMIT 100;
```

### 查看数据库大小

```sql
SELECT pg_size_pretty(pg_database_size('odoo19')) AS size;
```

## 🔒 安全建议

### 生产环境

1. **修改默认密码**：

   ```yaml
   environment:
     - PGADMIN_DEFAULT_PASSWORD=your_strong_password
   ```

2. **限制访问**：
   - 不要将 pgAdmin4 端口暴露到公网
   - 使用防火墙限制访问
   - 考虑使用 VPN 或 SSH 隧道

3. **使用 HTTPS**：
   - 配置 SSL 证书
   - 使用反向代理（如 Nginx）

4. **定期更新**：
   ```bash
   docker compose pull pgadmin
   docker compose up -d pgadmin
   ```

## 📚 参考资源

- [pgAdmin4 官方文档](https://www.pgadmin.org/docs/)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [Docker pgAdmin4 镜像](https://hub.docker.com/r/dpage/pgadmin4/)

---

**文档版本**：1.0  
**最后更新**：2025-12-10  
**维护者**：HL8 Team
