// Auto-generated from account.bank.statement (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** account.bank.statement */
export interface AccountBankStatementRecord extends BaseRecord {
  /** Attachments */
  attachment_ids: number[] /* ir.attachment */ | false
  /** Computed Balance */
  balance_end: number | false
  /** Ending Balance */
  balance_end_real: number | false
  /** Starting Balance */
  balance_start: number | false
  /** Company — Company related to this journal */
  company_id: [number, string] /* res.company */ | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Date */
  date: string | false
  /** First Line Index */
  first_line_index: string | false
  /** Is Complete */
  is_complete: boolean
  /** Is Valid */
  is_valid: boolean
  /** Has Invalid Statements */
  journal_has_invalid_statements: boolean
  /** Journal */
  journal_id: [number, string] /* account.journal */ | false
  /** Statement lines */
  line_ids: number[] /* account.bank.statement.line */
  /** Reference */
  name: string | false
  /** Problem Description */
  problem_description: string | false
  /** External Reference */
  reference: string | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for account.bank.statement */
export type AccountBankStatementFieldName = ModelFieldName<AccountBankStatementRecord>

/** Typed search_read result */
export type AccountBankStatementSearchResult = ModelRecord<AccountBankStatementRecord>
