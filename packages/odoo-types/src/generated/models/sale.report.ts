// Auto-generated from sale.report (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** sale.report */
export interface SaleReportRecord extends BaseRecord {
  /** Campaign */
  campaign_id: [number, string] /* utm.campaign */ | false
  /** Product Category */
  categ_id: [number, string] /* product.category */ | false
  /** Customer Entity */
  commercial_partner_id: [number, string] /* res.partner */ | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Customer Country */
  country_id: [number, string] /* res.country */ | false
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Order Date */
  date: string | false
  /** Discount % */
  discount: number | false
  /** Discount Amount */
  discount_amount: number | false
  /** Customer Industry */
  industry_id: [number, string] /* res.partner.industry */ | false
  /** Order Invoice Status */
  invoice_status: 'upselling' | 'invoiced' | 'to invoice' | 'no' | false
  /** Abandoned Cart */
  is_abandoned_cart: boolean
  /** Invoice Status */
  line_invoice_status: 'upselling' | 'invoiced' | 'to invoice' | 'no' | false
  /** Medium */
  medium_id: [number, string] /* utm.medium */ | false
  /** Order Reference */
  name: string | false
  /** # of Lines */
  nbr: number | false
  /** Order */
  order_reference: unknown | false
  /** Customer */
  partner_id: [number, string] /* res.partner */ | false
  /** Customer ZIP */
  partner_zip: string | false
  /** Untaxed Total */
  price_subtotal: number | false
  /** Total */
  price_total: number | false
  /** Unit Price */
  price_unit: number | false
  /** Pricelist */
  pricelist_id: [number, string] /* product.pricelist */ | false
  /** Product Variant */
  product_id: [number, string] /* product.product */ | false
  /** Product */
  product_tmpl_id: [number, string] /* product.template */ | false
  /** Unit */
  product_uom_id: [number, string] /* uom.uom */ | false
  /** Qty Ordered */
  product_uom_qty: number | false
  /** Project */
  project_id: [number, string] /* project.project */ | false
  /** eCommerce Categories — The product will be available in each mentioned eCommerce category. Go to Shop > Edit Click on the page and enable \'Categories\' to view all eCommerce categories. */
  public_categ_ids: number[] /* product.public.category */ | false
  /** Qty Delivered */
  qty_delivered: number | false
  /** Qty Invoiced */
  qty_invoiced: number | false
  /** Qty To Deliver */
  qty_to_deliver: number | false
  /** Qty To Invoice */
  qty_to_invoice: number | false
  /** Source */
  source_id: [number, string] /* utm.source */ | false
  /** Status */
  state: 'draft' | 'sent' | 'sale' | 'cancel' | false
  /** Customer State */
  state_id: [number, string] /* res.country.state */ | false
  /** Sales Team */
  team_id: [number, string] /* crm.team */ | false
  /** Untaxed Amount Invoiced */
  untaxed_amount_invoiced: number | false
  /** Untaxed Amount To Invoice */
  untaxed_amount_to_invoice: number | false
  /** Salesperson */
  user_id: [number, string] /* res.users */ | false
  /** Volume */
  volume: number | false
  /** Warehouse */
  warehouse_id: [number, string] /* stock.warehouse */ | false
  /** Website */
  website_id: [number, string] /* website */ | false
  /** Gross Weight */
  weight: number | false
}

/** Field names for sale.report */
export type SaleReportFieldName = ModelFieldName<SaleReportRecord>

/** Typed search_read result */
export type SaleReportSearchResult = ModelRecord<SaleReportRecord>
