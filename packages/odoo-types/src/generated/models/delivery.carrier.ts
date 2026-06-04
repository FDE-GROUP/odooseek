// Auto-generated from delivery.carrier (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** delivery.carrier */
export interface DeliveryCarrierRecord extends BaseRecord {
  /** Website — Restrict to a specific website. */
  website_id: [number, string] /* website */ | false
  /** Visible on current website */
  website_published: boolean
  /** Is Published */
  is_published: boolean
  /** Can Publish */
  can_publish: boolean
  /** Website URL — The full relative URL to access the document through the website. */
  website_url: string | false
  /** Website Absolute URL — The full absolute URL to access the document through the website. */
  website_absolute_url: string | false
  /** Delivery Method */
  name: string
  /** Active */
  active: boolean
  /** Sequence — Determine the display order */
  sequence: number | false
  /** Provider */
  delivery_type: 'base_on_rule' | 'fixed'
  /** Cash on Delivery — Allow customers to choose Cash on Delivery as their payment method. */
  allow_cash_on_delivery: boolean
  /** Integration Level — Action while validating Delivery Orders */
  integration_level: 'rate' | 'rate_and_ship' | false
  /** Environment — Set to True if your credentials are certified for production. */
  prod_environment: boolean
  /** Debug logging — Log requests in order to ease debugging */
  debug_logging: boolean
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Delivery Product */
  product_id: [number, string] /* product.product */
  /** Tracking Link — This option adds a link for the customer in the portal to track their package easily. Use <shipmenttrackingnumber> as a placeholder in your URL. */
  tracking_url: string | false
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Invoicing Policy — Estimated Cost: the customer will be invoiced the estimated cost of the shipping.
Real Cost: the customer will be invoiced the real cost of the shipping, the cost of theshipping will be updated on the SO after the delivery. */
  invoice_policy: 'estimated' | 'real'
  /** Countries */
  country_ids: number[] /* res.country */ | false
  /** States */
  state_ids: number[] /* res.country.state */ | false
  /** Zip Prefixes — Prefixes of zip codes that this carrier applies to. Note that regular expressions can be used to support countries with varying zip code lengths, i.e. \'$\' can be added to end of prefix to match the exact zip (e.g. \'100$\' will only match \'100\' and not \'1000\') */
  zip_prefix_ids: number[] /* delivery.zip.prefix */ | false
  /** Max Weight — If the total weight of the order is over this weight, the method won\'t be available. */
  max_weight: number | false
  /** Weight unit of measure label */
  weight_uom_name: string | false
  /** Max Volume — If the total volume of the order is over this volume, the method won\'t be available. */
  max_volume: number | false
  /** Volume unit of measure label */
  volume_uom_name: string | false
  /** Must Have Tags — The method is available only if at least one product of the order has one of these tags. */
  must_have_tag_ids: number[] /* product.tag */ | false
  /** Excluded Tags — The method is NOT available if at least one product of the order has one of these tags. */
  excluded_tag_ids: number[] /* product.tag */ | false
  /** Carrier Description — A description of the delivery method that you want to communicate to your customers on the Sales Order and sales confirmation email.E.g. instructions for customers to follow. */
  carrier_description: string | false
  /** Margin — This percentage will be added to the shipping price. */
  margin: number | false
  /** Fixed Margin — This fixed amount will be added to the shipping price. */
  fixed_margin: number | false
  /** Free if order amount is above — If the order total amount (shipping excluded) is above or equal to this value, the customer benefits from a free shipping */
  free_over: boolean
  /** Amount — Amount of the order to benefit from a free shipping, expressed in the company currency */
  amount: number | false
  /** Can Generate Return */
  can_generate_return: boolean
  /** Generate Return Label — The return label is automatically generated at the delivery. */
  return_label_on_delivery: boolean
  /** Return Label Accessible from Customer Portal — The return label can be downloaded by the customer from the customer portal. */
  get_return_label_from_portal: boolean
  /** Supports Shipping Insurance */
  supports_shipping_insurance: boolean
  /** Insurance Percentage — Shipping insurance is a service which may reimburse senders whose parcels are lost, stolen, and/or damaged in transit. */
  shipping_insurance: number | false
  /** Pricing Rules */
  price_rule_ids: number[] /* delivery.price.rule */
  /** Fixed Price */
  fixed_price: number | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Routes */
  route_ids: number[] /* stock.route */ | false
  /** Description for Online Quotations — A description of the Product that you want to communicate to your customers. This description will be copied to every Sales Order, Delivery Order and Customer Invoice/Credit Note */
  website_description: string | false
}

/** Field names for delivery.carrier */
export type DeliveryCarrierFieldName = ModelFieldName<DeliveryCarrierRecord>

/** Typed search_read result */
export type DeliveryCarrierSearchResult = ModelRecord<DeliveryCarrierRecord>
