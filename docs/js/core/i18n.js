// Talab core: Arabic / English UI strings with RTL support.
// Keep both dictionaries at key parity; tests assert it.

export const LANGS = ["ar", "en"];

export const DICT = {
  en: {
    appName: "Talab",
    skipToContent: "Skip to products",

    // storefront
    searchPlaceholder: "Search products…",
    allCategories: "All",
    addToCart: "Add to cart",
    added: "Added ✓",
    soldOut: "Sold out",
    noProductsTitle: "No products yet",
    noProductsBody: "The seller has not added products yet. Check back soon!",
    noResultsTitle: "No matches",
    noResultsBody: "Try a different word or category.",
    demoBadge: "Demo data",
    viewShop: "View shop",
    sellerArea: "Seller dashboard",
    followUs: "Follow us",

    // product
    backToShop: "Back to shop",
    quantity: "Quantity",
    was: "was",
    productNotFound: "This product is not available anymore.",
    description: "Description",

    // cart & checkout
    yourCart: "Your cart",
    cartEmptyTitle: "Your cart is empty",
    cartEmptyBody: "Add something you like and it will show up here.",
    continueShopping: "Continue shopping",
    each: "each",
    remove: "Remove",
    subtotal: "Subtotal",
    delivery: "Delivery",
    free: "Free",
    total: "Total",
    checkoutTitle: "Your details",
    yourName: "Your name",
    yourPhone: "Your phone",
    yourAddress: "Delivery address",
    orderNotes: "Notes (optional)",
    nameRequired: "Please write your name",
    phoneRequired: "Please write your phone number",
    addressRequired: "Please write your address",
    sendWhatsApp: "Send order on WhatsApp",
    copyOrder: "Copy order text",
    copied: "Copied ✓",
    whatsappNotSet: "The seller has not connected WhatsApp yet. Copy the order and send it to them directly.",
    orderReadyTitle: "Order ready!",
    orderReadyBody: "WhatsApp opened with your order. Press send there, and the seller will confirm with you. Your order number:",
    orderNoteHonest: "Nothing is paid here and no order is final until the seller confirms on WhatsApp.",
    newOrderBtn: "Start a new order",

    // seller
    sellerTitle: "Seller dashboard",
    tabProducts: "Products",
    tabOrders: "Orders",
    tabSettings: "Settings",
    tabShare: "Share",
    addProduct: "Add product",
    editProduct: "Edit product",
    productName: "Product name",
    productPrice: "Price",
    comparePrice: "Old price (optional)",
    productDesc: "Description (optional)",
    productCategory: "Category (optional)",
    productImage: "Photo",
    uploadImage: "Upload photo",
    changeImage: "Change photo",
    removeImage: "Remove",
    imageHint: "Resized on your device, stays in this browser.",
    inStock: "In stock",
    saveProduct: "Save product",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    confirmDeleteProduct: "Delete this product for good?",
    namePriceRequired: "Name and a valid price are required.",
    productsEmpty: "No products yet. Add your first one!",

    // orders tab
    ordersEmpty: "No orders placed on this device yet.",
    ordersDisclaimer: "Orders reach you on WhatsApp. This list only shows orders placed in this browser, so you can test the flow yourself.",
    markDone: "Mark done",
    done: "Done",
    orderFrom: "From",
    confirmDeleteOrder: "Delete this order from the list?",

    // settings tab
    settingsSaved: "Settings saved ✓",
    shopIdentity: "Shop identity",
    shopName: "Shop name",
    shopTagline: "Tagline",
    shopLogo: "Logo (optional)",
    uploadLogo: "Upload logo",
    contactSection: "Orders & contact",
    whatsappNumber: "WhatsApp number for orders",
    whatsappHelp: "Local numbers like 01012345678 are fine — we convert them automatically.",
    countryCode: "Country code",
    instagram: "Instagram link (optional)",
    facebook: "Facebook link (optional)",
    moneySection: "Money",
    currencyCode: "Currency code",
    currencySymbol: "Currency symbol",
    deliveryFee: "Delivery fee (0 = free)",
    lookSection: "Look",
    primaryColor: "Main color",
    accentColor: "Accent color",
    defaultLanguage: "Default language",
    arabic: "العربية",
    english: "English",
    checkoutSection: "Checkout form",
    askPhone: "Ask for phone number",
    askAddress: "Ask for address",
    saveSettings: "Save settings",

    // share tab
    shareTitle: "Share your shop",
    shareBody: "This is your shop link. Put it in your Instagram bio, Facebook page, or send it to customers.",
    copyLink: "Copy link",
    shareWhatsApp: "Share on WhatsApp",
    shareText: "Check out my shop and order in a minute:",
    backupSection: "Backup & white-label",
    exportShop: "Download shop file",
    exportHelp: "One JSON file with your branding, settings and products. Use it as a backup, or hand it to another shop as a ready-made setup.",
    importShop: "Import shop file",
    importOk: "Shop imported ✓",
    importBad: "That file is not a valid Talab shop file.",
    dangerZone: "Danger zone",
    resetDemo: "Reload demo data",
    eraseAll: "Erase everything",
    confirmErase: "This deletes products, orders and settings in this browser. Sure?",

    // setup banner (seller has no WhatsApp yet)
    setupBanner: "You're in demo mode. Open the seller dashboard to add your WhatsApp number and products.",

    // misc
    footerMadeWith: "Made with Talab — a free storefront for social sellers",
    langToggle: "English",
    close: "Close",
    ok: "OK",
    loadMore: "Show more",
  },

  ar: {
    appName: "طلب",
    skipToContent: "تخطَّ إلى المنتجات",

    // storefront
    searchPlaceholder: "دوّر على منتج…",
    allCategories: "الكل",
    addToCart: "ضيف للسلة",
    added: "اتضاف ✓",
    soldOut: "خلص",
    noProductsTitle: "مفيش منتجات لسه",
    noProductsBody: "البائع لسه مضافش منتجات. ارجع تاني قريب!",
    noResultsTitle: "مفيش نتايج",
    noResultsBody: "جرّب كلمة أو قسم مختلف.",
    demoBadge: "بيانات تجريبية",
    viewShop: "شوف المتجر",
    sellerArea: "لوحة البائع",
    followUs: "تابعنا",

    // product
    backToShop: "ارجع للمتجر",
    quantity: "الكمية",
    was: "بدل",
    productNotFound: "المنتج ده مش متاح دلوقتي.",
    description: "الوصف",

    // cart & checkout
    yourCart: "سلتك",
    cartEmptyTitle: "سلتك فاضية",
    cartEmptyBody: "ضيف حاجة تعجبك وهتظهر هنا.",
    continueShopping: "كمّل تسوّق",
    each: "للقطعة",
    remove: "امسح",
    subtotal: "المجموع الفرعي",
    delivery: "التوصيل",
    free: "مجاني",
    total: "الإجمالي",
    checkoutTitle: "بياناتك",
    yourName: "اسمك",
    yourPhone: "رقم موبايلك",
    yourAddress: "عنوان التوصيل",
    orderNotes: "ملاحظات (اختياري)",
    nameRequired: "اكتب اسمك من فضلك",
    phoneRequired: "اكتب رقم موبايلك من فضلك",
    addressRequired: "اكتب عنوانك من فضلك",
    sendWhatsApp: "ابعت الطلب على واتساب",
    copyOrder: "انسخ نص الطلب",
    copied: "اتنسخ ✓",
    whatsappNotSet: "البائع لسه مربطش واتساب. انسخ الطلب وابعتهوله بنفسك.",
    orderReadyTitle: "الطلب جاهز!",
    orderReadyBody: "واتساب اتفتح بطلبك. دوس إرسال هناك، والبائع هيرد عليك للتأكيد. رقم طلبك:",
    orderNoteHonest: "مفيش دفع هنا، والطلب مش نهائي غير لما البائع يأكد معاك على واتساب.",
    newOrderBtn: "ابدأ طلب جديد",

    // seller
    sellerTitle: "لوحة البائع",
    tabProducts: "المنتجات",
    tabOrders: "الطلبات",
    tabSettings: "الإعدادات",
    tabShare: "النشر",
    addProduct: "ضيف منتج",
    editProduct: "عدّل المنتج",
    productName: "اسم المنتج",
    productPrice: "السعر",
    comparePrice: "السعر قبل الخصم (اختياري)",
    productDesc: "الوصف (اختياري)",
    productCategory: "القسم (اختياري)",
    productImage: "الصورة",
    uploadImage: "ارفع صورة",
    changeImage: "غيّر الصورة",
    removeImage: "امسح",
    imageHint: "الصورة بتتصغّر على جهازك وبتفضل في المتصفح ده.",
    inStock: "متاح",
    saveProduct: "احفظ المنتج",
    cancel: "إلغاء",
    edit: "تعديل",
    delete: "مسح",
    confirmDeleteProduct: "تمسح المنتج ده نهائي؟",
    namePriceRequired: "الاسم وسعر صحيح مطلوبين.",
    productsEmpty: "مفيش منتجات لسه. ضيف أول واحد!",

    // orders tab
    ordersEmpty: "مفيش طلبات اتعملت من الجهاز ده لسه.",
    ordersDisclaimer: "الطلبات بتوصلك على واتساب. القايمة دي بتوري بس الطلبات اللي اتعملت من المتصفح ده، عشان تجرب بنفسك.",
    markDone: "خلصانه",
    done: "خلصان",
    orderFrom: "من",
    confirmDeleteOrder: "تمسح الطلب ده من القايمة؟",

    // settings tab
    settingsSaved: "الإعدادات اتحفظت ✓",
    shopIdentity: "هوية المحل",
    shopName: "اسم المحل",
    shopTagline: "جملة تعريفية",
    shopLogo: "اللوجو (اختياري)",
    uploadLogo: "ارفع لوجو",
    contactSection: "الطلبات والتواصل",
    whatsappNumber: "رقم واتساب لاستقبال الطلبات",
    whatsappHelp: "رقم محلي زي 01012345678 عادي — بنحوّله تلقائي.",
    countryCode: "كود الدولة",
    instagram: "لينك انستجرام (اختياري)",
    facebook: "لينك فيسبوك (اختياري)",
    moneySection: "الفلوس",
    currencyCode: "كود العملة",
    currencySymbol: "علامة العملة",
    deliveryFee: "مصاريف التوصيل (0 = مجاني)",
    lookSection: "الشكل",
    primaryColor: "اللون الأساسي",
    accentColor: "اللون المميز",
    defaultLanguage: "اللغة الافتراضية",
    arabic: "العربية",
    english: "English",
    checkoutSection: "فورم الطلب",
    askPhone: "اسأل عن رقم الموبايل",
    askAddress: "اسأل عن العنوان",
    saveSettings: "احفظ الإعدادات",

    // share tab
    shareTitle: "انشر متجرك",
    shareBody: "ده لينك متجرك. حطّه في البايو بتاع انستجرام أو صفحة فيسبوك، أو ابعته لعملائك.",
    copyLink: "انسخ اللينك",
    shareWhatsApp: "انشر على واتساب",
    shareText: "اتفرّج على متجري واطلب في دقيقة:",
    backupSection: "النسخ الاحتياطي والتخصيص",
    exportShop: "نزّل ملف المتجر",
    exportHelp: "ملف JSON واحد فيه الهوية والإعدادات والمنتجات. استخدمه نسخة احتياطية، أو اده لمحل تاني كتجهيز جاهز.",
    importShop: "استورد ملف متجر",
    importOk: "المتجر اتستورد ✓",
    importBad: "الملف ده مش ملف متجر طلب صالح.",
    dangerZone: "منطقة الخطر",
    resetDemo: "رجّع البيانات التجريبية",
    eraseAll: "امسح كل حاجة",
    confirmErase: "ده هيمسح المنتجات والطلبات والإعدادات من المتصفح ده. متأكد؟",

    // setup banner
    setupBanner: "انت في الوضع التجريبي. افتح لوحة البائع وضيف رقم الواتساب ومنتجاتك.",

    // misc
    footerMadeWith: "معمول بطلب — متجر مجاني للبيع على السوشيال",
    langToggle: "العربية",
    close: "اقفل",
    ok: "تمام",
    loadMore: "ورّي كمان",
  },
};

export function dirFor(lang) {
  return lang === "ar" ? "rtl" : "ltr";
}

export function t(lang, key, vars) {
  const dict = DICT[lang] || DICT.en;
  let s = dict[key] ?? DICT.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

// Used by tests to enforce parity between dictionaries.
export function missingKeys() {
  const en = Object.keys(DICT.en);
  const ar = Object.keys(DICT.ar);
  return {
    missingInAr: en.filter((k) => !(k in DICT.ar)),
    missingInEn: ar.filter((k) => !(k in DICT.en)),
  };
}
