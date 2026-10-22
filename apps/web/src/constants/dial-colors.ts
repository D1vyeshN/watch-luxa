// Swatch fills for dial colour names as stored on variants. A colour missing
// here falls back to a text chip, so new colours added in admin never break.
// Metallic dials get a soft gradient so they read as metal, not paint.
export const DIAL_SWATCHES: Record<string, string> = {
  black: '#16181a',
  blue: 'linear-gradient(135deg, #2c4f8f, #142a52)',
  green: 'linear-gradient(135deg, #2f6a52, #163a2c)',
  white: '#f6f4ee',
  cream: '#efe6d2',
  brown: 'linear-gradient(135deg, #7a5236, #43291a)',
  silver: 'linear-gradient(135deg, #eef0f2, #a9adb3)',
  grey: 'linear-gradient(135deg, #9a9ea4, #5d6166)',
  gray: 'linear-gradient(135deg, #9a9ea4, #5d6166)',
  champagne: 'linear-gradient(135deg, #efdcb4, #c8ab73)',
  gold: 'linear-gradient(135deg, #e8cf8f, #b08d3e)',
  salmon: 'linear-gradient(135deg, #f2b8a0, #d98b70)',
  pink: '#e8bcc6',
  red: 'linear-gradient(135deg, #a3282e, #5e1418)',
  purple: 'linear-gradient(135deg, #6a4c93, #3a2856)',
};

export const dialSwatch = (name: string): string | undefined =>
  DIAL_SWATCHES[name.trim().toLowerCase()];
