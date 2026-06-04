// Auto-generated from hr.employee (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** hr.employee */
export interface HrEmployeeRecord extends BaseRecord {
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
  /** Avatar */
  avatar_1920: string | false
  /** Avatar 1024 */
  avatar_1024: string | false
  /** Avatar 512 */
  avatar_512: string | false
  /** Avatar 256 */
  avatar_256: string | false
  /** Avatar 128 */
  avatar_128: string | false
  /** Resource */
  resource_id: [number, string] /* resource.resource */
  /** Company */
  company_id: [number, string] /* res.company */
  /** Working Hours */
  resource_calendar_id: [number, string] /* resource.calendar */ | false
  /** Timezone — This field is used in order to define in which timezone the resources will work. */
  tz: 'Africa/Abidjan' | 'Africa/Accra' | 'Africa/Addis_Ababa' | 'Africa/Algiers' | 'Africa/Asmara' | 'Africa/Bamako' | 'Africa/Bangui' | 'Africa/Banjul' | 'Africa/Bissau' | 'Africa/Blantyre' | 'Africa/Brazzaville' | 'Africa/Bujumbura' | 'Africa/Cairo' | 'Africa/Casablanca' | 'Africa/Ceuta' | 'Africa/Conakry' | 'Africa/Dakar' | 'Africa/Dar_es_Salaam' | 'Africa/Djibouti' | 'Africa/Douala' | 'Africa/El_Aaiun' | 'Africa/Freetown' | 'Africa/Gaborone' | 'Africa/Harare' | 'Africa/Johannesburg' | 'Africa/Juba' | 'Africa/Kampala' | 'Africa/Khartoum' | 'Africa/Kigali' | 'Africa/Kinshasa' | 'Africa/Lagos' | 'Africa/Libreville' | 'Africa/Lome' | 'Africa/Luanda' | 'Africa/Lubumbashi' | 'Africa/Lusaka' | 'Africa/Malabo' | 'Africa/Maputo' | 'Africa/Maseru' | 'Africa/Mbabane' | 'Africa/Mogadishu' | 'Africa/Monrovia' | 'Africa/Nairobi' | 'Africa/Ndjamena' | 'Africa/Niamey' | 'Africa/Nouakchott' | 'Africa/Ouagadougou' | 'Africa/Porto-Novo' | 'Africa/Sao_Tome' | 'Africa/Timbuktu' | 'Africa/Tripoli' | 'Africa/Tunis' | 'Africa/Windhoek' | 'America/Adak' | 'America/Anchorage' | 'America/Anguilla' | 'America/Antigua' | 'America/Araguaina' | 'America/Argentina/Buenos_Aires' | 'America/Argentina/Catamarca' | 'America/Argentina/Cordoba' | 'America/Argentina/Jujuy' | 'America/Argentina/La_Rioja' | 'America/Argentina/Mendoza' | 'America/Argentina/Rio_Gallegos' | 'America/Argentina/Salta' | 'America/Argentina/San_Juan' | 'America/Argentina/San_Luis' | 'America/Argentina/Tucuman' | 'America/Argentina/Ushuaia' | 'America/Aruba' | 'America/Asuncion' | 'America/Atikokan' | 'America/Atka' | 'America/Bahia' | 'America/Bahia_Banderas' | 'America/Barbados' | 'America/Belem' | 'America/Belize' | 'America/Blanc-Sablon' | 'America/Boa_Vista' | 'America/Bogota' | 'America/Boise' | 'America/Cambridge_Bay' | 'America/Campo_Grande' | 'America/Cancun' | 'America/Caracas' | 'America/Cayenne' | 'America/Cayman' | 'America/Chicago' | 'America/Chihuahua' | 'America/Ciudad_Juarez' | 'America/Coral_Harbour' | 'America/Costa_Rica' | 'America/Coyhaique' | 'America/Creston' | 'America/Cuiaba' | 'America/Curacao' | 'America/Danmarkshavn' | 'America/Dawson' | 'America/Dawson_Creek' | 'America/Denver' | 'America/Detroit' | 'America/Dominica' | 'America/Edmonton' | 'America/Eirunepe' | 'America/El_Salvador' | 'America/Ensenada' | 'America/Fort_Nelson' | 'America/Fortaleza' | 'America/Glace_Bay' | 'America/Goose_Bay' | 'America/Grand_Turk' | 'America/Grenada' | 'America/Guadeloupe' | 'America/Guatemala' | 'America/Guayaquil' | 'America/Guyana' | 'America/Halifax' | 'America/Havana' | 'America/Hermosillo' | 'America/Indiana/Indianapolis' | 'America/Indiana/Knox' | 'America/Indiana/Marengo' | 'America/Indiana/Petersburg' | 'America/Indiana/Tell_City' | 'America/Indiana/Vevay' | 'America/Indiana/Vincennes' | 'America/Indiana/Winamac' | 'America/Inuvik' | 'America/Iqaluit' | 'America/Jamaica' | 'America/Juneau' | 'America/Kentucky/Louisville' | 'America/Kentucky/Monticello' | 'America/Kralendijk' | 'America/La_Paz' | 'America/Lima' | 'America/Los_Angeles' | 'America/Lower_Princes' | 'America/Maceio' | 'America/Managua' | 'America/Manaus' | 'America/Marigot' | 'America/Martinique' | 'America/Matamoros' | 'America/Mazatlan' | 'America/Menominee' | 'America/Merida' | 'America/Metlakatla' | 'America/Mexico_City' | 'America/Miquelon' | 'America/Moncton' | 'America/Monterrey' | 'America/Montevideo' | 'America/Montreal' | 'America/Montserrat' | 'America/Nassau' | 'America/New_York' | 'America/Nipigon' | 'America/Nome' | 'America/Noronha' | 'America/North_Dakota/Beulah' | 'America/North_Dakota/Center' | 'America/North_Dakota/New_Salem' | 'America/Nuuk' | 'America/Ojinaga' | 'America/Panama' | 'America/Pangnirtung' | 'America/Paramaribo' | 'America/Phoenix' | 'America/Port-au-Prince' | 'America/Port_of_Spain' | 'America/Porto_Acre' | 'America/Porto_Velho' | 'America/Puerto_Rico' | 'America/Punta_Arenas' | 'America/Rainy_River' | 'America/Rankin_Inlet' | 'America/Recife' | 'America/Regina' | 'America/Resolute' | 'America/Rio_Branco' | 'America/Santa_Isabel' | 'America/Santarem' | 'America/Santiago' | 'America/Santo_Domingo' | 'America/Sao_Paulo' | 'America/Scoresbysund' | 'America/Shiprock' | 'America/Sitka' | 'America/St_Barthelemy' | 'America/St_Johns' | 'America/St_Kitts' | 'America/St_Lucia' | 'America/St_Thomas' | 'America/St_Vincent' | 'America/Swift_Current' | 'America/Tegucigalpa' | 'America/Thule' | 'America/Thunder_Bay' | 'America/Tijuana' | 'America/Toronto' | 'America/Tortola' | 'America/Vancouver' | 'America/Virgin' | 'America/Whitehorse' | 'America/Winnipeg' | 'America/Yakutat' | 'America/Yellowknife' | 'Antarctica/Casey' | 'Antarctica/Davis' | 'Antarctica/DumontDUrville' | 'Antarctica/Macquarie' | 'Antarctica/Mawson' | 'Antarctica/McMurdo' | 'Antarctica/Palmer' | 'Antarctica/Rothera' | 'Antarctica/Syowa' | 'Antarctica/Troll' | 'Antarctica/Vostok' | 'Arctic/Longyearbyen' | 'Asia/Aden' | 'Asia/Almaty' | 'Asia/Amman' | 'Asia/Anadyr' | 'Asia/Aqtau' | 'Asia/Aqtobe' | 'Asia/Ashgabat' | 'Asia/Atyrau' | 'Asia/Baghdad' | 'Asia/Bahrain' | 'Asia/Baku' | 'Asia/Bangkok' | 'Asia/Barnaul' | 'Asia/Beirut' | 'Asia/Bishkek' | 'Asia/Brunei' | 'Asia/Chita' | 'Asia/Choibalsan' | 'Asia/Chongqing' | 'Asia/Colombo' | 'Asia/Damascus' | 'Asia/Dhaka' | 'Asia/Dili' | 'Asia/Dubai' | 'Asia/Dushanbe' | 'Asia/Famagusta' | 'Asia/Gaza' | 'Asia/Harbin' | 'Asia/Hebron' | 'Asia/Ho_Chi_Minh' | 'Asia/Hong_Kong' | 'Asia/Hovd' | 'Asia/Irkutsk' | 'Asia/Istanbul' | 'Asia/Jakarta' | 'Asia/Jayapura' | 'Asia/Jerusalem' | 'Asia/Kabul' | 'Asia/Kamchatka' | 'Asia/Karachi' | 'Asia/Kashgar' | 'Asia/Kathmandu' | 'Asia/Khandyga' | 'Asia/Kolkata' | 'Asia/Krasnoyarsk' | 'Asia/Kuala_Lumpur' | 'Asia/Kuching' | 'Asia/Kuwait' | 'Asia/Macau' | 'Asia/Magadan' | 'Asia/Makassar' | 'Asia/Manila' | 'Asia/Muscat' | 'Asia/Nicosia' | 'Asia/Novokuznetsk' | 'Asia/Novosibirsk' | 'Asia/Omsk' | 'Asia/Oral' | 'Asia/Phnom_Penh' | 'Asia/Pontianak' | 'Asia/Pyongyang' | 'Asia/Qatar' | 'Asia/Qostanay' | 'Asia/Qyzylorda' | 'Asia/Riyadh' | 'Asia/Sakhalin' | 'Asia/Samarkand' | 'Asia/Seoul' | 'Asia/Shanghai' | 'Asia/Singapore' | 'Asia/Srednekolymsk' | 'Asia/Taipei' | 'Asia/Tashkent' | 'Asia/Tbilisi' | 'Asia/Tehran' | 'Asia/Tel_Aviv' | 'Asia/Thimphu' | 'Asia/Tokyo' | 'Asia/Tomsk' | 'Asia/Ulaanbaatar' | 'Asia/Urumqi' | 'Asia/Ust-Nera' | 'Asia/Vientiane' | 'Asia/Vladivostok' | 'Asia/Yakutsk' | 'Asia/Yangon' | 'Asia/Yekaterinburg' | 'Asia/Yerevan' | 'Atlantic/Azores' | 'Atlantic/Bermuda' | 'Atlantic/Canary' | 'Atlantic/Cape_Verde' | 'Atlantic/Faroe' | 'Atlantic/Jan_Mayen' | 'Atlantic/Madeira' | 'Atlantic/Reykjavik' | 'Atlantic/South_Georgia' | 'Atlantic/St_Helena' | 'Atlantic/Stanley' | 'Australia/Adelaide' | 'Australia/Brisbane' | 'Australia/Broken_Hill' | 'Australia/Canberra' | 'Australia/Currie' | 'Australia/Darwin' | 'Australia/Eucla' | 'Australia/Hobart' | 'Australia/Lindeman' | 'Australia/Lord_Howe' | 'Australia/Melbourne' | 'Australia/Perth' | 'Australia/Sydney' | 'Australia/Yancowinna' | 'CET' | 'CST6CDT' | 'EET' | 'EST' | 'EST5EDT' | 'Europe/Amsterdam' | 'Europe/Andorra' | 'Europe/Astrakhan' | 'Europe/Athens' | 'Europe/Belfast' | 'Europe/Belgrade' | 'Europe/Berlin' | 'Europe/Bratislava' | 'Europe/Brussels' | 'Europe/Bucharest' | 'Europe/Budapest' | 'Europe/Busingen' | 'Europe/Chisinau' | 'Europe/Copenhagen' | 'Europe/Dublin' | 'Europe/Gibraltar' | 'Europe/Guernsey' | 'Europe/Helsinki' | 'Europe/Isle_of_Man' | 'Europe/Istanbul' | 'Europe/Jersey' | 'Europe/Kaliningrad' | 'Europe/Kirov' | 'Europe/Kyiv' | 'Europe/Lisbon' | 'Europe/Ljubljana' | 'Europe/London' | 'Europe/Luxembourg' | 'Europe/Madrid' | 'Europe/Malta' | 'Europe/Mariehamn' | 'Europe/Minsk' | 'Europe/Monaco' | 'Europe/Moscow' | 'Europe/Nicosia' | 'Europe/Oslo' | 'Europe/Paris' | 'Europe/Podgorica' | 'Europe/Prague' | 'Europe/Riga' | 'Europe/Rome' | 'Europe/Samara' | 'Europe/San_Marino' | 'Europe/Sarajevo' | 'Europe/Saratov' | 'Europe/Simferopol' | 'Europe/Skopje' | 'Europe/Sofia' | 'Europe/Stockholm' | 'Europe/Tallinn' | 'Europe/Tirane' | 'Europe/Tiraspol' | 'Europe/Ulyanovsk' | 'Europe/Vaduz' | 'Europe/Vatican' | 'Europe/Vienna' | 'Europe/Vilnius' | 'Europe/Volgograd' | 'Europe/Warsaw' | 'Europe/Zagreb' | 'Europe/Zurich' | 'GMT' | 'HST' | 'Indian/Antananarivo' | 'Indian/Chagos' | 'Indian/Christmas' | 'Indian/Cocos' | 'Indian/Comoro' | 'Indian/Kerguelen' | 'Indian/Mahe' | 'Indian/Maldives' | 'Indian/Mauritius' | 'Indian/Mayotte' | 'Indian/Reunion' | 'MET' | 'MST' | 'MST7MDT' | 'PST8PDT' | 'Pacific/Apia' | 'Pacific/Auckland' | 'Pacific/Bougainville' | 'Pacific/Chatham' | 'Pacific/Chuuk' | 'Pacific/Easter' | 'Pacific/Efate' | 'Pacific/Fakaofo' | 'Pacific/Fiji' | 'Pacific/Funafuti' | 'Pacific/Galapagos' | 'Pacific/Gambier' | 'Pacific/Guadalcanal' | 'Pacific/Guam' | 'Pacific/Honolulu' | 'Pacific/Johnston' | 'Pacific/Kanton' | 'Pacific/Kiritimati' | 'Pacific/Kosrae' | 'Pacific/Kwajalein' | 'Pacific/Majuro' | 'Pacific/Marquesas' | 'Pacific/Midway' | 'Pacific/Nauru' | 'Pacific/Niue' | 'Pacific/Norfolk' | 'Pacific/Noumea' | 'Pacific/Pago_Pago' | 'Pacific/Palau' | 'Pacific/Pitcairn' | 'Pacific/Pohnpei' | 'Pacific/Port_Moresby' | 'Pacific/Rarotonga' | 'Pacific/Saipan' | 'Pacific/Samoa' | 'Pacific/Tahiti' | 'Pacific/Tarawa' | 'Pacific/Tongatapu' | 'Pacific/Wake' | 'Pacific/Wallis' | 'Pacific/Yap' | 'UTC' | 'WET' | 'Etc/GMT' | 'Etc/GMT+0' | 'Etc/GMT+1' | 'Etc/GMT+10' | 'Etc/GMT+11' | 'Etc/GMT+12' | 'Etc/GMT+2' | 'Etc/GMT+3' | 'Etc/GMT+4' | 'Etc/GMT+5' | 'Etc/GMT+6' | 'Etc/GMT+7' | 'Etc/GMT+8' | 'Etc/GMT+9' | 'Etc/GMT-0' | 'Etc/GMT-1' | 'Etc/GMT-10' | 'Etc/GMT-11' | 'Etc/GMT-12' | 'Etc/GMT-13' | 'Etc/GMT-14' | 'Etc/GMT-2' | 'Etc/GMT-3' | 'Etc/GMT-4' | 'Etc/GMT-5' | 'Etc/GMT-6' | 'Etc/GMT-7' | 'Etc/GMT-8' | 'Etc/GMT-9' | 'Etc/GMT0' | 'Etc/Greenwich' | 'Etc/UCT' | 'Etc/UTC' | 'Etc/Universal' | 'Etc/Zulu' | false
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
  /** Main Attachment */
  message_main_attachment_id: [number, string] /* ir.attachment */ | false
  /** Version */
  version_id: [number, string] /* hr.version */
  /** Current Version */
  current_version_id: [number, string] /* hr.version */ | false
  /** Current Date Version */
  current_date_version: string | false
  /** Employee Versions */
  version_ids: number[] /* hr.version */
  /** Versions Count */
  versions_count: number | false
  /** Employee Name */
  name: string | false
  /** User — Related user name for the resource to manage its access. */
  user_id: [number, string] /* res.users */ | false
  /** User\'s partner — Partner-related data of the user */
  user_partner_id: [number, string] /* res.partner */ | false
  /** Share User — External user with limited access, created only for the purpose of sharing data. */
  share: boolean
  /** Phone */
  phone: string | false
  /** IM Status */
  im_status: string | false
  /** Email */
  email: string | false
  /** Hr Presence State */
  hr_presence_state: 'present' | 'absent' | 'archive' | 'out_of_working_hour' | false
  /** Last Activity */
  last_activity: string | false
  /** Last Activity Time */
  last_activity_time: string | false
  /** Hr Icon Display */
  hr_icon_display: 'presence_present' | 'presence_out_of_working_hour' | 'presence_absent' | 'presence_archive' | 'presence_undetermined' | 'presence_home' | 'presence_office' | 'presence_other' | false
  /** Show Hr Icon Display */
  show_hr_icon_display: boolean
  /** Newly Hired */
  newly_hired: boolean
  /** Active — If the active field is set to False, it will allow you to hide the resource record without removing it. */
  active: boolean
  /** Company Country */
  company_country_id: [number, string] /* res.country */ | false
  /** Company Country Code — The ISO country code in two chars. 
You can use this field for quick search. */
  company_country_code: string | false
  /** Work Phone */
  work_phone: string | false
  /** Work Mobile */
  mobile_phone: string | false
  /** Work Email */
  work_email: string | false
  /** Work Contact */
  work_contact_id: [number, string] /* res.partner */ | false
  /** Legal Name */
  legal_name: string | false
  /** User\'s active */
  is_user_active: boolean
  /** Private Phone */
  private_phone: string | false
  /** Private Email */
  private_email: string | false
  /** Lang */
  lang: 'zh_CN' | false
  /** Place of Birth */
  place_of_birth: string | false
  /** Country of Birth */
  country_of_birth: [number, string] /* res.country */ | false
  /** Birthday */
  birthday: string | false
  /** Show to all employees */
  birthday_public_display: boolean
  /** Public Date of Birth */
  birthday_public_display_string: string | false
  /** Bank Accounts — Employee bank accounts to pay salaries */
  bank_account_ids: number[] /* res.partner.bank */ | false
  /** Is Trusted Bank Account */
  is_trusted_bank_account: boolean
  /** Primary Bank Account */
  primary_bank_account_id: [number, string] /* res.partner.bank */ | false
  /** Has Multiple Bank Accounts */
  has_multiple_bank_accounts: boolean
  /** Salary Distribution */
  salary_distribution: unknown | false
  /** Work Permit No */
  permit_no: string | false
  /** Visa No */
  visa_no: string | false
  /** Visa Expiration Date */
  visa_expire: string | false
  /** Work Permit Expiration Date */
  work_permit_expiration_date: string | false
  /** Work Permit */
  has_work_permit: string | false
  /** Work Permit Scheduled Activity */
  work_permit_scheduled_activity: boolean
  /** work_permit_name */
  work_permit_name: string | false
  /** Certificate Level */
  certificate: 'graduate' | 'bachelor' | 'master' | 'doctor' | 'other' | false
  /** Field of Study */
  study_field: string | false
  /** School */
  study_school: string | false
  /** Emergency Contact */
  emergency_contact: string | false
  /** Emergency Phone */
  emergency_phone: string | false
  /** Work Location Name */
  work_location_name: string | false
  /** Work Location Type */
  work_location_type: 'home' | 'office' | 'other' | false
  /** Contract Start Date */
  contract_date_start: string | false
  /** Contract End Date — End date of the contract (if it\'s a fixed-term contract). */
  contract_date_end: string | false
  /** End of Trial Period — End date of the trial period (if there is one). */
  trial_date_end: string | false
  /** Contract Wage */
  contract_wage: number | false
  /** Date Start */
  date_start: string | false
  /** Date End */
  date_end: string | false
  /** Is Current */
  is_current: boolean
  /** Is Past */
  is_past: boolean
  /** Is Future */
  is_future: boolean
  /** Is In Contract */
  is_in_contract: boolean
  /** Salary Structure Type */
  structure_type_id: [number, string] /* hr.payroll.structure.type */ | false
  /** Contract Type */
  contract_type_id: [number, string] /* hr.contract.type */ | false
  /** Manager */
  parent_id: [number, string] /* hr.employee */ | false
  /** Direct subordinates */
  child_ids: number[] /* hr.employee */
  /** Coach — Select the "Employee" who is the coach of this employee.
The "Coach" has no specific rights or responsibilities by default. */
  coach_id: [number, string] /* hr.employee */ | false
  /** Tags */
  category_ids: number[] /* hr.employee.category */ | false
  /** Color Index */
  color: number | false
  /** Badge ID — ID used for employee identification. */
  barcode: string | false
  /** PIN — PIN used to Check In/Out in the Kiosk Mode of the Attendance application (if enabled in Configuration) and to change the cashier in the Point of Sale application. */
  pin: string | false
  /** ID Card Copy */
  id_card: string | false
  /** Driving License */
  driving_license: string | false
  /** Private Car Plate — If you have more than one car, just separate the plates by a space. */
  private_car_plate: string | false
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Related Partners Count */
  related_partners_count: number | false
  /** Properties */
  employee_properties: unknown | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Attendance Approver — The user set in Attendance will access the attendance of the employee through the dedicated app and will be able to edit them. */
  attendance_manager_id: [number, string] /* res.users */ | false
  /** Attendance */
  attendance_ids: number[] /* hr.attendance */
  /** Last Attendance */
  last_attendance_id: [number, string] /* hr.attendance */ | false
  /** Check In */
  last_check_in: string | false
  /** Check Out */
  last_check_out: string | false
  /** Attendance Status */
  attendance_state: 'checked_out' | 'checked_in' | false
  /** Hours Last Month */
  hours_last_month: number | false
  /** Hours Last Month Overtime */
  hours_last_month_overtime: number | false
  /** Hours Today */
  hours_today: number | false
  /** Hours Previously Today */
  hours_previously_today: number | false
  /** Last Attendance Worked Hours */
  last_attendance_worked_hours: number | false
  /** Hours Last Month Display */
  hours_last_month_display: string | false
  /** Overtime */
  overtime_ids: number[] /* hr.attendance.overtime.line */
  /** Total Overtime */
  total_overtime: number | false
  /** Display Extra Hours */
  display_extra_hours: boolean
  /** Ruleset */
  ruleset_id: [number, string] /* hr.attendance.overtime.ruleset */ | false
  /** Employee HR Goals */
  goal_ids: number[] /* gamification.goal */
  /** Employee Badges — All employee badges, linked to the employee either directly or through the user */
  badge_ids: number[] /* gamification.badge.user */
  /** Has Badges */
  has_badges: boolean
  /** Direct Badge — Badges directly linked to the employee */
  direct_badge_ids: number[] /* gamification.badge.user */
  /** Monday */
  monday_location_id: [number, string] /* hr.work.location */ | false
  /** Tuesday */
  tuesday_location_id: [number, string] /* hr.work.location */ | false
  /** Wednesday */
  wednesday_location_id: [number, string] /* hr.work.location */ | false
  /** Thursday */
  thursday_location_id: [number, string] /* hr.work.location */ | false
  /** Friday */
  friday_location_id: [number, string] /* hr.work.location */ | false
  /** Saturday */
  saturday_location_id: [number, string] /* hr.work.location */ | false
  /** Sunday */
  sunday_location_id: [number, string] /* hr.work.location */ | false
  /** Current — This is the exceptional, non-weekly, location set for today. */
  exceptional_location_id: [number, string] /* hr.work.location */ | false
  /** Today Location Name */
  today_location_name: string | false
  /** Indirect Subordinates Count */
  child_all_count: number | false
  /** Department Color */
  department_color: number | false
  /** Direct Subordinates Count */
  child_count: number | false
  /** Subordinates — Direct and indirect subordinates */
  subordinate_ids: number[] /* hr.employee */
  /** Is Subordinate */
  is_subordinate: boolean
  /** Applicants */
  applicant_ids: number[] /* hr.applicant */
  /** Resume lines */
  resume_line_ids: number[] /* hr.resume.line */
  /** Skills */
  employee_skill_ids: number[] /* hr.employee.skill */
  /** Current Employee Skill */
  current_employee_skill_ids: number[] /* hr.employee.skill */
  /** Skill */
  skill_ids: number[] /* hr.skill */ | false
  /** Certification */
  certification_ids: number[] /* hr.employee.skill */
  /** Display Certification Page */
  display_certification_page: boolean
  /** Expense Approver — Select the user responsible for approving "Expenses" of this employee.
If empty, the approval is done by an Administrator or Approver (determined in settings/users). */
  expense_manager_id: [number, string] /* res.users */ | false
  /** Filter For Expense */
  filter_for_expense: boolean
  /** Employee */
  employee_id: [number, string] /* hr.employee */ | false
  /** Date Version */
  date_version: string
  /** Last Modified by */
  last_modified_uid: [number, string] /* res.users */
  /** Last Modified on */
  last_modified_date: string
  /** Nationality (Country) */
  country_id: [number, string] /* res.country */ | false
  /** Identification No — Enter the employee\'s National Identification Number issued by the government (e.g., Aadhaar, SIN, NIN). This is used for official records and statutory compliance. */
  identification_id: string | false
  /** SSN No — Social Security Number */
  ssnid: string | false
  /** Passport No */
  passport_id: string | false
  /** Passport Expiration Date */
  passport_expiration_date: string | false
  /** Gender — This is the legal sex recognized by the state. */
  sex: 'male' | 'female' | 'other' | false
  /** Private Street */
  private_street: string | false
  /** Private Street2 */
  private_street2: string | false
  /** Private City */
  private_city: string | false
  /** Allowed Country State */
  allowed_country_state_ids: number[] /* res.country.state */ | false
  /** Private State */
  private_state_id: [number, string] /* res.country.state */ | false
  /** Private Zip */
  private_zip: string | false
  /** Private Country */
  private_country_id: [number, string] /* res.country */ | false
  /** Home-Work Distance */
  distance_home_work: number | false
  /** Home-Work Distance in Km */
  km_home_work: number | false
  /** Home-Work Distance unit */
  distance_home_work_unit: 'kilometers' | 'miles'
  /** Marital Status */
  marital: 'single' | 'married' | 'cohabitant' | 'widower' | 'divorced'
  /** Spouse Legal Name */
  spouse_complete_name: string | false
  /** Spouse Birthdate */
  spouse_birthdate: string | false
  /** Dependent Children */
  children: number | false
  /** Employee Type */
  employee_type: 'employee' | 'worker' | 'student' | 'trainee' | 'contractor' | 'freelance'
  /** Department */
  department_id: [number, string] /* hr.department */ | false
  /** Member of department — Whether the employee is a member of the active user\'s department or one of it\'s child department. */
  member_of_department: boolean
  /** Job */
  job_id: [number, string] /* hr.job */ | false
  /** Job Title */
  job_title: string | false
  /** Is Custom Job Title */
  is_custom_job_title: boolean
  /** Work Address */
  address_id: [number, string] /* res.partner */ | false
  /** Work Location */
  work_location_id: [number, string] /* hr.work.location */ | false
  /** Departure Reason */
  departure_reason_id: [number, string] /* hr.departure.reason */ | false
  /** Additional Information */
  departure_description: string | false
  /** Departure Date */
  departure_date: string | false
  /** Is Flexible */
  is_flexible: boolean
  /** Is Fully Flexible */
  is_fully_flexible: boolean
  /** Contract Template — Select a contract template to auto-fill the contract form with predefined values. You can still edit the fields as needed after applying the template. */
  contract_template_id: [number, string] /* hr.version */ | false
  /** Active Employee — If the active field is set to False, it will allow you to hide the resource record without removing it. */
  active_employee: boolean
  /** Wage — Employee\'s monthly gross wage. */
  wage: number | false
  /** Country Code — The ISO country code in two chars. 
You can use this field for quick search. */
  country_code: string | false
  /** Additional Note */
  additional_note: string | false
  /** HR Responsible — Person responsible for validating the employee\'s contracts. */
  hr_responsible_id: [number, string] /* res.users */
}

/** Field names for hr.employee */
export type HrEmployeeFieldName = ModelFieldName<HrEmployeeRecord>

/** Typed search_read result */
export type HrEmployeeSearchResult = ModelRecord<HrEmployeeRecord>
