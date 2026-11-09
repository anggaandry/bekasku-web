export const APP_NAME = 'BekasKu'
export const APP_TAGLINE = 'Marketplace Jual Beli Barang Bekas & Preloved #1 Indonesia'

// Sandbox API URLs & Secrets (BekasKu V3 Sandbox & Production Dual Token)
export const DEFAULT_API_BASE = 'https://sandbox.bekasku.id/v3/api'
export const TOKEN_REQ = 'JIDxB0ayDvm4ZmLoI46AiV3TfUwxvlG6r42XBniG'
export const TOKEN_DEF = 'byLgC7gUcXuyhfzcOawaGb1ZmEjWqSpxuAseryCH'
export const TOKEN_AUTH = 'BKK_AUTH_m11VgI6T0qbiwOh2GD2Nf4U32Vb9UEFA'
export const JWT_SECRET_DEF = 'BKK_JWT_k9x2Pq7Lm4Vz8Wj1Ns5Rt3Yh6Fb0'
export const JWT_SECRET_DEF_V2 = 'tUuXZPgXpeDHXua8GuD2BnF535uOWrs9rMovYIyF'

// API Endpoints
export const API_REQUEST_TOKEN = '/auth/t0k3n'
export const API_AUTH_OTP_METHODS = '/auth/otp/methods'
export const API_AUTH_CHECK_ACCOUNT = '/auth/account/check'
export const API_AUTH_RESEND_OTP = '/auth/account/otp/resend'
export const API_AUTH_LOGIN_OTP = '/auth/account/otp/login'
export const API_AUTH_PASSWORD_CREATE = '/auth/account/password/create'
export const API_AUTH_LOGIN_PASSWORD = '/auth/account/password/login'
export const API_AUTH_LOGIN_SOCIAL = '/auth/account/social/login'
export const API_FORGOT_PASSWORD_OTP = '/password/forgot/otp'
export const API_FORGOT_PASSWORD_OTP_CHECK = '/password/forgot/otp/check'
export const API_FORGOT_PASSWORD_NEW = '/password/forgot/new'
export const API_CHANGE_PASSWORD = '/password/change'
export const API_FREEOTP_SEND = '/freeotp/send'
export const API_FREEOTP_VERIFY = '/freeotp/verify'
export const API_ACCOUNT_AVAILABILITY = '/account/availability'
export const API_REGISTER = '/register'
export const API_PHONE_VERIFY = '/phone-verify'
export const API_AVATAR = '/avatar-file'
export const API_ADS_LIST = '/ads/list'
export const API_ADS_LOG = '/ads/log'
export const API_DASHBOARD_CATEGORY_ALL = '/dashboard/category-all'
export const API_DASHBOARD_SUBCATEGORY = '/dashboard/subcategory'
export const CATEGORY_LANG_DEFAULT = 'id'
export const API_DASHBOARD_BESTDEAL = '/dashboard/bestdeal'
export const API_PRELOVED_LIST = '/dashboard/preloved'
export const API_DASHBOARD_NEWEST = '/dashboard/newest'
export const API_DASHBOARD_NEEDED = '/dashboard/needed'
export const API_PRODUCT_SEARCH = '/product/search'
export const API_PRODUCT_SEARCH_EMPTY = '/product/search/empty'
export const API_PRODUCT_SEARCH_VISUAL = '/product/search/visual'
export const API_PRODUCT_FILTER_CATEGORY = '/product/filter/category'
export const API_SEARCH_KEY = '/search/key'
export const API_MYSEARCH_DELETE = '/mysearch/delete'
export const API_LIVE_LIST = '/live/list'
export const API_VIDEO_LIST = '/video/list'
export const API_SELLER_SEARCH = '/seller/search/v3'
export const API_SELLER_INFO = '/seller/info'
export const API_SELLER_PRODUCT = '/seller/product'
export const API_SELLER_REVIEW_LIST = '/seller/review/list'
export const API_OFFER_NEEDED_MYPRODUCT = '/myproduct/needed/offer'
export const API_USER_FOLLOW = '/user/follow'
export const API_USER_BLOCK = '/user/block'
export const API_PRODUCT_DETAIL = '/product/detail'
export const API_PRODUCT_DISCUSSION = '/product/discussion'
export const API_DISCUSSION_SEND = '/discussion/send'
export const API_DISCUSSION_REPLY_LIST = '/discussion/reply/list'
export const API_DISCUSSION_REPLY_SEND = '/discussion/reply/send'
export const API_WISHLIST_UPDATE = '/product/wishlist/update'
export const API_FAVORITE_LIST = '/favorite/list'
export const WISHLIST_TYPE_ALL = 0
export const WISHLIST_TYPE_BEST_DEAL = 2
export const WISHLIST_TYPE_NEEDED = 4
export const API_CART_LIST = '/cart/list'
export const API_CART_ADD = '/cart/add'
export const API_CART_DEFAULT_ADDRESS = '/cart/default-address'
export const TRANSACTION_METHOD_MEET = 0
export const TRANSACTION_METHOD_COURRIER = 1
export const FREE_DELIVERY_FLAT = 20000
export const API_NEGOTIATE_PRODUCT = '/product/nego'
export const API_NEGOTIATE_PRODUCT_UPDATE = '/product/nego/update'
export const API_POST_SELL_DELETE = '/post/sell/delete'
export const API_POST_SELL_CANCEL = '/post/sell/cancel'
export const API_POST_SELLED = '/post/sell/selled'
export const API_POST_SELL_STATUS = '/post/sell/status'
export const API_PRODUCT_MYPOST = '/product/mypost'
export const API_CATEGORY_LIST = '/category/list'
export const API_SUBCATEGORY_LIST = '/subcategory/list'
export const API_SUBCATEGORY_TYPE_LIST = '/subcategory/type/list'
export const API_POST_SELL_INIT = '/post/sell/init'
export const API_POST_SELL_SUBMIT = '/post/sell/submit'
export const API_POST_BESTDEAL_CREATE = '/post/bestdeal/create'
export const BESTDEAL_MIN_DISCOUNT = 30
export const BESTDEAL_MAX_DISCOUNT = 99
export const API_ASK_PRICE_AI = '/post/ai/ask-price'
export const API_ASK_POST_AI = '/post/ai/create'

