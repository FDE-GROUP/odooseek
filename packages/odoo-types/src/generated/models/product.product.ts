// Auto-generated from product.product (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** product.product */
export interface ProductProductRecord extends BaseRecord {
  /** Activities */
  activity_ids: number[] /* mail.activity */
  /** Activity State — Status based on activities
Overdue: Due date is already passed
Today: Activity date is today
Planned: Future activities. */
  activity_state: 'overdue' | 'today' | 'planned' | false
  /** Responsible User */
  activity_user_id: [number, string] /* res.users */ | false
  /** Next Activity Type */
  activity_type_id: [number, string] /* mail.activity.type */ | false
  /** Activity Type Icon — Font awesome icon e.g. fa-tasks */
  activity_type_icon: string | false
  /** Next Activity Deadline */
  activity_date_deadline: string | false
  /** My Activity Deadline */
  my_activity_date_deadline: string | false
  /** Next Activity Summary */
  activity_summary: string | false
  /** Activity Exception Decoration — Type of the exception activity on record. */
  activity_exception_decoration: 'warning' | 'danger' | false
  /** Icon — Icon to indicate an exception activity. */
  activity_exception_icon: string | false
  /** Next Activity Calendar Event */
  activity_calendar_event_id: [number, string] /* calendar.event */ | false
  /** Is Follower */
  message_is_follower: boolean
  /** Followers */
  message_follower_ids: number[] /* mail.followers */
  /** Followers (Partners) */
  message_partner_ids: number[] /* res.partner */ | false
  /** Messages */
  message_ids: number[] /* mail.message */
  /** Has Message */
  has_message: boolean
  /** Action Needed — If checked, new messages require your attention. */
  message_needaction: boolean
  /** Number of Actions — Number of messages requiring action */
  message_needaction_counter: number | false
  /** Message Delivery error — If checked, some messages have a delivery error. */
  message_has_error: boolean
  /** Number of errors — Number of messages with delivery error */
  message_has_error_counter: number | false
  /** Attachment Count */
  message_attachment_count: number | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** SMS Delivery error — If checked, some messages have a delivery error. */
  message_has_sms_error: boolean
  /** Variant Price Extra — This is the sum of the extra price of all attributes */
  price_extra: number | false
  /** Sales Price — The sale price is managed from the product template. Click on the \'Configure Variants\' button to set the extra attribute prices. */
  lst_price: number | false
  /** Internal Reference */
  default_code: string | false
  /** Reference */
  code: string | false
  /** Customer Ref */
  partner_ref: string | false
  /** Active — If unchecked, it will allow you to hide the product without removing it. */
  active: boolean
  /** Product Template */
  product_tmpl_id: [number, string] /* product.template */
  /** Barcode — International Article Number used for product identification. */
  barcode: string | false
  /** Unit Barcode */
  product_uom_ids: number[] /* product.uom */
  /** Attribute Values */
  product_template_attribute_value_ids: number[] /* product.template.attribute.value */ | false
  /** Variant Values */
  product_template_variant_value_ids: number[] /* product.template.attribute.value */ | false
  /** Product Values */
  import_attribute_values: string | false
  /** Combination Indices */
  combination_indices: string | false
  /** Is Product Variant */
  is_product_variant: boolean
  /** Cost — Value of the product (automatically computed in AVCO).
        Used to value the product when the purchase cost is not known (e.g. inventory adjustment).
        Used to compute margins on sale orders. */
  standard_price: number | false
  /** Volume */
  volume: number | false
  /** Weight */
  weight: number | false
  /** Pricelist Rules */
  pricelist_rule_ids: number[] /* product.pricelist.item */
  /** Documents */
  product_document_ids: number[] /* product.document */
  /** Documents Count */
  product_document_count: number | false
  /** Variant Tags */
  additional_product_tag_ids: number[] /* product.tag */ | false
  /** All Product Tag */
  all_product_tag_ids: number[] /* product.tag */ | false
  /** Variant Image */
  image_variant_1920: string | false
  /** Variant Image 1024 */
  image_variant_1024: string | false
  /** Variant Image 512 */
  image_variant_512: string | false
  /** Variant Image 256 */
  image_variant_256: string | false
  /** Variant Image 128 */
  image_variant_128: string | false
  /** Can Variant Image 1024 be zoomed */
  can_image_variant_1024_be_zoomed: boolean
  /** Image */
  image_1920: string | false
  /** Image 1024 */
  image_1024: string | false
  /** Image 512 */
  image_512: string | false
  /** Image 256 */
  image_256: string | false
  /** Image 128 */
  image_128: string | false
  /** Can Image 1024 be zoomed */
  can_image_1024_be_zoomed: boolean
  /** Write Date */
  write_date: string | false
  /** Favorite */
  is_favorite: boolean
  /** Is In Selected Section Of Order */
  is_in_selected_section_of_order: boolean
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Tax String */
  tax_string: string | false
  /** Stock Quant */
  stock_quant_ids: number[] /* stock.quant */
  /** Stock Move */
  stock_move_ids: number[] /* stock.move */
  /** Quantity On Hand — Current quantity of products.
In a context with a single Stock Location, this includes goods stored at this Location, or any of its children.
In a context with a single Warehouse, this includes goods stored in the Stock Location of this Warehouse, or any of its children.
stored in the Stock Location of the Warehouse of this Shop, or any of its children.
Otherwise, this includes goods stored in any Stock Location with \'internal\' type. */
  qty_available: number | false
  /** Forecasted Quantity — Forecast quantity (computed as Quantity On Hand - Outgoing + Incoming)
In a context with a single Stock Location, this includes goods stored in this location, or any of its children.
In a context with a single Warehouse, this includes goods stored in the Stock Location of this Warehouse, or any of its children.
Otherwise, this includes goods stored in any Stock Location with \'internal\' type. */
  virtual_available: number | false
  /** Free To Use Quantity  — Available quantity (computed as Quantity On Hand - reserved quantity)
In a context with a single Stock Location, this includes goods stored in this location, or any of its children.
In a context with a single Warehouse, this includes goods stored in the Stock Location of this Warehouse, or any of its children.
Otherwise, this includes goods stored in any Stock Location with \'internal\' type. */
  free_qty: number | false
  /** Incoming — Quantity of planned incoming products.
In a context with a single Stock Location, this includes goods arriving to this Location, or any of its children.
In a context with a single Warehouse, this includes goods arriving to the Stock Location of this Warehouse, or any of its children.
Otherwise, this includes goods arriving to any Stock Location with \'internal\' type. */
  incoming_qty: number | false
  /** Outgoing — Quantity of planned outgoing products.
In a context with a single Stock Location, this includes goods leaving this Location, or any of its children.
In a context with a single Warehouse, this includes goods leaving the Stock Location of this Warehouse, or any of its children.
Otherwise, this includes goods leaving any Stock Location with \'internal\' type. */
  outgoing_qty: number | false
  /** Minimum Stock Rules */
  orderpoint_ids: number[] /* stock.warehouse.orderpoint */
  /** Nbr Moves In — Number of incoming stock moves in the past 12 months */
  nbr_moves_in: number | false
  /** Nbr Moves Out — Number of outgoing stock moves in the past 12 months */
  nbr_moves_out: number | false
  /** Reordering Rules */
  nbr_reordering_rules: number | false
  /** Reordering Min Qty */
  reordering_min_qty: number | false
  /** Reordering Max Qty */
  reordering_max_qty: number | false
  /** Putaway Rules */
  putaway_rule_ids: number[] /* stock.putaway.rule */
  /** Storage Category Capacity */
  storage_category_capacity_ids: number[] /* stock.storage.category.capacity */
  /** Show On Hand Qty Status Button */
  show_on_hand_qty_status_button: boolean
  /** Show Forecasted Qty Status Button */
  show_forecasted_qty_status_button: boolean
  /** Show Qty Update Button */
  show_qty_update_button: boolean
  /** Barcode is valid EAN */
  valid_ean: boolean
  /** Lot Properties */
  lot_properties_definition: unknown | false
  /** Event Tickets */
  event_ticket_ids: number[] /* event.event.ticket */
  /** BOM Product Variants */
  variant_bom_ids: number[] /* mrp.bom */
  /** BoM Components */
  bom_line_ids: number[] /* mrp.bom.line */
  /** # Bill of Material */
  bom_count: number | false
  /** # BoM Where Used */
  used_in_bom_count: number | false
  /** Manufactured */
  mrp_product_qty: number | false
  /** Is Kits */
  is_kits: boolean
  /** Product Catalog Product Is In Bom */
  product_catalog_product_is_in_bom: boolean
  /** Product Catalog Product Is In Mo */
  product_catalog_product_is_in_mo: boolean
  /** Purchased */
  purchased_product_qty: number | false
  /** Is In Purchase Order */
  is_in_purchase_order: boolean
  /** Average Cost */
  avg_cost: number | false
  /** Total Value */
  total_value: number | false
  /** Valuation Currency — Technical field to correctly show the currently selected company\'s currency that corresponds to the totaled value of the product\'s valuation layers */
  company_currency_id: [number, string] /* res.currency */ | false
  /** PO Lines */
  purchase_order_line_ids: number[] /* purchase.order.line */
  /** Monthly Demand */
  monthly_demand: number | false
  /** Suggested Qty */
  suggested_qty: number | false
  /** Suggest Estimated Price */
  suggest_estimated_price: number | false
  /** Sold */
  sales_count: number | false
  /** Product Catalog Product Is In Sale Order */
  product_catalog_product_is_in_sale_order: boolean
  /** Variant Ribbon */
  variant_ribbon_id: [number, string] /* product.ribbon */ | false
  /** Website — Restrict to a specific website. */
  website_id: [number, string] /* website */ | false
  /** Extra Variant Images */
  product_variant_image_ids: number[] /* product.image */
  /** Base Unit Count — Display base unit price on your eCommerce pages. Set to 0 to hide it for this product. */
  base_unit_count: number
  /** Custom Unit of Measure — Define a custom unit to display in the price per unit of measure field. */
  base_unit_id: [number, string] /* website.base.unit */ | false
  /** Price Per Unit */
  base_unit_price: number | false
  /** Base Unit Name — Displays the custom unit for the products if defined or the selected unit of measure otherwise. */
  base_unit_name: string | false
  /** Website URL — The full URL to access the document through the website. */
  website_url: string | false
  /** Back in stock Notifications */
  stock_notification_partner_ids: number[] /* res.partner */ | false
  /** Standard Price Update Warning */
  standard_price_update_warning: string | false
  /** Visible on current website */
  website_published: boolean
  /** Is Published */
  is_published: boolean
  /** Can Publish */
  can_publish: boolean
  /** Website Absolute URL — The full absolute URL to access the document through the website. */
  website_absolute_url: string | false
  /** SEO optimized */
  is_seo_optimized: boolean
  /** Website meta title */
  website_meta_title: string | false
  /** Website meta description */
  website_meta_description: string | false
  /** Website meta keywords */
  website_meta_keywords: string | false
  /** Website opengraph image */
  website_meta_og_img: string | false
  /** Seo name */
  seo_name: string | false
  /** Name */
  name: string
  /** Sequence — Gives the sequence order when displaying a product list */
  sequence: number | false
  /** Description */
  description: string | false
  /** Purchase Description */
  description_purchase: string | false
  /** Sales Description — A description of the Product that you want to communicate to your customers. This description will be copied to every Sales Order, Delivery Order and Customer Invoice/Credit Note */
  description_sale: string | false
  /** Product Type — Goods are tangible materials and merchandise you provide.
A service is a non-material product you provide. */
  _type: 'consu' | 'service' | 'combo'
  /** Combo Choices */
  combo_ids: number[] /* product.combo */ | false
  /** Create on Order */
  service_tracking: 'no' | 'event' | 'task_global_project' | 'task_in_project' | 'project_only'
  /** Product Category */
  categ_id: [number, string] /* product.category */ | false
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Cost Currency */
  cost_currency_id: [number, string] /* res.currency */ | false
  /** Sales Price — Price at which the product is sold to customers. */
  list_price: number | false
  /** Volume unit of measure label */
  volume_uom_name: string | false
  /** Weight unit of measure label */
  weight_uom_name: string | false
  /** Sales */
  sale_ok: boolean
  /** Purchase */
  purchase_ok: boolean
  /** Unit — Default unit of measure used for all stock operations. */
  uom_id: [number, string] /* uom.uom */
  /** Packagings — Additional packagings for this product which can be used for sales */
  uom_ids: number[] /* uom.uom */ | false
  /** Unit Name */
  uom_name: string | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Vendors */
  seller_ids: number[] /* product.supplierinfo */
  /** Variant Seller */
  variant_seller_ids: number[] /* product.supplierinfo */
  /** Color Index */
  color: number | false
  /** Product Attributes */
  attribute_line_ids: number[] /* product.template.attribute.line */
  /** Valid Product Attribute Lines */
  valid_product_template_attribute_line_ids: number[] /* product.template.attribute.line */ | false
  /** Products */
  product_variant_ids: number[] /* product.product */
  /** Product */
  product_variant_id: [number, string] /* product.product */ | false
  /** # Product Variants */
  product_variant_count: number | false
  /** Is a configurable product */
  has_configurable_attributes: boolean
  /** Is Dynamically Created */
  is_dynamically_created: boolean
  /** Product Tooltip */
  product_tooltip: string | false
  /** Tags */
  product_tag_ids: number[] /* product.tag */ | false
  /** Properties */
  product_properties: unknown | false
  /** Sales Taxes — Default taxes used when selling the product */
  taxes_id: number[] /* account.tax */ | false
  /** Purchase Taxes — Default taxes used when buying the product */
  supplier_taxes_id: number[] /* account.tax */ | false
  /** Income Account — Keep this field empty to use the default value from the product category. */
  property_account_income_id: [number, string] /* account.account */ | false
  /** Expense Account — Keep this field empty to use the default value from the product category. If anglo-saxon accounting with automated valuation method is configured, the expense account on the product category will be used. */
  property_account_expense_id: [number, string] /* account.account */ | false
  /** Account Tags — Tags to be set on the base and tax journal items created for this product. */
  account_tag_ids: number[] /* account.account.tag */ | false
  /** Fiscal Country Codes */
  fiscal_country_codes: string | false
  /** Track Inventory — A storable product is a product for which you manage stock. */
  is_storable: boolean
  /** Responsible — This user will be responsible of the next activities related to logistic operations for this product. */
  responsible_id: [number, string] /* res.users */ | false
  /** Production Location — This stock location will be used, instead of the default one, as the source location for stock moves generated by manufacturing orders. */
  property_stock_production: [number, string] /* stock.location */ | false
  /** Inventory Location — This stock location will be used, instead of the default one, as the source location for stock moves generated when you do an inventory. */
  property_stock_inventory: [number, string] /* stock.location */ | false
  /** Customer Lead Time — Delivery lead time, in days. It\'s the number of days, promised to the customer, between the confirmation of the sales order and the delivery. */
  sale_delay: number | false
  /** Tracking — Ensure the traceability of a storable product in your warehouse. */
  tracking: 'serial' | 'lot' | 'none'
  /** Serial/Lot Numbers Sequence — Technical Field: The Ir.Sequence record that is used to generate serial/lot numbers for this product */
  lot_sequence_id: [number, string] /* ir.sequence */ | false
  /** Custom Lot/Serial — 
    If multiple products share the same prefix, they will share the same sequence, otherwise the sequence will be dedicated to the product.

    * Legend (for prefix):
    - Current Year with Century: %(year)s
    - Current Year without Century: %(y)s
    - Month: %(month)s
    - Day: %(day)s
    - Day of the Year: %(doy)s
    - Week of the Year: %(woy)s
    - Day of the Week (0:Monday): %(weekday)s
    - Hour 00->24: %(h24)s
    - Hour 00->12: %(h12)s
    - Minute: %(min)s
    - Second: %(sec)s
 */
  serial_prefix_format: string | false
  /** Next Serial */
  next_serial: string | false
  /** Description on Picking */
  description_picking: string | false
  /** Description on Delivery Orders */
  description_pickingout: string | false
  /** Description on Receptions */
  description_pickingin: string | false
  /** Location */
  location_id: [number, string] /* stock.location */ | false
  /** Warehouse */
  warehouse_id: [number, string] /* stock.warehouse */ | false
  /** Routes can be selected on this product */
  has_available_route_ids: boolean
  /** Routes — Depending on the modules installed, this will allow you to define the route of the product: whether it will be bought, manufactured, replenished on order, etc. */
  route_ids: number[] /* stock.route */ | false
  /** Category Routes */
  route_from_categ_ids: number[] /* stock.route */ | false
  /** Bill of Materials */
  bom_ids: number[] /* mrp.bom */
  /** Control Policy — On ordered quantities: Control bills based on ordered quantities.
On received quantities: Control bills based on received quantities. */
  purchase_method: 'purchase' | 'receive' | false
  /** Message for Purchase Order Line */
  purchase_line_warn_msg: string | false
  /** Cost Method */
  cost_method: 'standard' | 'fifo' | 'average' | false
  /** Valuation */
  valuation: 'periodic' | 'real_time' | false
  /** Valuation by Lot/Serial — If checked, the valuation will be specific by Lot/Serial number. */
  lot_valuated: boolean
  /** Price Difference Account — With perpetual valuation, this account will hold the price difference between the standard price and the bill price. */
  property_price_difference_account_id: [number, string] /* account.account */ | false
  /** Track Service — Manually set quantities on order: Invoice based on the manually entered quantity, without creating an analytic account.
Timesheets on contract: Invoice based on the tracked hours on the related timesheet.
Create a task and track hours: Create a task on the sales order validation and track the work hours. */
  service_type: 'manual' | 'milestones' | false
  /** Sales Order Line Warning */
  sale_line_warn_msg: string | false
  /** Re-Invoice Costs — Validated expenses, vendor bills, or stock pickings (set up to track costs) can be invoiced to the customer at either cost or sales price. */
  expense_policy: 'no' | 'cost' | 'sales_price' | false
  /** Re-Invoice Policy visible */
  visible_expense_policy: boolean
  /** Invoicing Policy — Ordered Quantity: Invoice quantities ordered by the customer.
Delivered Quantity: Invoice quantities delivered to the customer. */
  invoice_policy: 'order' | 'delivery' | false
  /** Optional Products — Optional Products are suggested whenever the customer hits *Add to Cart* (cross-sell strategy, e.g. for computers: warranty, software, etc.). */
  optional_product_ids: number[] /* product.template */ | false
  /** Subcontract Service — If ticked, each time you sell this product through a SO, a RfQ is automatically created to buy the product. Tip: don\'t forget to set a vendor on the product. */
  service_to_purchase: boolean
  /** HS Code — Standardized code for international shipping and goods declaration. */
  hs_code: string | false
  /** Origin of Goods — Rules of origin determine where goods originate, i.e. not where they have been shipped from, but where they have been produced or manufactured.
As such, the ‘origin’ is the \'economic nationality\' of goods traded in commerce. */
  country_of_origin: [number, string] /* res.country */ | false
  /** Rating Last Value */
  rating_last_value: number | false
  /** Rating Last Feedback */
  rating_last_feedback: string | false
  /** Rating Last Image */
  rating_last_image: string | false
  /** Rating count */
  rating_count: number | false
  /** Average Rating */
  rating_avg: number | false
  /** Rating Avg Text */
  rating_avg_text: 'top' | 'ok' | 'ko' | 'none' | false
  /** Rating Satisfaction */
  rating_percentage_satisfaction: number | false
  /** Rating Text */
  rating_last_text: 'top' | 'ok' | 'ko' | 'none' | false
  /** Description for the website */
  website_description: string | false
  /** eCommerce Description */
  description_ecommerce: string | false
  /** Alternative Products — Suggest alternatives to your customer (upsell strategy). Those products show up on the product page. */
  alternative_product_ids: number[] /* product.template */ | false
  /** Accessory Products — Accessories show up when the customer reviews the cart before payment (cross-sell strategy). */
  accessory_product_ids: number[] /* product.product */ | false
  /** Size X */
  website_size_x: number | false
  /** Size Y */
  website_size_y: number | false
  /** Ribbon */
  website_ribbon_id: [number, string] /* product.ribbon */ | false
  /** Website Sequence — Determine the display order in the Website E-commerce */
  website_sequence: number | false
  /** Website Product Category — The product will be available in each mentioned eCommerce category. Go to Shop > Edit Click on the page and enable \'Categories\' to view all eCommerce categories. */
  public_categ_ids: number[] /* product.public.category */ | false
  /** Publish Date */
  publish_date: string
  /** Extra Product Media */
  product_template_image_ids: number[] /* product.image */
  /** Compare to Price — Add a strikethrough price to your /shop and product pages for comparison purposes.It will not be displayed if pricelists apply. */
  compare_list_price: number | false
  /** Variants Default Code — Technical field to enhance performance when looking up default code of productvariants (LIKE/ILIKE) */
  variants_default_code: string | false
  /** Project */
  project_id: [number, string] /* project.project */ | false
  /** Project Template */
  project_template_id: [number, string] /* project.project */ | false
  /** Task Template */
  task_template_id: [number, string] /* project.task */ | false
  /** Service Invoicing Policy */
  service_policy: 'ordered_prepaid' | 'delivered_milestones' | 'delivered_manual' | false
  /** Sell when Out-of-Stock */
  allow_out_of_stock_order: boolean
  /** Show Threshold */
  available_threshold: number | false
  /** Show availability Qty */
  show_availability: boolean
  /** Out-of-Stock Message */
  out_of_stock_message: string | false
  /** Expenses — Specify whether the product can be selected in an expense. */
  can_be_expensed: boolean
  /** Expense Policy Tooltip */
  expense_policy_tooltip: string | false
}

/** Field names for product.product */
export type ProductProductFieldName = ModelFieldName<ProductProductRecord>

/** Typed search_read result */
export type ProductProductSearchResult = ModelRecord<ProductProductRecord>
