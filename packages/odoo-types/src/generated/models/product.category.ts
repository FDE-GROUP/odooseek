// Auto-generated from product.category (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** product.category */
export interface ProductCategoryRecord extends BaseRecord {
  /** Stock Variation Account — At closing, register the inventory variation of the period into a specific account */
  account_stock_variation_id: [number, string] /* account.account */ | false
  /** Use Anglo-Saxon Accounting — If checked, the product will be valued using the Anglo-Saxon accounting method. */
  anglo_saxon_accounting: boolean
  /** Child Categories */
  child_id: number[] /* product.category */
  /** Complete Name */
  complete_name: string | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** stock.putaway.rule */
  filter_for_stock_putaway_rule: boolean
  /** Has Message */
  has_message: boolean
  /** Attachment Count */
  message_attachment_count: number | false
  /** Followers */
  message_follower_ids: number[] /* mail.followers */
  /** Message Delivery error — If checked, some messages have a delivery error. */
  message_has_error: boolean
  /** Number of errors — Number of messages with delivery error */
  message_has_error_counter: number | false
  /** SMS Delivery error — If checked, some messages have a delivery error. */
  message_has_sms_error: boolean
  /** Messages */
  message_ids: number[] /* mail.message */
  /** Is Follower */
  message_is_follower: boolean
  /** Action Needed — If checked, new messages require your attention. */
  message_needaction: boolean
  /** Number of Actions — Number of messages requiring action */
  message_needaction_counter: number | false
  /** Followers (Partners) */
  message_partner_ids: number[] /* res.partner */ | false
  /** Name */
  name: string
  /** Reserve Packagings — Reserve Only Full Packagings: will not reserve partial packagings. If customer orders 2 pallets of 1000 units each and you only have 1600 in stock, then only 1000 will be reserved
Reserve Partial Packagings: allow reserving partial packagings. If customer orders 2 pallets of 1000 units each and you only have 1600 in stock, then 1600 will be reserved */
  packaging_reserve_method: 'full' | 'partial' | false
  /** Parent Category */
  parent_id: [number, string] /* product.category */ | false
  /** Parent Path */
  parent_path: string | false
  /** Parent Routes */
  parent_route_ids: number[] /* stock.route */ | false
  /** # Products — The number of products under this category (Does not consider the children categories) */
  product_count: number | false
  /** Product Properties */
  product_properties_definition: unknown | false
  /** Expense Account — The expense is accounted for when a vendor bill is validated, except in anglo-saxon accounting with perpetual inventory valuation in which case the expense (Cost of Goods Sold account) is recognized at the customer invoice validation. */
  property_account_expense_categ_id: [number, string] /* account.account */ | false
  /** Income Account — This account will be used when validating a customer invoice. */
  property_account_income_categ_id: [number, string] /* account.account */ | false
  /** Costing Method — Standard Price: The products are valued at their standard cost defined on the product.
        Average Cost (AVCO): The products are valued at weighted average cost.
        First In First Out (FIFO): The products are valued supposing those that enter the company first will also leave it first.
         */
  property_cost_method: 'standard' | 'fifo' | 'average' | false
  /** Price Difference Account — With perpetual valuation, this account will hold the price difference between the standard price and the bill price. */
  property_price_difference_account_id: [number, string] /* account.account */ | false
  /** Production Account — This account will be used as a valuation counterpart for both components and final products for manufacturing orders.
                If there are any workcenter/employee costs, this value will remain on the account once the production is completed. */
  property_stock_account_production_cost_id: [number, string] /* account.account */ | false
  /** Stock Journal — When doing automated inventory valuation, this is the Accounting Journal in which entries will be automatically posted when stock moves are processed. */
  property_stock_journal: [number, string] /* account.journal */ | false
  /** Stock Valuation Account — When automated inventory valuation is enabled on a product, this account will hold the current value of the products. */
  property_stock_valuation_account_id: [number, string] /* account.account */ | false
  /** Inventory Valuation — Periodic: The accounting entries are suggested manually in the inventory valuation report.
        Perpetual: An accounting entry is automatically created to value the inventory when a product is billed or invoiced.
         */
  property_valuation: 'periodic' | 'real_time' | false
  /** Putaway Rules */
  putaway_rule_ids: number[] /* stock.putaway.rule */
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Force Removal Strategy — Set a specific removal strategy that will be used regardless of the source location for this product category.

FIFO: products/lots that were stocked first will be moved out first.
LIFO: products/lots that were stocked last will be moved out first.
Closest location: products/lots closest to the target location will be moved out first.
FEFO: products/lots with the closest removal date will be moved out first (the availability of this method depends on the "Expiration Dates" setting).
Least Packages: FIFO but with the least number of packages possible when there are several packages containing the same product. */
  removal_strategy_id: [number, string] /* product.removal */ | false
  /** Routes */
  route_ids: number[] /* stock.route */ | false
  /** Total routes */
  total_route_ids: number[] /* stock.route */ | false
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for product.category */
export type ProductCategoryFieldName = ModelFieldName<ProductCategoryRecord>

/** Typed search_read result */
export type ProductCategorySearchResult = ModelRecord<ProductCategoryRecord>