export const POST_TYPE_AI = 3
export const POST_TYPE_SELL = 0
export const POST_TYPE_NEEDED = 1
export const POST_TYPE_SERVICE = 2

export const CATALOG_STATUS_ALL = 0
export const CATALOG_STATUS_ACTIVE = 1
export const CATALOG_STATUS_CANCELED = 2
export const CATALOG_STATUS_SOLD = 3

export const CATALOG_TYPE_ALL = 0
export const CATALOG_TYPE_SELL = 1
export const CATALOG_TYPE_NEEDED = 2
export const API_ANALYZE_POST = '/post/ai/analyze-post'
export const API_COURRIER_LIST = '/courrier/list'
export const API_SHIPPING_ONE = '/shipping/one'
export const API_DASHBOARD_INFO = '/dashboard/info'
export const API_MYADDRESS_LIST = '/myaddress/list'
export const API_MYADDRESS_INIT = '/myaddress/init'
export const API_MYADDRESS_SUBMIT = '/myaddress/submit'
export const API_MYADDRESS_DELETE = '/myaddress/delete'
export const API_DEFAULT_ADDRESS = '/cart/default-address'
export const API_LOCATION = '/location'
export const API_LOCATION_LIST = '/location/list'
export const API_LOCATION_PROVINCE_LIST = '/location/province-list'
export const API_LOCATION_CITY_BY_PROVINCE = '/location/city-by-province'

