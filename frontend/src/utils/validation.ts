// TrustKey Validation Utilities

import { VALIDATION_RULES } from './constants';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Base validation class
 */
export class Validator {
  private errors: string[] = [];

  /**
   * Add error to validation result
   */
  private addError(message: string): void {
    this.errors.push(message);
  }

  /**
   * Clear all errors
   */
  private clearErrors(): void {
    this.errors = [];
  }

  /**
   * Get validation result
   */
  public getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors],
    };
  }

  /**
   * Validate required field
   */
  public required(value: any, fieldName: string): this {
    if (value === null || value === undefined || value === '') {
      this.addError(`${fieldName} is required`);
    }
    return this;
  }

  /**
   * Validate string length
   */
  public length(value: string, min: number, max: number, fieldName: string): this {
    if (typeof value !== 'string') {
      this.addError(`${fieldName} must be a string`);
      return this;
    }

    if (value.length < min) {
      this.addError(`${fieldName} must be at least ${min} characters long`);
    }

    if (value.length > max) {
      this.addError(`${fieldName} must be no more than ${max} characters long`);
    }

    return this;
  }

  /**
   * Validate email format
   */
  public email(value: string, fieldName: string = 'Email'): this {
    if (value && !VALIDATION_RULES.EMAIL.test(value)) {
      this.addError(`${fieldName} must be a valid email address`);
    }
    return this;
  }

  /**
   * Validate Ethereum address
   */
  public ethereumAddress(value: string, fieldName: string = 'Address'): this {
    if (value && !VALIDATION_RULES.ETHEREUM_ADDRESS.test(value)) {
      this.addError(`${fieldName} must be a valid Ethereum address`);
    }
    return this;
  }

  /**
   * Validate phone number
   */
  public phone(value: string, fieldName: string = 'Phone'): this {
    if (value && !VALIDATION_RULES.PHONE.test(value)) {
      this.addError(`${fieldName} must be a valid phone number`);
    }
    return this;
  }

  /**
   * Validate URL
   */
  public url(value: string, fieldName: string = 'URL'): this {
    if (value && !VALIDATION_RULES.URL.test(value)) {
      this.addError(`${fieldName} must be a valid URL`);
    }
    return this;
  }

  /**
   * Validate IPFS hash
   */
  public ipfsHash(value: string, fieldName: string = 'IPFS Hash'): this {
    if (value && !VALIDATION_RULES.IPFS_HASH.test(value)) {
      this.addError(`${fieldName} must be a valid IPFS hash`);
    }
    return this;
  }

  /**
   * Validate credential hash
   */
  public credentialHash(value: string, fieldName: string = 'Credential Hash'): this {
    if (value && !VALIDATION_RULES.CREDENTIAL_HASH.test(value)) {
      this.addError(`${fieldName} must be a valid credential hash`);
    }
    return this;
  }

  /**
   * Validate numeric range
   */
  public range(value: number, min: number, max: number, fieldName: string): this {
    if (typeof value !== 'number') {
      this.addError(`${fieldName} must be a number`);
      return this;
    }

    if (value < min) {
      this.addError(`${fieldName} must be at least ${min}`);
    }

    if (value > max) {
      this.addError(`${fieldName} must be no more than ${max}`);
    }

    return this;
  }

  /**
   * Validate array length
   */
  public arrayLength(value: any[], min: number, max: number, fieldName: string): this {
    if (!Array.isArray(value)) {
      this.addError(`${fieldName} must be an array`);
      return this;
    }

    if (value.length < min) {
      this.addError(`${fieldName} must have at least ${min} items`);
    }

    if (value.length > max) {
      this.addError(`${fieldName} must have no more than ${max} items`);
    }

    return this;
  }

  /**
   * Validate custom pattern
   */
  public pattern(value: string, pattern: RegExp, fieldName: string, message?: string): this {
    if (value && !pattern.test(value)) {
      this.addError(message || `${fieldName} format is invalid`);
    }
    return this;
  }

  /**
   * Validate one of multiple values
   */
  public oneOf(value: any, options: any[], fieldName: string): this {
    if (!options.includes(value)) {
      this.addError(`${fieldName} must be one of: ${options.join(', ')}`);
    }
    return this;
  }

  /**
   * Validate date
   */
  public date(value: string | Date, fieldName: string = 'Date'): this {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      this.addError(`${fieldName} must be a valid date`);
    }
    return this;
  }

  /**
   * Validate future date
   */
  public futureDate(value: string | Date, fieldName: string = 'Date'): this {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      this.addError(`${fieldName} must be a valid date`);
      return this;
    }

    if (date <= new Date()) {
      this.addError(`${fieldName} must be in the future`);
    }
    return this;
  }

  /**
   * Validate past date
   */
  public pastDate(value: string | Date, fieldName: string = 'Date'): this {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      this.addError(`${fieldName} must be a valid date`);
      return this;
    }

    if (date >= new Date()) {
      this.addError(`${fieldName} must be in the past`);
    }
    return this;
  }

  /**
   * Validate file size
   */
  public fileSize(file: File, maxSize: number, fieldName: string = 'File'): this {
    if (file.size > maxSize) {
      this.addError(`${fieldName} size must be no more than ${maxSize} bytes`);
    }
    return this;
  }

  /**
   * Validate file type
   */
  public fileType(file: File, allowedTypes: string[], fieldName: string = 'File'): this {
    if (!allowedTypes.includes(file.type)) {
      this.addError(`${fieldName} type must be one of: ${allowedTypes.join(', ')}`);
    }
    return this;
  }
}

