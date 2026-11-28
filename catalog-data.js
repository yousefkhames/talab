/* Published catalog. DEMO sample content with fictional products and prices. Build yours in the owner builder (#/edit), use Export, replace this file and commit. */
window.CATALOG_DATA = {
  "v": 1,
  "demo": true,
  "shop": {
    "ar": "بائع تجريبي",
    "en": "Demo Seller"
  },
  "about": {
    "ar": "هذا متجر تجريبي بمنتجات وهمية. استبدله ببياناتك.",
    "en": "This is a demo shop with fictional products. Replace it with your own."
  },
  "currency": "ج.م",
  "whatsapp": "",
  "social": {
    "instagram": "",
    "facebook": "",
    "tiktok": "",
    "messenger": ""
  },
  "categories": [
    {
      "id": "c1",
      "name": {
        "ar": "هدايا",
        "en": "Gifts"
      }
    },
    {
      "id": "c2",
      "name": {
        "ar": "للمنزل",
        "en": "Home"
      }
    }
  ],
  "products": [
    {
      "id": "p1",
      "cat": "c1",
      "name": {
        "ar": "حقيبة قماش",
        "en": "Tote bag"
      },
      "desc": {
        "ar": "منتج تجريبي، السعر وهمي",
        "en": "Demo product, fictional price"
      },
      "price": 120,
      "demo": true,
      "isNew": true
    },
    {
      "id": "p2",
      "cat": "c1",
      "name": {
        "ar": "دفتر ملاحظات",
        "en": "Notebook"
      },
      "desc": {
        "ar": "منتج تجريبي، السعر وهمي",
        "en": "Demo product, fictional price"
      },
      "price": 60,
      "demo": true
    },
    {
      "id": "p3",
      "cat": "c2",
      "name": {
        "ar": "شمعة معطرة",
        "en": "Scented candle"
      },
      "desc": {
        "ar": "منتج تجريبي، السعر وهمي",
        "en": "Demo product, fictional price"
      },
      "price": 90,
      "demo": true
    },
    {
      "id": "p4",
      "cat": "c2",
      "name": {
        "ar": "كوب سيراميك",
        "en": "Ceramic mug"
      },
      "desc": {
        "ar": "منتج تجريبي، السعر وهمي",
        "en": "Demo product, fictional price"
      },
      "price": 75,
      "demo": true,
      "soldOut": true
    }
  ]
};
