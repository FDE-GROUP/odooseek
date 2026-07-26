# -*- coding: utf-8 -*-

import base64
import csv
import io
import json
import logging
from datetime import datetime

from odoo import api, fields, models
from odoo.exceptions import AccessError, UserError

_logger = logging.getLogger(__name__)


class L8ExportJob(models.Model):
    """
    L8 导出任务

    业务规则（中文说明）：
    - 任务由用户发起创建，默认进入 pending
    - cron 周期性拉取 pending 任务并执行（running -> done/failed/cancelled）
    - 执行过程中按批次更新 processed/total，方便前端轮询展示进度
    - 导出结果保存为 ir.attachment，前端可通过 /web/content/{attachment_id}?download=true 下载
    - 仅允许任务创建者访问/取消自己的任务（通过 record rule 限制）
    """

    _name = "l8.export.job"
    _description = "L8 导出任务"
    _order = "create_date desc, id desc"

    name = fields.Char(string="任务名称", required=True, default="导出任务")
    user_id = fields.Many2one("res.users", string="创建人", required=True, default=lambda self: self.env.user)

    state = fields.Selection(
        [
            ("pending", "待处理"),
            ("running", "处理中"),
            ("done", "已完成"),
            ("failed", "失败"),
            ("cancelled", "已取消"),
        ],
        string="状态",
        required=True,
        default="pending",
        index=True,
    )

    model = fields.Char(string="模型", required=True, index=True)
    file_name = fields.Char(string="文件名", required=True, default="export.csv")

    fields_json = fields.Text(string="导出字段(JSON)", required=True)
    domain_json = fields.Text(string="导出域(JSON)", required=True, default="[]")
    context_json = fields.Text(string="上下文(JSON)", required=True, default="{}")

    total = fields.Integer(string="总条数", default=0)
    processed = fields.Integer(string="已处理条数", default=0)

    started_at = fields.Datetime(string="开始时间")
    finished_at = fields.Datetime(string="结束时间")
    error_message = fields.Text(string="错误信息")

    attachment_id = fields.Many2one("ir.attachment", string="导出文件", ondelete="set null")

    progress = fields.Float(string="进度(%)", compute="_compute_progress", store=False)

    @api.depends("total", "processed")
    def _compute_progress(self):
        for rec in self:
            if rec.total and rec.total > 0:
                rec.progress = min(100.0, max(0.0, (rec.processed / rec.total) * 100.0))
            else:
                rec.progress = 0.0

    # -----------------------------
    # RPC API（供前端调用）
    # -----------------------------

    @api.model
    def create_export_csv(self, model, fields_list, domain=None, context=None, file_name=None):
        """
        创建 CSV 导出任务

        :param model: 模型名（例如 res.partner）
        :param fields_list: 导出字段数组（[{name,label}, ...]）
        :param domain: Odoo domain（list）
        :param context: context（dict）
        :param file_name: 文件名（可选）
        :return: job id
        """
        if not model or not isinstance(model, str):
            raise UserError("模型参数不合法")
        if not isinstance(fields_list, (list, tuple)) or not fields_list:
            raise UserError("导出字段不能为空")

        normalized_fields = []
        for f in fields_list:
            if not isinstance(f, dict):
                continue
            name = f.get("name")
            label = f.get("label") or name
            if isinstance(name, str) and name:
                normalized_fields.append({"name": name, "label": label})
        if not normalized_fields:
            raise UserError("导出字段格式不正确")

        job = self.create(
            {
                "name": "导出任务",
                "user_id": self.env.user.id,
                "model": model,
                "file_name": file_name or f"{model}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.csv",
                "fields_json": json.dumps(normalized_fields, ensure_ascii=False),
                "domain_json": json.dumps(domain or [], ensure_ascii=False),
                "context_json": json.dumps(context or {}, ensure_ascii=False),
                "state": "pending",
                "total": 0,
                "processed": 0,
                "error_message": False,
                "attachment_id": False,
                "started_at": False,
                "finished_at": False,
            }
        )
        return job.id

    def cancel_job(self):
        """
        取消导出任务

        说明：
        - pending/running 可取消
        - done/failed/cancelled 不可再次取消
        """
        self.ensure_one()
        if self.user_id.id != self.env.user.id and not self.env.user.has_group("base.group_system"):
            raise AccessError("无权限取消该导出任务")

        if self.state in ("done", "failed", "cancelled"):
            return False
        self.write({"state": "cancelled", "finished_at": fields.Datetime.now()})
        return True

    @api.model
    def list_my_jobs(self, limit=50):
        """
        获取当前用户的导出任务列表（用于前端轮询）
        """
        jobs = self.search([("user_id", "=", self.env.user.id)], limit=int(limit or 50))
        return jobs._to_frontend_dict()

    def read_job(self):
        """
        获取单个任务信息（用于前端详情刷新）
        """
        self.ensure_one()
        return self._to_frontend_dict()[0]

    def _to_frontend_dict(self):
        """
        转为前端友好的结构
        """
        res = []
        for job in self:
            res.append(
                {
                    "id": job.id,
                    "name": job.name,
                    "state": job.state,
                    "model": job.model,
                    "file_name": job.file_name,
                    "total": job.total,
                    "processed": job.processed,
                    "progress": job.progress,
                    "error_message": job.error_message,
                    "create_date": job.create_date,
                    "write_date": job.write_date,
                    "started_at": job.started_at,
                    "finished_at": job.finished_at,
                    "attachment_id": job.attachment_id.id if job.attachment_id else False,
                }
            )
        return res

    # -----------------------------
    # Cron 执行逻辑
    # -----------------------------

    @api.model
    def _cron_process_export_jobs(self):
        """
        cron 入口：处理 pending 的导出任务

        说明：
        - 单次只处理 1 个任务，避免占用过长时间
        - 处理中会分批 commit，使进度可见（开发/单进程模式建议；生产需谨慎评估）
        """
        job = self.search([("state", "=", "pending")], limit=1)
        if not job:
            return
        try:
            job._run_export_job()
        except Exception as e:
            _logger.exception("导出任务执行异常：%s", e)
            try:
                job.write(
                    {
                        "state": "failed",
                        "error_message": str(e),
                        "finished_at": fields.Datetime.now(),
                    }
                )
                self.env.cr.commit()
            except Exception:
                pass

    def _run_export_job(self):
        self.ensure_one()

        if self.state != "pending":
            return

        self.write(
            {
                "state": "running",
                "started_at": fields.Datetime.now(),
                "error_message": False,
                "processed": 0,
                "attachment_id": False,
                "finished_at": False,
            }
        )
        self.env.cr.commit()

        try:
            fields_list = json.loads(self.fields_json or "[]")
            domain = json.loads(self.domain_json or "[]")
            ctx = json.loads(self.context_json or "{}")
        except Exception as e:
            raise UserError(f"任务参数解析失败：{e}")

        Model = self.env[self.model].with_user(self.user_id).with_context(ctx)

        total = Model.search_count(domain)
        self.write({"total": total})
        self.env.cr.commit()

        output = io.StringIO()
        writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)
        header = [f.get("label") or f.get("name") for f in fields_list]
        writer.writerow(header)

        page_size = 1000
        offset = 0
        processed = 0

        while offset < total:
            self.flush()
            self.invalidate_cache()

            if self.state == "cancelled":
                self.write({"finished_at": fields.Datetime.now()})
                self.env.cr.commit()
                return

            rows = Model.search_read(domain, [f.get("name") for f in fields_list], limit=page_size, offset=offset)
            if not rows:
                break

            for row in rows:
                line = []
                for f in fields_list:
                    name = f.get("name")
                    val = row.get(name)
                    if isinstance(val, (list, tuple)) and len(val) == 2 and isinstance(val[1], str):
                        line.append(val[1])
                    else:
                        line.append(val if val is not None else "")
                writer.writerow(line)

            processed += len(rows)
            offset += len(rows)
            self.write({"processed": processed})
            self.env.cr.commit()

        csv_text = output.getvalue()
        csv_bytes = csv_text.encode("utf-8-sig")
        datas = base64.b64encode(csv_bytes)

        attachment = self.env["ir.attachment"].sudo().create(
            {
                "name": self.file_name,
                "type": "binary",
                "datas": datas,
                "mimetype": "text/csv",
                "res_model": self._name,
                "res_id": self.id,
            }
        )

        self.write(
            {
                "state": "done",
                "attachment_id": attachment.id,
                "finished_at": fields.Datetime.now(),
            }
        )
        self.env.cr.commit()