/**
 * Create new validator instance
 */
export const createValidator = (): Validator => {
  return new Validator();
};

/**
 * Validate user registration data
 */
export const validateUserRegistration = (data: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  walletAddress: string;
}): ValidationResult => {
  const validator = createValidator();

  return validator
    .required(data.username, 'Username')
    .length(data.username, 3, 50, 'Username')
    .required(data.email, 'Email')
    .email(data.email)
    .required(data.password, 'Password')
    .length(data.password, 8, 128, 'Password')
    .required(data.confirmPassword, 'Confirm Password')
    .required(data.walletAddress, 'Wallet Address')
    .ethereumAddress(data.walletAddress)
    .getResult();
};

/**
 * Validate credential data
 */
export const validateCredentialData = (data: {
  type: string;
  issuer: string;
  subject: string;
  claims: Record<string, any>;
  expirationDate?: string;
}): ValidationResult => {
  const validator = createValidator();

  return validator
    .required(data.type, 'Credential Type')
    .required(data.issuer, 'Issuer')
    .ethereumAddress(data.issuer, 'Issuer Address')
    .required(data.subject, 'Subject')
    .ethereumAddress(data.subject, 'Subject Address')
    .required(data.claims, 'Claims')
    .getResult();
};

/**
 * Validate identity data
 */
export const validateIdentityData = (data: {
  did: string;
  publicKey: string;
  attributes: Record<string, any>;
}): ValidationResult => {
  const validator = createValidator();

  return validator
    .required(data.did, 'DID')
    .required(data.publicKey, 'Public Key')
    .required(data.attributes, 'Attributes')
    .getResult();
};

/**
 * Validate reputation event data
 */
export const validateReputationEvent = (data: {
  type: string;
  value: number;
  description: string;
  metadata?: Record<string, any>;
}): ValidationResult => {
  const validator = createValidator();

  return validator
    .required(data.type, 'Event Type')
    .required(data.value, 'Event Value')
    .range(data.value, -1000, 1000, 'Event Value')
    .required(data.description, 'Description')
    .length(data.description, 1, 500, 'Description')
    .getResult();
};

/**
 * Validate verification request data
 */
export const validateVerificationRequest = (data: {
  credentialId: string;
  circuitType: string;
  publicInputs: Record<string, any>;
  privateInputs: Record<string, any>;
}): ValidationResult => {
  const validator = createValidator();

  return validator
    .required(data.credentialId, 'Credential ID')
    .required(data.circuitType, 'Circuit Type')
    .required(data.publicInputs, 'Public Inputs')
    .required(data.privateInputs, 'Private Inputs')
    .getResult();
};

/**
 * Validate API request data
 */
export const validateApiRequest = (data: {
  method: string;
  endpoint: string;
  headers?: Record<string, string>;
  body?: any;
}): ValidationResult => {
  const validator = createValidator();

  return validator
    .required(data.method, 'HTTP Method')
    .oneOf(data.method, ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 'HTTP Method')
    .required(data.endpoint, 'Endpoint')
    .url(data.endpoint, 'Endpoint')
    .getResult();
};

/**
 * Validate form data
 */
export const validateFormData = (data: Record<string, any>, rules: Record<string, (validator: Validator) => Validator>): ValidationResult => {
  const validator = createValidator();

  Object.entries(rules).forEach(([field, rule]) => {
    rule(validator);
  });

  return validator.getResult();
};

/**
 * Validate JSON schema
 */
export const validateJsonSchema = (data: any, schema: any): ValidationResult => {
  // This is a simplified JSON schema validation
  // In a real application, you would use a library like ajv
  const validator = createValidator();

  if (schema.required) {
    schema.required.forEach((field: string) => {
      validator.required(data[field], field);
    });
  }

  if (schema.properties) {
    Object.entries(schema.properties).forEach(([field, fieldSchema]: [string, any]) => {
      if (data[field] !== undefined) {
        if (fieldSchema.type === 'string') {
          validator.length(data[field], fieldSchema.minLength || 0, fieldSchema.maxLength || Infinity, field);
        } else if (fieldSchema.type === 'number') {
          validator.range(data[field], fieldSchema.minimum || -Infinity, fieldSchema.maximum || Infinity, field);
        }
      }
    });
  }

  return validator.getResult();
};
