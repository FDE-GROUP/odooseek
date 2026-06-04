// Auto-generated from res.users (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** res.users */
export interface ResUsersRecord extends BaseRecord {
  /** # Access Rights — Number of access rights that apply to the current user */
  accesses_count: number | false
  /** Account Move Count */
  account_move_count: number | false
  /** Home Action — If specified, this action will be opened at log on for this user, in addition to the standard menu. */
  action_id: [number, string] /* ir.actions.actions */ | false
  /** Active */
  active: boolean
  /** Active Lang Count */
  active_lang_count: number | false
  /** Partner is Active */
  active_partner: boolean
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
  /** Additional Note */
  additional_note: string | false
  /** Groups and implied groups */
  all_group_ids: number[] /* res.groups */ | false
  /** API Keys */
  api_key_ids: number[] /* res.users.apikeys */
  /** Applicants */
  applicant_ids: number[] /* hr.applicant */
  /** Stats */
  application_statistics: unknown | false
  /** Auth Passkey Key */
  auth_passkey_key_ids: number[] /* auth.passkey.key */
  /** Auto-post bills — Automatically post bills for this trusted partner */
  autopost_bills: 'always' | 'ask' | 'never'
  /** Available Invoice Template Pdf Report */
  available_invoice_template_pdf_report_ids: number[] /* ir.actions.report */
  /** Available Peppol Eas */
  available_peppol_eas: unknown | false
  /** Avatar 1024 */
  avatar_1024: string | false
  /** Avatar 128 */
  avatar_128: string | false
  /** Avatar */
  avatar_1920: string | false
  /** Avatar 256 */
  avatar_256: string | false
  /** Avatar 512 */
  avatar_512: string | false
  /** Badges */
  badge_ids: number[] /* gamification.badge.user */
  /** Bank */
  bank_account_count: number | false
  /** Bank Accounts — Employee bank accounts to pay salaries */
  bank_account_ids: number[] /* res.partner.bank */ | false
  /** Banks */
  bank_ids: number[] /* res.partner.bank */
  /** Badge ID — ID used for employee identification. */
  barcode: string | false
  /** Bronze badges count */
  bronze_badge: number | false
  /** Buyer */
  buyer_id: [number, string] /* res.users */ | false
  /** Calendar Default Privacy */
  calendar_default_privacy: 'public' | 'private' | 'confidential' | false
  /** Last notification marked as read from base Calendar */
  calendar_last_notif_ack: string | false
  /** Can Edit Role */
  can_edit_role: boolean
  /** Can Publish */
  can_publish: boolean
  /** Tags */
  category_id: number[] /* res.partner.category */ | false
  /** Employee Tags */
  category_ids: number[] /* hr.employee.category */ | false
  /** Channels */
  channel_ids: number[] /* discuss.channel */ | false
  /** Channel Member */
  channel_member_ids: number[] /* discuss.channel.member */
  /** Chatbot Script */
  chatbot_script_ids: number[] /* chatbot.script */
  /** Contact */
  child_ids: number[] /* res.partner */
  /** City */
  city: string | false
  /** Color Index */
  color: number | false
  /** Notes */
  comment: string | false
  /** Company Name Entity */
  commercial_company_name: string | false
  /** Commercial Entity */
  commercial_partner_id: [number, string] /* res.partner */ | false
  /** Number of Companies */
  companies_count: number | false
  /** Company — The default company for this user. */
  company_id: [number, string] /* res.company */
  /** Companies */
  company_ids: number[] /* res.company */ | false
  /** Company Name */
  company_name: string | false
  /** Company ID — The registry number of the company. Use it if it is different from the Tax ID. It must be unique across all partners of a same country */
  company_registry: string | false
  /** Company ID Label */
  company_registry_label: string | false
  /** Company Registry Placeholder */
  company_registry_placeholder: string | false
  /** Company Type */
  company_type: 'person' | 'company' | false
  /** Complete Name */
  complete_name: string | false
  /** Complete Address */
  contact_address: string | false
  /** Inlined Complete Address */
  contact_address_inline: string | false
  /** Partner Contracts */
  contract_ids: number[] /* account.analytic.account */
  /** Country Code — The ISO country code in two chars. 
You can use this field for quick search. */
  country_code: string | false
  /** Country */
  country_id: [number, string] /* res.country */ | false
  /** Create Date */
  create_date: string | false
  /** Technical field, whether to create an employee */
  create_employee: boolean
  /** Technical field, bind user to this employee on create */
  create_employee_id: [number, string] /* hr.employee */ | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Total Receivable — Total amount this customer owes you. */
  credit: number | false
  /** Credit Limit — Credit limit specific to this partner. */
  credit_limit: number | false
  /** Credit To Invoice */
  credit_to_invoice: number | false
  /** Sales Teams */
  crm_team_ids: number[] /* crm.team */ | false
  /** Sales Team Members */
  crm_team_member_ids: number[] /* crm.team.member */
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Customer Rank */
  customer_rank: number | false
  /** Geolocation Date */
  date_localization: string | false
  /** Days Sales Outstanding (DSO) — [(Total Receivable/Total Revenue) * number of days since the first invoice] for this customer */
  days_sales_outstanding: number | false
  /** Total Payable — Total amount you have to pay to this vendor. */
  debit: number | false
  /** User devices */
  device_ids: number[] /* res.device */
  /** Display Invoice Edi Format */
  display_invoice_edi_format: boolean
  /** Display Invoice Template Pdf Report */
  display_invoice_template_pdf_report_id: boolean
  /** Duplicate Bank Partner */
  duplicate_bank_partner_ids: number[] /* res.partner */ | false
  /** Email */
  email: string | false
  /** Email Domain Placeholder */
  email_domain_placeholder: string | false
  /** Formatted Email — Format email address "Name <email@domain>" */
  email_formatted: string | false
  /** Normalized Email — This field is used to search on email address as the primary email field can contain more than strictly an email address. */
  email_normalized: string | false
  /** Emergency Contact */
  emergency_contact: string | false
  /** Emergency Phone */
  emergency_phone: string | false
  /** Employee — Whether this contact is an Employee. */
  employee: boolean
  /** Employee\'s Bank Accounts — Employee bank accounts to pay salaries */
  employee_bank_account_ids: number[] /* res.partner.bank */ | false
  /** Employee Count */
  employee_count: number | false
  /** Company employee */
  employee_id: [number, string] /* hr.employee */ | false
  /** Related employee */
  employee_ids: number[] /* hr.employee */
  /** Employee\'s Working Hours */
  employee_resource_calendar_id: [number, string] /* resource.calendar */ | false
  /** Skills */
  employee_skill_ids: number[] /* hr.employee.skill */
  /** Employees Count */
  employees_count: number | false
  /** # Events */
  event_count: number | false
  /** Favorite Projects */
  favorite_project_ids: number[] /* project.project */ | false
  /** Fiscal Country Codes */
  fiscal_country_codes: string | false
  /** Fiscal Country Group Codes */
  fiscal_country_group_codes: unknown | false
  /** Fridays */
  friday_location_id: [number, string] /* hr.work.location */ | false
  /** Job Position */
  _function: string | false
  /** GLN — Global Location Number */
  global_location_number: string | false
  /** Goal */
  goal_ids: number[] /* gamification.goal */
  /** Gold badges count */
  gold_badge: number | false
  /** Groups — Groups explicitly assigned to the user */
  group_ids: number[] /* res.groups */ | false
  /** Week Day */
  group_on: 'default' | '1' | '2' | '3' | '4' | '5' | '6' | '7'
  /** Group RFQ — Define if RFQ should be grouped         together based on expected arrival, except for dropship operations.
         On Order: Replenishment needs will be grouped together except for MTO.
         Daily: Replenishment needs will be grouped if the expected arrival is the same day
         Weekly: Replenishment needs will be grouped if the expected arrival is the same week or week day
         Always: Replenishment needs will always be grouped. */
  group_rfq: 'default' | 'day' | 'week' | 'all'
  /** # Groups — Number of groups that apply to the current user */
  groups_count: number | false
  /** Has access to Livechat */
  has_access_livechat: boolean
  /** Has External Mail Server */
  has_external_mail_server: boolean
  /** Has Message */
  has_message: boolean
  /** Ignore Abnormal Invoice Amount */
  ignore_abnormal_invoice_amount: boolean
  /** Ignore Abnormal Invoice Date */
  ignore_abnormal_invoice_date: boolean
  /** IM Status */
  im_status: string | false
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
  /** Industry */
  industry_id: [number, string] /* res.partner.industry */ | false
  /** eInvoice format */
  invoice_edi_format: 'facturx' | 'ubl_bis3' | 'zugferd' | 'xrechnung' | 'nlcius' | 'ubl_a_nz' | 'ubl_sg' | false
  /** Invoice Edi Format Store */
  invoice_edi_format_store: string | false
  /** Invoices */
  invoice_ids: number[] /* account.move */
  /** Invoice sending */
  invoice_sending_method: 'manual' | 'email' | 'snailmail' | false
  /** Invoice report */
  invoice_template_pdf_report_id: [number, string] /* ir.actions.report */ | false
  /** Blacklist — If the email address is on the blacklist, the contact won\'t receive mass mailing anymore, from any list */
  is_blacklisted: boolean
  /** Is a Company — Check if the contact is a company, otherwise it is a person */
  is_company: boolean
  /** Is Hr User */
  is_hr_user: boolean
  /** Is in call */
  is_in_call: boolean
  /** Out of Office */
  is_out_of_office: boolean
  /** Is Peppol Edi Format */
  is_peppol_edi_format: boolean
  /** Is Pickup Location */
  is_pickup_location: boolean
  /** Is Public */
  is_public: boolean
  /** Is Published */
  is_published: boolean
  /** SEO optimized */
  is_seo_optimized: boolean
  /** Is System */
  is_system: boolean
  /** Is Ubl Format */
  is_ubl_format: boolean
  /** Job Title */
  job_title: string | false
  /** Karma */
  karma: number | false
  /** Karma Changes */
  karma_tracking_ids: number[] /* gamification.karma.tracking */
  /** Home-Work Distance in Km */
  km_home_work: number | false
  /** Language — All the emails and documents sent to this contact will be translated in this language. */
  lang: 'zh_CN' | false
  /** Livechat Channel Count */
  livechat_channel_count: number | false
  /** Livechat Channel */
  livechat_channel_ids: number[] /* im_livechat.channel */ | false
  /** Live Chat Expertise — When forwarding live chat conversations, the chatbot will prioritize users with matching expertise. */
  livechat_expertise_ids: number[] /* im_livechat.expertise */ | false
  /** Livechat Is In Call — Whether the user is in a call, only available if the user is in a live chat agent */
  livechat_is_in_call: boolean
  /** Livechat Languages */
  livechat_lang_ids: number[] /* res.lang */ | false
  /** Number of Ongoing sessions */
  livechat_ongoing_session_count: number | false
  /** Livechat Username */
  livechat_username: string | false
  /** User log entries */
  log_ids: number[] /* res.users.log */
  /** Login — Used to log into the system */
  login: string
  /** Latest Login */
  login_date: string | false
  /** Main User — There can be several users related to the same partner. When a single user is needed, this field attempts to find the most appropriate one. */
  main_user_id: [number, string] /* res.users */ | false
  /** IM status manually set by the user */
  manual_im_status: 'away' | 'busy' | 'offline' | false
  /** # Meetings */
  meeting_count: number | false
  /** Meetings */
  meeting_ids: number[] /* calendar.event */ | false
  /** Attachment Count */
  message_attachment_count: number | false
  /** Bounce — Counter of the number of bounced emails for this contact */
  message_bounce: number | false
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
  /** Work Mobile */
  mobile_phone: string | false
  /** Mondays */
  monday_location_id: [number, string] /* hr.work.location */ | false
  /** My Activity Deadline */
  my_activity_date_deadline: string | false
  /** Name */
  name: string | false
  /** Set Password — Specify a value only when creating a user or if you\'re changing the user\'s password, otherwise leave empty. After a change of password, the user has to login again. */
  new_password: string | false
  /** Next Rank */
  next_rank_id: [number, string] /* gamification.karma.rank */ | false
  /** Notification — Policy on how to handle Chatter notifications:
- By Emails: notifications are sent to your email address
- In Odoo: notifications appear in your Odoo Inbox */
  notification_type: 'email' | 'inbox'
  /** Odoobot Failed */
  odoobot_failed: boolean
  /** OdooBot Status */
  odoobot_state: 'not_initialized' | 'onboarding_emoji' | 'onboarding_attachement' | 'onboarding_command' | 'onboarding_ping' | 'onboarding_canned' | 'idle' | 'disabled' | false
  /** Offline since */
  offline_since: string | false
  /** On-Time Delivery Rate — Over the past x days; the number of products received on time divided by the number of ordered products.x is either the System Parameter purchase_stock.on_time_delivery_days or the default 365 */
  on_time_rate: number | false
  /** Opportunity Count */
  opportunity_count: number | false
  /** Opportunities */
  opportunity_ids: number[] /* crm.lead */
  /** Out Of Office From */
  out_of_office_from: string | false
  /** Vacation Responder */
  out_of_office_message: string | false
  /** Out Of Office To */
  out_of_office_to: string | false
  /** Outgoing Mail Server */
  outgoing_mail_server_id: [number, string] /* ir.mail_server */ | false
  /** Outgoing Mail Server Type */
  outgoing_mail_server_type: 'default' | 'gmail' | 'outlook'
  /** Related Company */
  parent_id: [number, string] /* res.partner */ | false
  /** Parent name */
  parent_name: string | false
  /** Partner Company Registry Placeholder */
  partner_company_registry_placeholder: string | false
  /** Related Partner — Partner-related data of the user */
  partner_id: [number, string] /* res.partner */
  /** Geo Latitude */
  partner_latitude: number | false
  /** Geo Longitude */
  partner_longitude: number | false
  /** Share Partner — Either customer (not a user), either shared user. Indicated the current partner is a customer without access or with a limited access created for sharing data. */
  partner_share: boolean
  /** Partner Vat Placeholder */
  partner_vat_placeholder: string | false
  /** Password — Keep empty if you don\'t want the user to be able to connect on the system. */
  password: string | false
  /** Payment Token Count */
  payment_token_count: number | false
  /** Payment Tokens */
  payment_token_ids: number[] /* payment.token */
  /** Peppol e-address (EAS) — Code used to identify the Endpoint for BIS Billing 3.0 and its derivatives.
             List available at https://docs.peppol.eu/poacc/billing/3.0/codelist/eas/ */
  peppol_eas: '9923' | '9922' | '0151' | '9914' | '9915' | '0208' | '9925' | '9924' | '9926' | '9934' | '9928' | '9929' | '0096' | '0184' | '0198' | '0191' | '9931' | '0037' | '0216' | '0213' | '0002' | '0009' | '9957' | '0225' | '0240' | '0246' | '0204' | '9930' | '9933' | '9910' | '0196' | '9935' | '0211' | '0097' | '0188' | '0221' | '0218' | '9939' | '9936' | '0200' | '9937' | '9938' | '9942' | '0230' | '9943' | '9940' | '9941' | '0106' | '0190' | '9944' | '0244' | '0192' | '9945' | '9946' | '9947' | '9948' | '0195' | '0245' | '9949' | '9950' | '9920' | '0007' | '9955' | '9927' | '0183' | '9952' | '0235' | '9932' | '9959' | '0060' | '0088' | '0130' | '0135' | '0142' | '0193' | '0199' | '0201' | '0202' | '0209' | '0210' | '9913' | '9918' | '9919' | '9951' | '9953' | 'AN' | 'AQ' | 'AS' | 'AU' | 'EM' | false
  /** Peppol Endpoint — Unique identifier used by the BIS Billing 3.0 and its derivatives, also known as \'Endpoint ID\'. */
  peppol_endpoint: string | false
  /** Phone */
  phone: string | false
  /** Blacklisted Phone is Phone — Indicates if a blacklisted sanitized phone number is a phone number. Helps distinguish which number is blacklisted             when there is both a mobile and phone field in a model. */
  phone_blacklisted: boolean
  /** Phone Number */
  phone_mobile_search: string | false
  /** Sanitized Number — Field used to store sanitized phone number. Helps speeding up searches and comparisons. */
  phone_sanitized: string | false
  /** Phone Blacklisted — If the sanitized phone number is on the blacklist, the contact won\'t receive mass mailing sms anymore, from any list */
  phone_sanitized_blacklisted: boolean
  /** Message for Stock Picking */
  picking_warn_msg: string | false
  /** PIN — PIN used to Check In/Out in the Kiosk Mode of the Attendance application (if enabled in Configuration) and to change the cashier in the Point of Sale application. */
  pin: string | false
  /** Presence */
  presence_ids: number[] /* mail.presence */
  /** Private City */
  private_city: string | false
  /** Private Country */
  private_country_id: [number, string] /* res.country */ | false
  /** Private Email */
  private_email: string | false
  /** Private Phone */
  private_phone: string | false
  /** Private State */
  private_state_id: [number, string] /* res.country.state */ | false
  /** Private Street */
  private_street: string | false
  /** Private Street2 */
  private_street2: string | false
  /** Private Zip */
  private_zip: string | false
  /** Projects */
  project_ids: number[] /* project.project */
  /** Properties */
  properties: unknown | false
  /** Properties Base Definition */
  properties_base_definition_id: [number, string] /* properties.base.definition */ | false
  /** Account Payable */
  property_account_payable_id: [number, string] /* account.account */ | false
  /** Fiscal Position — The fiscal position determines the taxes/accounts used for this contact. */
  property_account_position_id: [number, string] /* account.fiscal.position */ | false
  /** Account Receivable */
  property_account_receivable_id: [number, string] /* account.account */ | false
  /** Delivery Method — Used in sales orders. */
  property_delivery_carrier_id: [number, string] /* delivery.carrier */ | false
  /** Property Inbound Payment Method Line */
  property_inbound_payment_method_line_id: [number, string] /* account.payment.method.line */ | false
  /** Property Outbound Payment Method Line */
  property_outbound_payment_method_line_id: [number, string] /* account.payment.method.line */ | false
  /** Customer Payment Terms */
  property_payment_term_id: [number, string] /* account.payment.term */ | false
  /** Pricelist — Used for sales to the current partner */
  property_product_pricelist: [number, string] /* product.pricelist */ | false
  /** Supplier Currency — This currency will be used for purchases from the current partner */
  property_purchase_currency_id: [number, string] /* res.currency */ | false
  /** Customer Location — The stock location used as destination when sending goods to this contact. */
  property_stock_customer: [number, string] /* stock.location */ | false
  /** Vendor Location — The stock location used as source when receiving goods from this contact. */
  property_stock_supplier: [number, string] /* stock.location */ | false
  /** Vendor Payment Terms */
  property_supplier_payment_term_id: [number, string] /* account.payment.term */ | false
  /** Default Warehouse */
  property_warehouse_id: [number, string] /* stock.warehouse */ | false
  /** Purchase Lines */
  purchase_line_ids: number[] /* purchase.order.line */
  /** Purchase Order Count */
  purchase_order_count: number | false
  /** Message for Purchase Order */
  purchase_warn_msg: string | false
  /** Rank */
  rank_id: [number, string] /* gamification.karma.rank */ | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Receipt Reminder — Automatically send a confirmation email to the vendor X days before the expected receipt date, asking him to confirm the exact date. */
  receipt_reminder_email: boolean
  /** Reference */
  ref: string | false
  /** Companies that refers to partner */
  ref_company_ids: number[] /* res.company */
  /** Days Before Receipt — Number of days to send reminder email before the promised receipt date */
  reminder_date_before_receipt: number | false
  /** Settings */
  res_users_settings_id: [number, string] /* res.users.settings */ | false
  /** Res Users Settings */
  res_users_settings_ids: number[] /* res.users.settings */
  /** Default Working Hours — Define the working schedule of the resource. If not set, the resource will have fully flexible working hours. */
  resource_calendar_id: [number, string] /* resource.calendar */ | false
  /** Resources */
  resource_ids: number[] /* resource.resource */
  /** Role */
  role: 'group_user' | 'group_system' | false
  /** User Roles — Users are notified whenever one of their roles is @-mentioned in a conversation. */
  role_ids: number[] /* res.role */ | false
  /** Rtc Session */
  rtc_session_ids: number[] /* discuss.channel.rtc.session */
  /** # Record Rules — Number of record rules that apply to the current user */
  rules_count: number | false
  /** Sale Order Count */
  sale_order_count: number | false
  /** Sales Order */
  sale_order_ids: number[] /* sale.order */
  /** User Sales Team — Main user sales team. Used notably for pipeline, or to set sales team in invoicing or subscription. */
  sale_team_id: [number, string] /* crm.team */ | false
  /** Message for Sales Order */
  sale_warn_msg: string | false
  /** Partner with same Company Registry */
  same_company_registry_partner_id: [number, string] /* res.partner */ | false
  /** Partner with same Tax ID */
  same_vat_partner_id: [number, string] /* res.partner */ | false
  /** Saturdays */
  saturday_location_id: [number, string] /* hr.work.location */ | false
  /** Self */
  self: [number, string] /* res.partner */ | false
  /** Seo name */
  seo_name: string | false
  /** Share User — External user with limited access, created only for the purpose of sharing data. */
  share: boolean
  /** Show Credit Limit */
  show_credit_limit: boolean
  /** Email Signature */
  signature: string | false
  /** Signup Token Type */
  signup_type: string | false
  /** Silver badges count */
  silver_badge: number | false
  /** Specific Property Product Pricelist */
  specific_property_product_pricelist: [number, string] /* product.pricelist */ | false
  /** Status */
  state: 'new' | 'active' | false
  /** State */
  state_id: [number, string] /* res.country.state */ | false
  /** Static Map Url */
  static_map_url: string | false
  /** Static Map Url Is Valid */
  static_map_url_is_valid: boolean
  /** Street */
  street: string | false
  /** Street2 */
  street2: string | false
  /** Suggest Based On */
  suggest_based_on: string | false
  /** Suggest Days */
  suggest_days: number | false
  /** Suggest Percent */
  suggest_percent: number | false
  /** Sundays */
  sunday_location_id: [number, string] /* hr.work.location */ | false
  /** # Vendor Bills */
  supplier_invoice_count: number | false
  /** Supplier Rank */
  supplier_rank: number | false
  /** # Tasks */
  task_count: number | false
  /** Tasks */
  task_ids: number[] /* project.task */
  /** Thursdays */
  thursday_location_id: [number, string] /* hr.work.location */ | false
  /** Total Invoiced */
  total_invoiced: number | false
  /** Two-factor authentication */
  totp_enabled: boolean
  /** Trusted Devices */
  totp_trusted_device_ids: number[] /* auth_totp.device */
  /** Onboarding */
  tour_enabled: boolean
  /** Degree of trust you have in this debtor */
  trust: 'good' | 'normal' | 'bad' | false
  /** Tuesdays */
  tuesday_location_id: [number, string] /* hr.work.location */ | false
  /** Address Type */
  _type: 'contact' | 'invoice' | 'delivery' | 'other' | false
  /** Address Type Description */
  type_address_label: string | false
  /** Timezone — When printing documents and exporting/importing data, time values are computed according to this timezone.
If the timezone is not set, UTC (Coordinated Universal Time) is used.
Anywhere else, time values are computed according to the time offset of your web client. */
  tz: 'Africa/Abidjan' | 'Africa/Accra' | 'Africa/Addis_Ababa' | 'Africa/Algiers' | 'Africa/Asmara' | 'Africa/Bamako' | 'Africa/Bangui' | 'Africa/Banjul' | 'Africa/Bissau' | 'Africa/Blantyre' | 'Africa/Brazzaville' | 'Africa/Bujumbura' | 'Africa/Cairo' | 'Africa/Casablanca' | 'Africa/Ceuta' | 'Africa/Conakry' | 'Africa/Dakar' | 'Africa/Dar_es_Salaam' | 'Africa/Djibouti' | 'Africa/Douala' | 'Africa/El_Aaiun' | 'Africa/Freetown' | 'Africa/Gaborone' | 'Africa/Harare' | 'Africa/Johannesburg' | 'Africa/Juba' | 'Africa/Kampala' | 'Africa/Khartoum' | 'Africa/Kigali' | 'Africa/Kinshasa' | 'Africa/Lagos' | 'Africa/Libreville' | 'Africa/Lome' | 'Africa/Luanda' | 'Africa/Lubumbashi' | 'Africa/Lusaka' | 'Africa/Malabo' | 'Africa/Maputo' | 'Africa/Maseru' | 'Africa/Mbabane' | 'Africa/Mogadishu' | 'Africa/Monrovia' | 'Africa/Nairobi' | 'Africa/Ndjamena' | 'Africa/Niamey' | 'Africa/Nouakchott' | 'Africa/Ouagadougou' | 'Africa/Porto-Novo' | 'Africa/Sao_Tome' | 'Africa/Timbuktu' | 'Africa/Tripoli' | 'Africa/Tunis' | 'Africa/Windhoek' | 'America/Adak' | 'America/Anchorage' | 'America/Anguilla' | 'America/Antigua' | 'America/Araguaina' | 'America/Argentina/Buenos_Aires' | 'America/Argentina/Catamarca' | 'America/Argentina/Cordoba' | 'America/Argentina/Jujuy' | 'America/Argentina/La_Rioja' | 'America/Argentina/Mendoza' | 'America/Argentina/Rio_Gallegos' | 'America/Argentina/Salta' | 'America/Argentina/San_Juan' | 'America/Argentina/San_Luis' | 'America/Argentina/Tucuman' | 'America/Argentina/Ushuaia' | 'America/Aruba' | 'America/Asuncion' | 'America/Atikokan' | 'America/Atka' | 'America/Bahia' | 'America/Bahia_Banderas' | 'America/Barbados' | 'America/Belem' | 'America/Belize' | 'America/Blanc-Sablon' | 'America/Boa_Vista' | 'America/Bogota' | 'America/Boise' | 'America/Cambridge_Bay' | 'America/Campo_Grande' | 'America/Cancun' | 'America/Caracas' | 'America/Cayenne' | 'America/Cayman' | 'America/Chicago' | 'America/Chihuahua' | 'America/Ciudad_Juarez' | 'America/Coral_Harbour' | 'America/Costa_Rica' | 'America/Coyhaique' | 'America/Creston' | 'America/Cuiaba' | 'America/Curacao' | 'America/Danmarkshavn' | 'America/Dawson' | 'America/Dawson_Creek' | 'America/Denver' | 'America/Detroit' | 'America/Dominica' | 'America/Edmonton' | 'America/Eirunepe' | 'America/El_Salvador' | 'America/Ensenada' | 'America/Fort_Nelson' | 'America/Fortaleza' | 'America/Glace_Bay' | 'America/Goose_Bay' | 'America/Grand_Turk' | 'America/Grenada' | 'America/Guadeloupe' | 'America/Guatemala' | 'America/Guayaquil' | 'America/Guyana' | 'America/Halifax' | 'America/Havana' | 'America/Hermosillo' | 'America/Indiana/Indianapolis' | 'America/Indiana/Knox' | 'America/Indiana/Marengo' | 'America/Indiana/Petersburg' | 'America/Indiana/Tell_City' | 'America/Indiana/Vevay' | 'America/Indiana/Vincennes' | 'America/Indiana/Winamac' | 'America/Inuvik' | 'America/Iqaluit' | 'America/Jamaica' | 'America/Juneau' | 'America/Kentucky/Louisville' | 'America/Kentucky/Monticello' | 'America/Kralendijk' | 'America/La_Paz' | 'America/Lima' | 'America/Los_Angeles' | 'America/Lower_Princes' | 'America/Maceio' | 'America/Managua' | 'America/Manaus' | 'America/Marigot' | 'America/Martinique' | 'America/Matamoros' | 'America/Mazatlan' | 'America/Menominee' | 'America/Merida' | 'America/Metlakatla' | 'America/Mexico_City' | 'America/Miquelon' | 'America/Moncton' | 'America/Monterrey' | 'America/Montevideo' | 'America/Montreal' | 'America/Montserrat' | 'America/Nassau' | 'America/New_York' | 'America/Nipigon' | 'America/Nome' | 'America/Noronha' | 'America/North_Dakota/Beulah' | 'America/North_Dakota/Center' | 'America/North_Dakota/New_Salem' | 'America/Nuuk' | 'America/Ojinaga' | 'America/Panama' | 'America/Pangnirtung' | 'America/Paramaribo' | 'America/Phoenix' | 'America/Port-au-Prince' | 'America/Port_of_Spain' | 'America/Porto_Acre' | 'America/Porto_Velho' | 'America/Puerto_Rico' | 'America/Punta_Arenas' | 'America/Rainy_River' | 'America/Rankin_Inlet' | 'America/Recife' | 'America/Regina' | 'America/Resolute' | 'America/Rio_Branco' | 'America/Santa_Isabel' | 'America/Santarem' | 'America/Santiago' | 'America/Santo_Domingo' | 'America/Sao_Paulo' | 'America/Scoresbysund' | 'America/Shiprock' | 'America/Sitka' | 'America/St_Barthelemy' | 'America/St_Johns' | 'America/St_Kitts' | 'America/St_Lucia' | 'America/St_Thomas' | 'America/St_Vincent' | 'America/Swift_Current' | 'America/Tegucigalpa' | 'America/Thule' | 'America/Thunder_Bay' | 'America/Tijuana' | 'America/Toronto' | 'America/Tortola' | 'America/Vancouver' | 'America/Virgin' | 'America/Whitehorse' | 'America/Winnipeg' | 'America/Yakutat' | 'America/Yellowknife' | 'Antarctica/Casey' | 'Antarctica/Davis' | 'Antarctica/DumontDUrville' | 'Antarctica/Macquarie' | 'Antarctica/Mawson' | 'Antarctica/McMurdo' | 'Antarctica/Palmer' | 'Antarctica/Rothera' | 'Antarctica/Syowa' | 'Antarctica/Troll' | 'Antarctica/Vostok' | 'Arctic/Longyearbyen' | 'Asia/Aden' | 'Asia/Almaty' | 'Asia/Amman' | 'Asia/Anadyr' | 'Asia/Aqtau' | 'Asia/Aqtobe' | 'Asia/Ashgabat' | 'Asia/Atyrau' | 'Asia/Baghdad' | 'Asia/Bahrain' | 'Asia/Baku' | 'Asia/Bangkok' | 'Asia/Barnaul' | 'Asia/Beirut' | 'Asia/Bishkek' | 'Asia/Brunei' | 'Asia/Chita' | 'Asia/Choibalsan' | 'Asia/Chongqing' | 'Asia/Colombo' | 'Asia/Damascus' | 'Asia/Dhaka' | 'Asia/Dili' | 'Asia/Dubai' | 'Asia/Dushanbe' | 'Asia/Famagusta' | 'Asia/Gaza' | 'Asia/Harbin' | 'Asia/Hebron' | 'Asia/Ho_Chi_Minh' | 'Asia/Hong_Kong' | 'Asia/Hovd' | 'Asia/Irkutsk' | 'Asia/Istanbul' | 'Asia/Jakarta' | 'Asia/Jayapura' | 'Asia/Jerusalem' | 'Asia/Kabul' | 'Asia/Kamchatka' | 'Asia/Karachi' | 'Asia/Kashgar' | 'Asia/Kathmandu' | 'Asia/Khandyga' | 'Asia/Kolkata' | 'Asia/Krasnoyarsk' | 'Asia/Kuala_Lumpur' | 'Asia/Kuching' | 'Asia/Kuwait' | 'Asia/Macau' | 'Asia/Magadan' | 'Asia/Makassar' | 'Asia/Manila' | 'Asia/Muscat' | 'Asia/Nicosia' | 'Asia/Novokuznetsk' | 'Asia/Novosibirsk' | 'Asia/Omsk' | 'Asia/Oral' | 'Asia/Phnom_Penh' | 'Asia/Pontianak' | 'Asia/Pyongyang' | 'Asia/Qatar' | 'Asia/Qostanay' | 'Asia/Qyzylorda' | 'Asia/Riyadh' | 'Asia/Sakhalin' | 'Asia/Samarkand' | 'Asia/Seoul' | 'Asia/Shanghai' | 'Asia/Singapore' | 'Asia/Srednekolymsk' | 'Asia/Taipei' | 'Asia/Tashkent' | 'Asia/Tbilisi' | 'Asia/Tehran' | 'Asia/Tel_Aviv' | 'Asia/Thimphu' | 'Asia/Tokyo' | 'Asia/Tomsk' | 'Asia/Ulaanbaatar' | 'Asia/Urumqi' | 'Asia/Ust-Nera' | 'Asia/Vientiane' | 'Asia/Vladivostok' | 'Asia/Yakutsk' | 'Asia/Yangon' | 'Asia/Yekaterinburg' | 'Asia/Yerevan' | 'Atlantic/Azores' | 'Atlantic/Bermuda' | 'Atlantic/Canary' | 'Atlantic/Cape_Verde' | 'Atlantic/Faroe' | 'Atlantic/Jan_Mayen' | 'Atlantic/Madeira' | 'Atlantic/Reykjavik' | 'Atlantic/South_Georgia' | 'Atlantic/St_Helena' | 'Atlantic/Stanley' | 'Australia/Adelaide' | 'Australia/Brisbane' | 'Australia/Broken_Hill' | 'Australia/Canberra' | 'Australia/Currie' | 'Australia/Darwin' | 'Australia/Eucla' | 'Australia/Hobart' | 'Australia/Lindeman' | 'Australia/Lord_Howe' | 'Australia/Melbourne' | 'Australia/Perth' | 'Australia/Sydney' | 'Australia/Yancowinna' | 'CET' | 'CST6CDT' | 'EET' | 'EST' | 'EST5EDT' | 'Europe/Amsterdam' | 'Europe/Andorra' | 'Europe/Astrakhan' | 'Europe/Athens' | 'Europe/Belfast' | 'Europe/Belgrade' | 'Europe/Berlin' | 'Europe/Bratislava' | 'Europe/Brussels' | 'Europe/Bucharest' | 'Europe/Budapest' | 'Europe/Busingen' | 'Europe/Chisinau' | 'Europe/Copenhagen' | 'Europe/Dublin' | 'Europe/Gibraltar' | 'Europe/Guernsey' | 'Europe/Helsinki' | 'Europe/Isle_of_Man' | 'Europe/Istanbul' | 'Europe/Jersey' | 'Europe/Kaliningrad' | 'Europe/Kirov' | 'Europe/Kyiv' | 'Europe/Lisbon' | 'Europe/Ljubljana' | 'Europe/London' | 'Europe/Luxembourg' | 'Europe/Madrid' | 'Europe/Malta' | 'Europe/Mariehamn' | 'Europe/Minsk' | 'Europe/Monaco' | 'Europe/Moscow' | 'Europe/Nicosia' | 'Europe/Oslo' | 'Europe/Paris' | 'Europe/Podgorica' | 'Europe/Prague' | 'Europe/Riga' | 'Europe/Rome' | 'Europe/Samara' | 'Europe/San_Marino' | 'Europe/Sarajevo' | 'Europe/Saratov' | 'Europe/Simferopol' | 'Europe/Skopje' | 'Europe/Sofia' | 'Europe/Stockholm' | 'Europe/Tallinn' | 'Europe/Tirane' | 'Europe/Tiraspol' | 'Europe/Ulyanovsk' | 'Europe/Vaduz' | 'Europe/Vatican' | 'Europe/Vienna' | 'Europe/Vilnius' | 'Europe/Volgograd' | 'Europe/Warsaw' | 'Europe/Zagreb' | 'Europe/Zurich' | 'GMT' | 'HST' | 'Indian/Antananarivo' | 'Indian/Chagos' | 'Indian/Christmas' | 'Indian/Cocos' | 'Indian/Comoro' | 'Indian/Kerguelen' | 'Indian/Mahe' | 'Indian/Maldives' | 'Indian/Mauritius' | 'Indian/Mayotte' | 'Indian/Reunion' | 'MET' | 'MST' | 'MST7MDT' | 'PST8PDT' | 'Pacific/Apia' | 'Pacific/Auckland' | 'Pacific/Bougainville' | 'Pacific/Chatham' | 'Pacific/Chuuk' | 'Pacific/Easter' | 'Pacific/Efate' | 'Pacific/Fakaofo' | 'Pacific/Fiji' | 'Pacific/Funafuti' | 'Pacific/Galapagos' | 'Pacific/Gambier' | 'Pacific/Guadalcanal' | 'Pacific/Guam' | 'Pacific/Honolulu' | 'Pacific/Johnston' | 'Pacific/Kanton' | 'Pacific/Kiritimati' | 'Pacific/Kosrae' | 'Pacific/Kwajalein' | 'Pacific/Majuro' | 'Pacific/Marquesas' | 'Pacific/Midway' | 'Pacific/Nauru' | 'Pacific/Niue' | 'Pacific/Norfolk' | 'Pacific/Noumea' | 'Pacific/Pago_Pago' | 'Pacific/Palau' | 'Pacific/Pitcairn' | 'Pacific/Pohnpei' | 'Pacific/Port_Moresby' | 'Pacific/Rarotonga' | 'Pacific/Saipan' | 'Pacific/Samoa' | 'Pacific/Tahiti' | 'Pacific/Tarawa' | 'Pacific/Tongatapu' | 'Pacific/Wake' | 'Pacific/Wallis' | 'Pacific/Yap' | 'UTC' | 'WET' | 'Etc/GMT' | 'Etc/GMT+0' | 'Etc/GMT+1' | 'Etc/GMT+10' | 'Etc/GMT+11' | 'Etc/GMT+12' | 'Etc/GMT+2' | 'Etc/GMT+3' | 'Etc/GMT+4' | 'Etc/GMT+5' | 'Etc/GMT+6' | 'Etc/GMT+7' | 'Etc/GMT+8' | 'Etc/GMT+9' | 'Etc/GMT-0' | 'Etc/GMT-1' | 'Etc/GMT-10' | 'Etc/GMT-11' | 'Etc/GMT-12' | 'Etc/GMT-13' | 'Etc/GMT-14' | 'Etc/GMT-2' | 'Etc/GMT-3' | 'Etc/GMT-4' | 'Etc/GMT-5' | 'Etc/GMT-6' | 'Etc/GMT-7' | 'Etc/GMT-8' | 'Etc/GMT-9' | 'Etc/GMT0' | 'Etc/Greenwich' | 'Etc/UCT' | 'Etc/UTC' | 'Etc/Universal' | 'Etc/Zulu' | false
  /** Timezone offset */
  tz_offset: string | false
  /** Partner Limit — Set a value greater than 0.0 to activate a credit limit check */
  use_partner_credit_limit: boolean
  /** Salesperson — The internal user in charge of this contact. */
  user_id: [number, string] /* res.users */ | false
  /** Users */
  user_ids: number[] /* res.users */
  /** User Livechat Username */
  user_livechat_username: string | false
  /** Tax ID — The Tax Identification Number. Values here will be validated based on the country format. You can use \'/\' to indicate that the partner is not subject to tax. */
  vat: string | false
  /** Tax ID Label */
  vat_label: string | false
  /** Technical field for user group setting */
  view_group_hierarchy: unknown | false
  /** Visa Expiration Date */
  visa_expire: string | false
  /** Visitors */
  visitor_ids: number[] /* website.visitor */
  /** Website Link */
  website: string | false
  /** Website Absolute URL — The full absolute URL to access the document through the website. */
  website_absolute_url: string | false
  /** Website Partner Full Description */
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
  /** Website Partner Short Description */
  website_short_description: string | false
  /** Website URL — The full relative URL to access the document through the website. */
  website_url: string | false
  /** Wednesdays */
  wednesday_location_id: [number, string] /* hr.work.location */ | false
  /** Wishlist */
  wishlist_ids: number[] /* product.wishlist */
  /** Work Contact */
  work_contact_id: [number, string] /* res.partner */ | false
  /** Work Email */
  work_email: string | false
  /** Work Location */
  work_location_id: [number, string] /* hr.work.location */ | false
  /** Work Location Name */
  work_location_name: string | false
  /** Work Location Type */
  work_location_type: 'home' | 'office' | 'other' | false
  /** Work Phone */
  work_phone: string | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Zip */
  zip: string | false
}

/** Field names for res.users */
export type ResUsersFieldName = ModelFieldName<ResUsersRecord>

/** Typed search_read result */
export type ResUsersSearchResult = ModelRecord<ResUsersRecord>