// Search Pagination & Timing Constants
export const SEARCH_PAGE_SIZE = 20
export const SEARCH_MAX_ITEMS = 1000
export const SEARCH_DEBOUNCE_MS = 500
export const DEFAULT_LOCATION_CHIPS = [
  'DKI Jakarta',
  'Medan',
  'Bandung',
  'Surabaya',
  'Jabodetabek',
  'Sumatera Utara',
  'Bali',
  'Bogor',
  'Tangerang',
  'Jakarta Selatan',
  'Bekasi',
]

// Search Types (sesuai mobile V3 app_constants.dart)
export const SEARCH_TYPE_RECOMMEND = 0
export const SEARCH_TYPE_REGULAR = 1
export const SEARCH_TYPE_BEST_DEAL = 2
export const SEARCH_TYPE_DONATION = 3
export const SEARCH_TYPE_NEEDED = 4
export const SEARCH_TYPE_SERVICE = 6
export const SEARCH_TYPE_BEKASKU_PLUS = 10

// Sell Methods (sesuai mobile V3 app_constants.dart)
export const SELL_METHOD_AUCTION = 0
export const SELL_METHOD_DIRECT = 1
export const SELL_METHOD_NEEDED = 2
export const SELL_METHOD_DONATION = 3
export const SELL_METHOD_SERVICE = 4

// Checkout & Payment Endpoints
export const API_CART_ORDER_INIT = '/cart/order/init'
export const API_CART_PAYMENT_INIT = '/cart/payment/init'
export const API_PAYMENT_CHOOSE = '/payment/choose'
export const API_PASSWORD_MATCH = '/user/password/match'
export const API_PAYMENT_CHECKOUT = '/payment/checkout'
export const API_SUBSCRIBE_LIST = '/subscribe/list'
export const API_SUBSCRIBE_CHECKOUT = '/subscribe/payment/checkout'
export const STORAGE_KEY_SUBSCRIBE_DRAFT = 'bks_subscribe_draft'

// Promotion Endpoints & Storage Keys
export const API_PROMOTION_QUOTA = '/promotion/quota'
export const API_PROMOTION_LIST = '/promotion/list'
export const API_PROMOTION_STATUS = '/promotion/status'
export const API_PROMOTION_ACTIVE_LIST = '/promotion/active-list'
export const API_PROMOTION_APPLY = '/promotion/apply'
export const API_PROMOTION_CHECKOUT = '/promotion/payment/checkout'
export const STORAGE_KEY_PROMOTION_DRAFT = 'bks_promotion_draft'

// Payment Auth Token
export const TOKEN_PAYMENT = 'BKK_PAY_gx9x9W7gqa2vnDT2AdjiBzOkOixwpBhS'
export const PAYMENT_PLATFORM_WEB = 'web'
export const BALANCE_LIMIT_DEFAULT = 200000

// Balance Endpoints & Constants
export const API_BALANCE_HISTORY = '/balance/history'
export const API_BALANCE_WITHDRAW = '/balance/withdraw'
export const WITHDRAW_MIN_AMOUNT = 10000
export const BALANCE_PRESET_AMOUNTS = [50000, 100000, 200000, 500000]

// Storage Keys
export const STORAGE_KEY_TOKEN = 'bks_token'
export const STORAGE_KEY_USER_ID = 'bks_user_id'
export const STORAGE_KEY_USER_PROFILE = 'bks_user_profile'
export const STORAGE_KEY_CART = 'bks_cart'
export const STORAGE_KEY_CITY = 'bks_city'
export const STORAGE_KEY_LOCATION = 'bks_location'
export const STORAGE_KEY_RECENT_SEARCH = 'bks_recent_search'
export const STORAGE_KEY_LAST_VIEWED = 'bks_last_viewed'

// Auth Validation & Timing Constants (sesuai mobile V3)
export const OTP_LENGTH = 4
export const OTP_RESEND_SECONDS = 30
export const PHONE_MIN_LENGTH = 10
export const PHONE_MAX_LENGTH = 14
export const NAME_MIN_LENGTH = 3
export const PASSWORD_MIN_LENGTH = 8
export const DEFAULT_LAT = 3.5896654
export const DEFAULT_LON = 98.6738261

