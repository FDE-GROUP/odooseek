# HR Settings — Odoo vs oweb

This document describes which HR configuration lives in Odoo backend vs what oweb Settings exposes.

## Writable in oweb (`/settings` → Human Resources)

Presence controls (via `res.config.settings`, HR Manager only):

| Field | Description |
|:------|:------------|
| `module_hr_presence` | Enable advanced presence control |
| `hr_presence_control_login` | Mark present when user is logged in |
| `hr_presence_control_email` | Mark present based on emails sent |
| `hr_presence_control_email_amount` | Minimum emails per hour |
| `hr_presence_control_ip` | Mark present based on IP |
| `hr_presence_control_ip_list` | Allowed corporate IPs (comma-separated) |
| `module_hr_attendance` | Mark present based on attendances |

Read-only in oweb: contract/work permit notice periods.

## Odoo backend only

- Module installation toggles (`module_hr_skills`, payroll modules, …)
- Company working hours (`resource_calendar_id`)
- User account creation / `user_id` linking on employees
- Scheduled jobs (cron)

## Cron jobs (Odoo container)

| Job | Method | Interval |
|:----|:-------|:---------|
| Expiring contract/work permit notice | `hr.employee.notify_expiring_contract_work_permit()` | Daily |
| Update current employee version | `hr.employee._cron_update_current_version_id()` | Daily |

Cron runs inside Odoo (`ir.cron`). oweb does not trigger or proxy these jobs.

**Operations (Docker Compose):**

```bash
docker compose logs -f web    # watch Odoo logs including cron
```

Manual trigger (Odoo shell):

```bash
docker compose exec web odoo shell -d YOUR_DB --no-http
# >>> env['hr.employee']._cron_update_current_version_id()
```

## User ↔ employee sync

Odoo 19 does not ship a dedicated user↔employee sync cron. Link employees to users via `hr.employee.user_id` in the employee form or Settings → Users in Odoo.
