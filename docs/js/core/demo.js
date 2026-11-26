// Talab demo seed: a sample shop so a first-time visitor sees a real storefront.
// The seller can replace or erase it from the dashboard.

export function demoSettings() {
  return {
    shopName: "لمسة ستور",
    tagline: "قطع مختارة بعناية، توصيل لحد باب البيت",
    whatsapp: "",
    countryCode: "20",
    currencyCode: "EGP",
    currencySymbol: "ج.م",
    lang: "ar",
    primary: "#0e7a5f",
    accent: "#f59e0b",
    logo: "",
    deliveryFee: 50,
    askPhone: true,
    askAddress: true,
    instagram: "",
    facebook: "",
  };
}

export function demoProducts() {
  const now = Date.now();
  return [
    {
      id: "demo_tee",
      name: "تيشيرت قطن سادة",
      desc: "قطن 100% غسيله ثابت، متوفر أبيض وأسود وزيتي. مقاسات من S لـ XXL.",
      price: 250,
      compareAt: 350,
      category: "ملابس",
      image: "assets/products/tee.jpg",
      inStock: true,
      created: now - 6000,
    },
    {
      id: "demo_hoodie",
      name: "هودي أوفرسايز",
      desc: "خامة تقيلة دافية، قصة واسعة مريحة. رمادي وكحلي.",
      price: 650,
      compareAt: null,
      category: "ملابس",
      image: "assets/products/hoodie.jpg",
      inStock: true,
      created: now - 5000,
    },
    {
      id: "demo_cap",
      name: "كاب مطرز",
      desc: "تطريز يدوي، مقاس قابل للتعديل.",
      price: 180,
      compareAt: null,
      category: "إكسسوارات",
      image: "assets/products/cap.jpg",
      inStock: true,
      created: now - 4000,
    },
    {
      id: "demo_tote",
      name: "شنطة قماش توت",
      desc: "قماش كانفاس متين، بتحمل لحد 10 كيلو.",
      price: 220,
      compareAt: null,
      category: "إكسسوارات",
      image: "assets/products/tote.jpg",
      inStock: true,
      created: now - 3000,
    },
    {
      id: "demo_mug",
      name: "كوب سيراميك",
      desc: "سعة 350 مل، آمن في الميكروويف والغسالة.",
      price: 150,
      compareAt: null,
      category: "البيت",
      image: "assets/products/mug.jpg",
      inStock: true,
      created: now - 2000,
    },
    {
      id: "demo_watch",
      name: "ساعة يد كلاسيك",
      desc: "مينا أبيض، جلد طبيعي، ضد الميه رذاذ.",
      price: 900,
      compareAt: 1200,
      category: "إكسسوارات",
      image: "assets/products/watch.jpg",
      inStock: false,
      created: now - 1000,
    },
  ];
}
