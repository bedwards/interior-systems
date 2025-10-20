/**
 * Validates email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 */
export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates hex color
 */
export function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Validates URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates number is within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validates required field
 */
export function isRequired(value: any): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value != null;
}

/**
 * Validates minimum length
 */
export function minLength(value: string, min: number): boolean {
  return value.length >= min;
}

/**
 * Validates maximum length
 */
export function maxLength(value: string, max: number): boolean {
  return value.length <= max;
}

/**
 * Validates file type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -2));
    }
    return file.type === type;
  });
}

/**
 * Validates file size
 */
export function isValidFileSize(file: File, maxSizeInMB: number): boolean {
  const maxBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Validates dimensions (room measurements)
 */
export function isValidDimension(value: number): boolean {
  return value > 0 && value < 1000; // Max 1000 meters
}

/**
 * Validates budget
 */
export function isValidBudget(value: number): boolean {
  return value >= 0 && value <= 100000000; // Max $100M
}

/**
 * Form validation helper
 */
export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: Partial<Record<keyof T, (value: any) => string | null>>
): { valid: boolean; errors: Partial<Record<keyof T, string>> } {
  const errors: Partial<Record<keyof T, string>> = {};

  for (const field in rules) {
    const validator = rules[field];
    if (validator) {
      const error = validator(data[field]);
      if (error) {
        errors[field] = error;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}