// External Links
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=bkk.app.bekasku.bekasku'
export const APP_STORE_URL = 'https://apps.apple.com/id/app/bekasku/id1609048207'
export const SUPPORT_EMAIL = 'info@bekasku.id'
export const DEFAULT_LOCATION = 'Medan, Sumatera Utara'

// Transaction Endpoints
export const API_TRANSACTION_LIST = '/transaction/list'
export const API_TRANSACTION_COUNT = '/transaction/count'
export const API_TRANSACTION_DETAIL = '/transaction/detail'
export const API_TRANSACTION_CANCEL = '/transaction/cancel'
export const API_TRANSACTION_CONFIRM = '/transaction/confirm'
export const API_TRANSACTION_FINISH = '/transaction/finish'
export const API_TRANSACTION_LABEL = '/transaction/label'
export const API_REQUEST_PICKUP = '/transaction/request/pickup'
export const API_REQUEST_PICKUP_RESCHEDULE = '/transaction/request/pickup/reschedule'
export const API_REQUEST_DROPOFF = '/transaction/request/dropoff'
export const API_TRACKING_ORDER = '/transaction/tracking/order'
export const API_TRACKING_RETURN = '/transaction/tracking/order/return'
export const API_TRANSACTION_STATUS = '/transaction/status'
export const API_MEET_GENERATE_QR = '/transaction/meet/qr/generate'
export const API_MEET_CONFIRM_QR = '/transaction/meet/qr/confirm'
export const API_MYPAYMENT_LIST = '/mypayment/list'
export const API_PAYMENT_DASHBOARD = '/payment/dashboard'
export const API_MYPAYMENT_DETAIL = '/mypayment/detail'
export const API_MYPAYMENT_CANCEL = '/mypayment/cancel'
export const API_MYPAYMENT_STATUS = '/mypayment/status'
export const API_MYPAYMENT_MAKE = '/mypayment/make'

export const PAYMENT_CANCEL_REASONS = [
  'Ingin merubah metode pembayaran',
  'Ingin merubah alamat pengiriman',
  'Ingin menambah/kurangi barang',
  'Ingin menggunakan promo lain',
  'Alasan lainnya',
]

// Complain & Review Endpoints
export const API_REVIEW_CREATE_INIT = '/review/create/init'
export const API_REVIEW_SEND = '/review/send'
export const API_TRANSACTION_COMPLAIN_CREATE_FILE_RAW = '/transaction/complain/create-file-raw'
export const API_TRANSACTION_COMPLAIN_DETAIL = '/transaction/complain/detail'
export const API_TRANSACTION_COMPLAIN_ACCEPT = '/transaction/complain/accept'
export const API_TRANSACTION_COMPLAIN_DECLINE = '/transaction/complain/decline'
export const API_TRANSACTION_COMPLAIN_FINISH = '/transaction/complain/finish'
export const API_TRANSACTION_COMPLAIN_WAYBILL_INIT = '/transaction/complain/waybill/init'
export const API_TRANSACTION_COMPLAIN_WAYBILL_SUBMIT = '/transaction/complain/waybill/submit'

export const COMPLAIN_REASONS = [
  'Barang tidak sesuai deskripsi',
  'Barang rusak atau cacat',
  'Jumlah produk tidak sesuai',
  'Barang tidak asli (produk KW)',
  'Lainnya',
] as const

// Transaction Tabs
export const TRANSACTION_TAB_ALL = 0
export const TRANSACTION_TAB_UNPAID = 1
export const TRANSACTION_TAB_PACKING = 2
export const TRANSACTION_TAB_SHIPPED = 3
export const TRANSACTION_TAB_DONE = 4
export const TRANSACTION_TAB_RETURN = 5
export const TRANSACTION_TAB_CANCELED = 6
export const TRANSACTION_TAB_PAID = 7


// BekasKu Center Context Message Templates
export const BEKASKU_CENTER_MSG_ORDER_QUESTION = 'Halo BekasKu Center, saya punya pertanyaan seputar pesanan saya.'
export const BEKASKU_CENTER_MSG_ORDER_HELP = 'Halo BekasKu Center, saya butuh bantuan terkait pesanan saya.'

