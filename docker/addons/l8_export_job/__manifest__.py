# -*- coding: utf-8 -*-
{
    "name": "L8 Export Job",
    "summary": "后台导出任务（CSV），支持进度、取消与导出历史",
    "description": """
后台导出任务（CSV）

功能：
- 以后台任务方式导出大数据量 CSV，避免前端内存与网络中断问题
- 任务状态：待处理/处理中/已完成/失败/已取消
- 进度：已处理条数/总条数
- 结果保存为 ir.attachment，可通过 /web/content 下载

说明：
- 任务执行由 ir.cron 轮询处理（默认每分钟）
- 仅允许任务创建者查看/取消/下载自己的导出任务
""",
    "author": "L8 ERP Team",
    "website": "https://www.fibotree.com",
    "category": "Tools",
    "version": "0.1",
    "license": "LGPL-3",
    "depends": ["base"],
    "data": [
        "security/ir.model.access.csv",
        "security/record_rule.xml",
        "data/cron.xml",
    ],
    "demo": [],
}


