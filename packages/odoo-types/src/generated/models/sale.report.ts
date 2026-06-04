// Auto-generated from sale.report (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** sale.report */
export interface SaleReportRecord extends BaseRecord {
  /** Order Reference */
  name: string | false
  /** Order Date */
  date: string | false
  /** Customer */
  partner_id: [number, string] /* res.partner */ | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Pricelist */
  pricelist_id: [number, string] /* product.pricelist */ | false
  /** Sales Team */
  team_id: [number, string] /* crm.team */ | false
  /** Salesperson */
  user_id: [number, string] /* res.users */ | false
  /** Status */
  state: 'draft' | 'sent' | 'sale' | 'cancel' | false
  /** Order Invoice Status */
  invoice_status: 'upselling' | 'invoiced' | 'to invoice' | 'no' | false
  /** Campaign */
  campaign_id: [number, string] /* utm.campaign */ | false
  /** Medium */
  medium_id: [number, string] /* utm.medium */ | false
  /** Source */
  source_id: [number, string] /* utm.source */ | false
  /** Customer Entity */
  commercial_partner_id: [number, string] /* res.partner */ | false
  /** Customer Country */
  country_id: [number, string] /* res.country */ | false
  /** Customer Industry */
  industry_id: [number, string] /* res.partner.industry */ | false
  /** Customer ZIP */
  partner_zip: string | false
  /** Customer State */
  state_id: [number, string] /* res.country.state */ | false
  /** Order */
  order_reference: unknown | false
  /** Product Category */
  categ_id: [number, string] /* product.category */ | false
  /** Product Variant */
  product_id: [number, string] /* product.product */ | false
  /** Product */
  product_tmpl_id: [number, string] /* product.template */ | false
  /** Unit */
  product_uom_id: [number, string] /* uom.uom */ | false
  /** Qty Ordered */
  product_uom_qty: number | false
  /** Qty To Deliver */
  qty_to_deliver: number | false
  /** Qty Delivered */
  qty_delivered: number | false
  /** Qty To Invoice */
  qty_to_invoice: number | false
  /** Qty Invoiced */
  qty_invoiced: number | false
  /** Untaxed Total */
  price_subtotal: number | false
  /** Total */
  price_total: number | false
  /** Untaxed Amount To Invoice */
  untaxed_amount_to_invoice: number | false
  /** Untaxed Amount Invoiced */
  untaxed_amount_invoiced: number | false
  /** Invoice Status */
  line_invoice_status: 'upselling' | 'invoiced' | 'to invoice' | 'no' | false
  /** Gross Weight */
  weight: number | false
  /** Volume */
  volume: number | false
  /** Unit Price */
  price_unit: number | false
  /** Discount % */
  discount: number | false
  /** Discount Amount */
  discount_amount: number | false
  /** # of Lines */
  nbr: number | false
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Warehouse */
  warehouse_id: [number, string] /* stock.warehouse */ | false
  /** Website */
  website_id: [number, string] /* website */ | false
  /** Abandoned Cart */
  is_abandoned_cart: boolean
  /** eCommerce Categories — The product will be available in each mentioned eCommerce category. Go to Shop > Edit Click on the page and enable \'Categories\' to view all eCommerce categories. */
  public_categ_ids: number[] /* product.public.category */ | false
  /** Project */
  project_id: [number, string] /* project.project */ | false
}

/** Field names for sale.report */
export type SaleReportFieldName = ModelFieldName<SaleReportRecord>

/** Typed search_read result */
export type SaleReportSearchResult = ModelRecord<SaleReportRecord>