// Profile & Account Settings
export const API_PROFILE_INFO = '/profile/info'
export const API_PROFILE_UPDATE = '/profile/update'
export const API_ACCOUNT_SETTING_INFO = '/auth/account/setting/info'
export const API_ACCOUNT_DELETE = '/auth/account/delete'
export const API_ACCOUNT_CANCEL_DELETE = '/auth/account/cancel/delete'
export const API_NOTIFICATION_SWITCH = '/notification/switch'
export const API_NOTIFICATION_SWITCH_CHANGE = '/notification/switch/change'
export const API_NOTIFICATION_LIST = '/notification/list'
export const API_MYREVIEW_LIST = '/myreview/list'

export const NOTIF_TYPE_ALL = 0
export const NOTIF_TYPE_ORDER = 1
export const NOTIF_TYPE_PROMO = 2
export const NOTIF_TYPE_SYSTEM = 3
export const NOTIF_TYPE_LIVE = 4
export const API_PROFILE_SOCIAL_CODE = '/profile/social/code'
export const API_PROFILE_SOCIAL_VERIFY = '/profile/social/verify'
export const API_PROFILE_SOCIAL_DISCONNECT = '/profile/social/disconnect'
export const API_IDENTITY_INFO = '/identity/info'
export const API_IDENTITY_ML_VISION = '/identity/check/ml_vision'
export const API_IDENTITY_UPLOAD = '/identity/upload'
export const API_SELFIE_VERIFY = '/identity/selfie/verify'
export const API_LOGOUT = '/logout'

// Bank Account & Balance
export const API_MYBANK_LIST = '/mybank/list'
export const API_MYBANK_ADD = '/mybank/add'
export const API_MYBANK_CHECK = '/mybank/check'
export const API_MYBANK_DELETE = '/mybank/delete'
export const API_BANK_LIST = '/bank/list'
export const BANK_OTHER_ID = '6ab93b50db281ea0b7a81b26'
export const MAX_BANK_ACCOUNTS = 3

// Chat & Real-Time Messaging Endpoints & Constants
export const API_CHAT_BOX = '/chatbox'
export const API_CHAT_LIST = '/chat/list'
export const API_CHAT_SEND = '/chat/send'
export const API_CHAT_LIVE_VIDEO = '/chat/send/live-video'
export const API_CHAT_ONLINE = '/chat/online'
export const API_NEGOTIATE_PRODUCT_CANCEL = '/product/nego/cancel'
export const API_NEGOTIATE_PRODUCT_ACCEPT = '/product/nego/accept'
export const API_NEGOTIATE_PRODUCT_DECLINE = '/product/nego/decline'

export const TOKEN_WS = 'BKK_WS_EizSQ6eAUZpxIQR2XuKyR4pLKASWQp5Y'

export const CHAT_FILTER_ALL = 0
export const CHAT_FILTER_SELLER = 1
export const CHAT_FILTER_BUYER = 2

export const CHAT_STATUS_LOADING = 100
export const CHAT_STATUS_SENT = 0
export const CHAT_STATUS_READ = 1
export const CHAT_STATUS_FAIL = 99

export const STORAGE_KEY_FAILED_CHAT_PREFIX = '_chat_'

export const CHAT_QUICK_REPLIES = [
  'Hai, apakah barang ready?',
  'Bisa kirim hari ini?',
  'Terima kasih',
] as const

export const CHAT_BLOCK_REASONS = [
  'Penjual Berbuat SARA',
  'Penjual Berkata Kasar',
  'Penjual Mengancam Pengguna',
  'Penjual Berbohong',
] as const

// BekasKu+ (Official Curated Seller Partner) Endpoints
export const API_BEKASKU_PLUS_STATUS = '/bekasku-plus/my-status'
export const API_BEKASKU_PLUS_APPLY = '/bekasku-plus/apply'

