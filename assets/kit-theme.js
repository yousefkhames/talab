/* MIT · Copyright (c) 2026 Yousef Khames */
(function (root) {
  'use strict';
  const config = {
    name: { ar: '', en: '' }, // Empty: keep the kit's own default
    logo: '', // Optional trusted relative SVG/PNG path, e.g. './shop.svg'
    accent: '#38BDF8',
    mode: 'system', // system | light | dark
    light: { ink: '#0B0B0F', paper: '#F8FAFC' },
    dark: { ink: '#F1F5F9', paper: '#111827' }
  };
  const author = Object.freeze({ ar: 'من تطوير يوسف خميس', en: 'By Yousef Khames' });
  const color = (v, fallback) => /^#[\da-f]{6}$/i.test(v || '') ? v : fallback;
  function luminance(hex) {
    const channels = hex.slice(1).match(/../g).map((x) => {
      const v = parseInt(x, 16) / 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  }
  function contrast(a, b) {
    const x = luminance(a), y = luminance(b);
    return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
  }
  function readableOn(bg) {
    return contrast('#000000', bg) >= contrast('#FFFFFF', bg) ? '#000000' : '#FFFFFF';
  }
  function palette(overrides = {}, prefersDark = false) {
    const mode = ['system', 'light', 'dark'].includes(config.mode) ? config.mode : 'system';
    const dark = mode === 'dark' || (mode === 'system' && prefersDark);
    const base = dark ? config.dark : config.light;
    const paper = color(dark ? base.paper : overrides.paper || base.paper, dark ? '#111827' : '#F8FAFC');
    const preferredInk = color(dark ? base.ink : overrides.ink || base.ink, dark ? '#F1F5F9' : '#0B0B0F');
    const fallback = contrast(preferredInk, paper) < 4.5;
    const accent = color(overrides.accent || config.accent, '#38BDF8');
    return { dark, paper, ink: fallback ? readableOn(paper) : preferredInk, accent, onAccent: readableOn(accent), fallback };
  }
  function logoPath(value = config.logo) {
    return /^(?:\.\/)?(?:[\w-]+\/)*[\w-]+\.(svg|png|webp|jpe?g)$/i.test(value) ? value : '';
  }
  const api = { config, author, color, contrast, readableOn, palette, logoPath };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KitTheme = api;
})(globalThis);
