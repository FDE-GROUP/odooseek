// Auto-generated from product.template (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** product.template */
export interface ProductTemplateRecord extends BaseRecord {
  /** Accessory Products — Accessories show up when the customer reviews the cart before payment (cross-sell strategy). */
  accessory_product_ids: number[] /* product.product */ | false
  /** Account Tags — Tags to be set on the base and tax journal items created for this product. */
  account_tag_ids: number[] /* account.account.tag */ | false
  /** Active — If unchecked, it will allow you to hide the product without removing it. */
  active: boolean
  /** Next Activity Calendar Event */
  activity_calendar_event_id: [number, string] /* calendar.event */ | false
  /** Next Activity Deadline */
  activity_date_deadline: string | false
  /** Activity Exception Decoration — Type of the exception activity on record. */
  activity_exception_decoration: 'warning' | 'danger' | false
  /** Icon — Icon to indicate an exception activity. */
  activity_exception_icon: string | false
  /** Activities */
  activity_ids: number[] /* mail.activity */
  /** Activity State — Status based on activities
Overdue: Due date is already passed
Today: Activity date is today
Planned: Future activities. */
  activity_state: 'overdue' | 'today' | 'planned' | false
  /** Next Activity Summary */
  activity_summary: string | false
  /** Activity Type Icon — Font awesome icon e.g. fa-tasks */
  activity_type_icon: string | false
  /** Next Activity Type */
  activity_type_id: [number, string] /* mail.activity.type */ | false
  /** Responsible User */
  activity_user_id: [number, string] /* res.users */ | false
  /** Sell when Out-of-Stock */
  allow_out_of_stock_order: boolean
  /** Alternative Products — Suggest alternatives to your customer (upsell strategy). Those products show up on the product page. */
  alternative_product_ids: number[] /* product.template */ | false
  /** Product Attributes */
  attribute_line_ids: number[] /* product.template.attribute.line */
  /** Show Threshold */
  available_threshold: number | false
  /** Barcode */
  barcode: string | false
  /** Base Unit Count — Display base unit price on your eCommerce pages. Set to 0 to hide it for this product. */
  base_unit_count: number
  /** Custom Unit of Measure — Define a custom unit to display in the price per unit of measure field. */
  base_unit_id: [number, string] /* website.base.unit */ | false
  /** Base Unit Name — Displays the custom unit for the products if defined or the selected unit of measure otherwise. */
  base_unit_name: string | false
  /** Price Per Unit */
  base_unit_price: number | false
  /** # Bill of Material */
  bom_count: number | false
  /** Bill of Materials */
  bom_ids: number[] /* mrp.bom */
  /** BoM Components */
  bom_line_ids: number[] /* mrp.bom.line */
  /** Expenses — Specify whether the product can be selected in an expense. */
  can_be_expensed: boolean
  /** Can Image 1024 be zoomed */
  can_image_1024_be_zoomed: boolean
  /** Can Publish */
  can_publish: boolean
  /** Product Category */
  categ_id: [number, string] /* product.category */ | false
  /** Color Index */
  color: number | false
  /** Combo Choices */
  combo_ids: number[] /* product.combo */ | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Compare to Price — Add a strikethrough price to your /shop and product pages for comparison purposes.It will not be displayed if pricelists apply. */
  compare_list_price: number | false
  /** Cost Currency */
  cost_currency_id: [number, string] /* res.currency */ | false
  /** Cost Method */
  cost_method: 'standard' | 'fifo' | 'average' | false
  /** Origin of Goods — Rules of origin determine where goods originate, i.e. not where they have been shipped from, but where they have been produced or manufactured.
As such, the ‘origin’ is the \'economic nationality\' of goods traded in commerce. */
  country_of_origin: [number, string] /* res.country */ | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Internal Reference */
  default_code: string | false
  /** Description */
  description: string | false
  /** eCommerce Description */
  description_ecommerce: string | false
  /** Description on Picking */
  description_picking: string | false
  /** Description on Receptions */
  description_pickingin: string | false
  /** Description on Delivery Orders */
  description_pickingout: string | false
  /** Purchase Description */
  description_purchase: string | false
  /** Sales Description — A description of the Product that you want to communicate to your customers. This description will be copied to every Sales Order, Delivery Order and Customer Invoice/Credit Note */
  description_sale: string | false
  /** Re-Invoice Costs — Validated expenses, vendor bills, or stock pickings (set up to track costs) can be invoiced to the customer at either cost or sales price. */
  expense_policy: 'no' | 'cost' | 'sales_price' | false
  /** Expense Policy Tooltip */
  expense_policy_tooltip: string | false
  /** Fiscal Country Codes */
  fiscal_country_codes: string | false
  /** Routes can be selected on this product */
  has_available_route_ids: boolean
  /** Is a configurable product */
  has_configurable_attributes: boolean
  /** Has Message */
  has_message: boolean
  /** HS Code — Standardized code for international shipping and goods declaration. */
  hs_code: string | false
  /** Image 1024 */
  image_1024: string | false
  /** Image 128 */
  image_128: string | false
  /** Image */
  image_1920: string | false
  /** Image 256 */
  image_256: string | false
  /** Image 512 */
  image_512: string | false
  /** Product Values */
  import_attribute_values: string | false
  /** Incoming */
  incoming_qty: number | false
  /** Invoicing Policy — Ordered Quantity: Invoice quantities ordered by the customer.
Delivered Quantity: Invoice quantities delivered to the customer. */
  invoice_policy: 'order' | 'delivery' | false
  /** Is Dynamically Created */
  is_dynamically_created: boolean
  /** Favorite */
  is_favorite: boolean
  /** Is Kits */
  is_kits: boolean
  /** Is a product variant */
  is_product_variant: boolean
  /** Is Published */
  is_published: boolean
  /** SEO optimized */
  is_seo_optimized: boolean
  /** Track Inventory — A storable product is a product for which you manage stock. */
  is_storable: boolean
  /** Sales Price — Price at which the product is sold to customers. */
  list_price: number | false
  /** Location */
  location_id: [number, string] /* stock.location */ | false
  /** Serial/Lot Numbers Sequence — Technical Field: The Ir.Sequence record that is used to generate serial/lot numbers for this product */
  lot_sequence_id: [number, string] /* ir.sequence */ | false
  /** Valuation by Lot/Serial — If checked, the valuation will be specific by Lot/Serial number. */
  lot_valuated: boolean
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
  /** Manufactured */
  mrp_product_qty: number | false
  /** My Activity Deadline */
  my_activity_date_deadline: string | false
  /** Name */
  name: string
  /** Nbr Moves In — Number of incoming stock moves in the past 12 months */
  nbr_moves_in: number | false
  /** Nbr Moves Out — Number of outgoing stock moves in the past 12 months */
  nbr_moves_out: number | false
  /** Reordering Rules */
  nbr_reordering_rules: number | false
  /** Next Serial */
  next_serial: string | false
  /** Optional Products — Optional Products are suggested whenever the customer hits *Add to Cart* (cross-sell strategy, e.g. for computers: warranty, software, etc.). */
  optional_product_ids: number[] /* product.template */ | false
  /** Out-of-Stock Message */
  out_of_stock_message: string | false
  /** Outgoing */
  outgoing_qty: number | false
  /** Pricelist Rules */
  pricelist_rule_ids: number[] /* product.pricelist.item */
  /** Documents Count */
  product_document_count: number | false
  /** Documents */
  product_document_ids: number[] /* product.document */
  /** Properties */
  product_properties: unknown | false
  /** Tags */
  product_tag_ids: number[] /* product.tag */ | false
  /** Extra Product Media */
  product_template_image_ids: number[] /* product.image */
  /** Product Tooltip */
  product_tooltip: string | false
  /** # Product Variants */
  product_variant_count: number | false
  /** Product */
  product_variant_id: [number, string] /* product.product */ | false
  /** Products */
  product_variant_ids: number[] /* product.product */
  /** Project */
  project_id: [number, string] /* project.project */ | false
  /** Project Template */
  project_template_id: [number, string] /* project.project */ | false
  /** Expense Account — Keep this field empty to use the default value from the product category. If anglo-saxon accounting with automated valuation method is configured, the expense account on the product category will be used. */
  property_account_expense_id: [number, string] /* account.account */ | false
  /** Income Account — Keep this field empty to use the default value from the product category. */
  property_account_income_id: [number, string] /* account.account */ | false
  /** Price Difference Account — With perpetual valuation, this account will hold the price difference between the standard price and the bill price. */
  property_price_difference_account_id: [number, string] /* account.account */ | false
  /** Inventory Location — This stock location will be used, instead of the default one, as the source location for stock moves generated when you do an inventory. */
  property_stock_inventory: [number, string] /* stock.location */ | false
  /** Production Location — This stock location will be used, instead of the default one, as the source location for stock moves generated by manufacturing orders. */
  property_stock_production: [number, string] /* stock.location */ | false
  /** Website Product Category — The product will be available in each mentioned eCommerce category. Go to Shop > Edit Click on the page and enable \'Categories\' to view all eCommerce categories. */
  public_categ_ids: number[] /* product.public.category */ | false
  /** Publish Date */
  publish_date: string
  /** Message for Purchase Order Line */
  purchase_line_warn_msg: string | false
  /** Control Policy — On ordered quantities: Control bills based on ordered quantities.
On received quantities: Control bills based on received quantities. */
  purchase_method: 'purchase' | 'receive' | false
  /** Purchase */
  purchase_ok: boolean
  /** Purchased */
  purchased_product_qty: number | false
  /** Quantity On Hand */
  qty_available: number | false
  /** Average Rating */
  rating_avg: number | false
  /** Rating Avg Text */
  rating_avg_text: 'top' | 'ok' | 'ko' | 'none' | false
  /** Rating count */
  rating_count: number | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Rating Last Feedback */
  rating_last_feedback: string | false
  /** Rating Last Image */
  rating_last_image: string | false
  /** Rating Text */
  rating_last_text: 'top' | 'ok' | 'ko' | 'none' | false
  /** Rating Last Value */
  rating_last_value: number | false
  /** Rating Satisfaction */
  rating_percentage_satisfaction: number | false
  /** Reordering Max Qty */
  reordering_max_qty: number | false
  /** Reordering Min Qty */
  reordering_min_qty: number | false
  /** Responsible — This user will be responsible of the next activities related to logistic operations for this product. */
  responsible_id: [number, string] /* res.users */ | false
  /** Category Routes */
  route_from_categ_ids: number[] /* stock.route */ | false
  /** Routes — Depending on the modules installed, this will allow you to define the route of the product: whether it will be bought, manufactured, replenished on order, etc. */
  route_ids: number[] /* stock.route */ | false
  /** Customer Lead Time — Delivery lead time, in days. It\'s the number of days, promised to the customer, between the confirmation of the sales order and the delivery. */
  sale_delay: number | false
  /** Sales Order Line Warning */
  sale_line_warn_msg: string | false
  /** Sales */
  sale_ok: boolean
  /** Sold */
  sales_count: number | false
  /** Vendors */
  seller_ids: number[] /* product.supplierinfo */
  /** Seo name */
  seo_name: string | false
  /** Sequence — Gives the sequence order when displaying a product list */
  sequence: number | false
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
  /** Service Invoicing Policy */
  service_policy: 'ordered_prepaid' | 'delivered_milestones' | 'delivered_manual' | false
  /** Subcontract Service — If ticked, each time you sell this product through a SO, a RfQ is automatically created to buy the product. Tip: don\'t forget to set a vendor on the product. */
  service_to_purchase: boolean
  /** Create on Order */
  service_tracking: 'no' | 'event' | 'task_global_project' | 'task_in_project' | 'project_only'
  /** Track Service — Manually set quantities on order: Invoice based on the manually entered quantity, without creating an analytic account.
Timesheets on contract: Invoice based on the tracked hours on the related timesheet.
Create a task and track hours: Create a task on the sales order validation and track the work hours. */
  service_type: 'manual' | 'milestones' | false
  /** Show availability Qty */
  show_availability: boolean
  /** Show Forecasted Qty Status Button */
  show_forecasted_qty_status_button: boolean
  /** Show On Hand Qty Status Button */
  show_on_hand_qty_status_button: boolean
  /** Show Qty Update Button */
  show_qty_update_button: boolean
  /** Cost — Value of the product (automatically computed in AVCO).
        Used to value the product when the purchase cost is not known (e.g. inventory adjustment).
        Used to compute margins on sale orders. */
  standard_price: number | false
  /** Purchase Taxes — Default taxes used when buying the product */
  supplier_taxes_id: number[] /* account.tax */ | false
  /** Task Template */
  task_template_id: [number, string] /* project.task */ | false
  /** Tax String */
  tax_string: string | false
  /** Sales Taxes — Default taxes used when selling the product */
  taxes_id: number[] /* account.tax */ | false
  /** Tracking — Ensure the traceability of a storable product in your warehouse. */
  tracking: 'serial' | 'lot' | 'none'
  /** Product Type — Goods are tangible materials and merchandise you provide.
A service is a non-material product you provide. */
  _type: 'consu' | 'service' | 'combo'
  /** Unit — Default unit of measure used for all stock operations. */
  uom_id: [number, string] /* uom.uom */
  /** Packagings — Additional packagings for this product which can be used for sales */
  uom_ids: number[] /* uom.uom */ | false
  /** Unit Name */
  uom_name: string | false
  /** # of BoM Where is Used */
  used_in_bom_count: number | false
  /** Valid Product Attribute Lines */
  valid_product_template_attribute_line_ids: number[] /* product.template.attribute.line */ | false
  /** Valuation */
  valuation: 'periodic' | 'real_time' | false
  /** Variant Seller */
  variant_seller_ids: number[] /* product.supplierinfo */
  /** Variants Default Code — Technical field to enhance performance when looking up default code of productvariants (LIKE/ILIKE) */
  variants_default_code: string | false
  /** Forecasted Quantity */
  virtual_available: number | false
  /** Re-Invoice Policy visible */
  visible_expense_policy: boolean
  /** Volume */
  volume: number | false
  /** Volume unit of measure label */
  volume_uom_name: string | false
  /** Warehouse */
  warehouse_id: [number, string] /* stock.warehouse */ | false
  /** Website Absolute URL — The full absolute URL to access the document through the website. */
  website_absolute_url: string | false
  /** Description for the website */
  website_description: string | false
  /** Website — Restrict to a specific website. */
  website_id: [number, string] /* website */ | false
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Website meta description */
  website_meta_description: string | false
  /** Website meta keywords */
  website_meta_keywords: string | false
  /** Website opengraph image */
  website_meta_og_img: string | false
  /** Website meta title */
  website_meta_title: string | false
  /** Visible on current website */
  website_published: boolean
  /** Ribbon */
  website_ribbon_id: [number, string] /* product.ribbon */ | false
  /** Website Sequence — Determine the display order in the Website E-commerce */
  website_sequence: number | false
  /** Size X */
  website_size_x: number | false
  /** Size Y */
  website_size_y: number | false
  /** Website URL — The full relative URL to access the document through the website. */
  website_url: string | false
  /** Weight */
  weight: number | false
  /** Weight unit of measure label */
  weight_uom_name: string | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for product.template */
export type ProductTemplateFieldName = ModelFieldName<ProductTemplateRecord>

/** Typed search_read result */
export type ProductTemplateSearchResult = ModelRecord<ProductTemplateRecord>
