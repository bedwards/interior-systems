/**
 * Converts hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Converts RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Calculates luminance of a color
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates contrast ratio between two colors
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks if text color has sufficient contrast with background
 */
export function hasGoodContrast(textColor: string, bgColor: string): boolean {
  return getContrastRatio(textColor, bgColor) >= 4.5;
}

/**
 * Generates a complementary color
 */
export function getComplementary(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
}

/**
 * Lightens a color by a percentage
 */
export function lighten(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const amount = Math.round(255 * (percent / 100));
  return rgbToHex(
    Math.min(255, rgb.r + amount),
    Math.min(255, rgb.g + amount),
    Math.min(255, rgb.b + amount)
  );
}

/**
 * Darkens a color by a percentage
 */
export function darken(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const amount = Math.round(255 * (percent / 100));
  return rgbToHex(
    Math.max(0, rgb.r - amount),
    Math.max(0, rgb.g - amount),
    Math.max(0, rgb.b - amount)
  );
}

/**
 * Generates a color palette from a base color
 */
export function generatePalette(baseColor: string): string[] {
  return [
    darken(baseColor, 30),
    darken(baseColor, 15),
    baseColor,
    lighten(baseColor, 15),
    lighten(baseColor, 30),
  ];
}

/**
 * Gets color name from hex (simplified)
 */
export function getColorName(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'Unknown';

  const { r, g, b } = rgb;

  // Simple color naming logic
  if (r > 200 && g < 100 && b < 100) return 'Red';
  if (r < 100 && g > 200 && b < 100) return 'Green';
  if (r < 100 && g < 100 && b > 200) return 'Blue';
  if (r > 200 && g > 200 && b < 100) return 'Yellow';
  if (r > 200 && g < 100 && b > 200) return 'Magenta';
  if (r < 100 && g > 200 && b > 200) return 'Cyan';
  if (r > 200 && g > 200 && b > 200) return 'White';
  if (r < 50 && g < 50 && b < 50) return 'Black';
  if (r > 100 && g > 100 && b > 100) return 'Gray';
  
  return 'Custom';
}