// Live & Video Streaming Endpoints
export const API_LIVE_VALIDATE = '/live/validate'
export const API_LIVE_TOKEN = '/live/token'
export const API_LIVE_LEAVE = '/live/host/leave'
export const LIVEKIT_WS_URL = 'wss://bekasku-mixrrc96.livekit.cloud'

export const API_VIDEO_POST = '/video/post'
export const API_VIDEO_CHECK = '/video/check'
export const API_VIDEO_LIKE = '/video/like/toggle'
export const API_VIDEO_DELETE = '/video/delete'
export const API_VIDEO_COMMENT_LIST = '/video/comment/list'
export const API_VIDEO_COMMENT_POST = '/video/comment/send'

// Help Center, FAQ & BekasKu Center Endpoints & Constants
export const API_FAQ = '/faq'
export const API_SOCMED = '/socmed'
export const API_HELP_CHAT = '/help/chat'
export const API_HELP_SEND = '/help/send'

// Legal & Company Profile Endpoints & Metadata Constants
export const API_POLICY = '/policy'
export const LEGAL_TERMS_EFFECTIVE_DATE = '1 Januari 2025'
export const LEGAL_TERMS_UPDATED = 'September 2026'
export const LEGAL_TERMS_VERSION = '2.1.0'
export const LEGAL_PRIVACY_EFFECTIVE_DATE = '1 Januari 2025'
export const LEGAL_PRIVACY_UPDATED = 'Oktober 2026'
export const LEGAL_PRIVACY_VERSION = '3.0.0'
export const COMPANY_LEGAL_NAME = 'PT Jantaka Ladang Unggul'
export const COMPANY_OFFICE_ADDRESS = 'Jl. Prof. H.M. Yamin No.6, Kesawan, Kec. Medan Bar., Kota Medan, Sumatera Utara 20111'
export const COMPANY_OFFICIAL_PHONE = '+6282112382388'
export const COMPANY_MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Jl.+Prof.+H.M.+Yamin+No.6+Kesawan+Medan'
export const APP_VERSION_DISPLAY = '2.2.22'

export const STORAGE_KEY_FAILED_HELP_CHAT = '_help_chat_failed'
export const STORAGE_KEY_FAQ_FEEDBACK = 'bks_faq_feedbacks'
export const STORAGE_KEY_PENDING_HELP_POPUP = 'bks_pending_help_popup'
export const BEKASKU_CENTER_SUPPORT_EMAIL = 'bekasku.care@gmail.com'
export const BEKASKU_CENTER_DEFAULT_WORKING_HOUR = 'Senin - Sabtu, 10:00 - 17:00'

export const HELP_QUICK_REPLIES = [
  'Kendala pesanan',
  'Masalah pembayaran',
  'Penarikan saldo',
  'Verifikasi akun',
] as const

export const HELP_QUICK_EXPRESSIONS = [
  'Halo BekasKu Center, saya butuh bantuan terkait pesanan saya.',
  'Halo Admin, pembayaran saya sudah berhasil tetapi status belum berubah.',
  'Halo Tim BekasKu, mohon bantu cek kendala penarikan saldo saya.',
  'Halo Admin, saya ingin bertanya tentang verifikasi akun / KTP.',
  'Terima kasih atas bantuannya!',
] as const

export const FAQ_SATISFIED_REASONS = [
  'Saya mendapat informasi yang dibutuhkan',
  'Artikel mudah dimengerti',
  'Artikel mudah ditemukan',
  'Artikel relevan',
  'Informasi yang disampaikan jelas',
  'Artikel memberikan solusi yang jelas.',
] as const

export const FAQ_UNSATISFIED_REASONS = [
  'Artikel belum sepenuhnya membantu',
  'Informasi yang disajikan kurang jelas',
  'Artikel sulit ditemukan',
  'Konten artikel kurang relevan',
  'Artikel tidak menjawab pertanyaan saya',
  'Artikel membutuhkan penjelasan tambahan',
] as const



