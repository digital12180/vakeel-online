// app/responses/message.ts

export const ERROR_MESSAGES = {
  // ==================== AUTHENTICATION ERRORS ====================
  NO_TOKEN: 'Access denied. No token provided.',
  INVALID_TOKEN: 'Invalid or expired token.',
  INVALID_ROLE: 'Invalid user role.',
  ACCESS_DENIED: 'Access denied. Insufficient permissions.',
  USER_NOT_FOUND: 'User not found.',
  ACCOUNT_INACTIVE: 'Your account is inactive. Please contact support.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address.',
  PHONE_NOT_VERIFIED: 'Please verify your phone number.',
  INVALID_CREDENTIALS: 'Invalid email/phone or password.',
  ACCOUNT_LOCKED: 'Account is temporarily locked. Try again later.',
  SESSION_EXPIRED: 'Session expired. Please try again.',
  MAX_ATTEMPTS_EXCEEDED: 'Maximum attempts exceeded. Please request new OTP.',
  // ==================== UPLOAD & S3 ERRORS ====================
  FILE_UPLOAD_FAILED: 'File upload failed',
  INVALID_FILE_TYPE: 'Invalid file type. Allowed: JPEG, PNG, JPG, WebP, GIF, SVG',
  FILE_TOO_LARGE: 'File size too large. Maximum size: 10MB',
  FILE_NOT_FOUND_IN_S3: 'File not found in storage',
  S3_CONFIGURATION_ERROR: 'S3 storage not configured properly',
  PRESIGNED_URL_GENERATION_FAILED: 'Failed to generate upload URL',
  BULK_UPLOAD_LIMIT_EXCEEDED: 'Maximum 10 files allowed per bulk upload',
  FILE_VALIDATION_FAILED: 'File validation failed',
  IMAGE_FOLDER_INVALID: 'Image must be in category-images folder',
  ORPHANED_IMAGES_CLEANUP_FAILED: 'Failed to cleanup orphaned images',

  // ==================== REGISTRATION & VALIDATION ERRORS ====================
  VALIDATION_ERROR: 'Validation failed.',
  INVALID_EMAIL: 'Invalid email format.',
  INVALID_PHONE: 'Invalid phone number. Must be 10 digits.',
  INVALID_PASSWORD: 'Password must be at least 6 characters.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  INVALID_NAME: 'Name must be between 2 and 50 characters.',
  INVALID_GENDER: 'Gender must be male, female, or other.',
  INVALID_DATE: 'Invalid date format. Use YYYY-MM-DD.',
  INVALID_OTP: 'Invalid or expired OTP.',
  INVALID_SESSION_ID: 'Invalid session ID.',
  IDENTIFIER_REQUIRED: 'Email or phone is required.',
  INVALID_IDENTIFIER: 'Please enter a valid email or 10-digit phone number.',
  INVALID_TYPE: 'Invalid type. Must be register, login, or forgot_password.',
  USER_DATA_INVALID: 'userData must be an object.',
  SESSION_ID_REQUIRED: 'Session ID is required.',
  OTP_REQUIRED: 'OTP is required.',
  OTP_INVALID_FORMAT: 'OTP must be exactly 6 digits.',
  OTP_NUMERIC: 'OTP must contain only numbers.',
  NAME_REQUIRED: 'Name is required.',
  PASSWORD_REQUIRED: 'Password is required.',
  PASSWORD_EMPTY: 'Password cannot be empty.',
  CONFIRM_PASSWORD_REQUIRED: 'Confirm password is required.',
  EMAIL_REQUIRED: 'Email is required.',
  GENDER_INVALID: 'Gender must be male, female, or other.',
  DATE_FORMAT_INVALID: 'Invalid date format. Use YYYY-MM-DD.',

  // ✅ NEW: Added from your auth service
  EMAIL_ALREADY_REGISTERED: 'Email already registered',
  PHONE_ALREADY_REGISTERED: 'Phone number already registered',
  INVALID_SESSION_TYPE_REGISTER: 'Invalid session type for registration',
  INVALID_SESSION_TYPE_PASSWORD_RESET: 'Invalid session type for password reset',
  SESSION_EXPIRED_NOT_VERIFIED: 'Session expired or not verified',
  REGISTRATION_IDENTIFIER_MISMATCH: 'Registration identifier must match the identifier used for OTP verification',
  PASSWORD_PREPARATION_FAILED: 'Password validation failed',
  PASSWORD_RESET_FAILED: 'Password reset failed',
  FORGOT_PASSWORD_OTP_MESSAGE: 'If your account exists, you will receive an OTP.',
  ACCOUNT_DEACTIVATED: 'Account is deactivated. Please contact support.',
  ACCOUNT_NOT_VERIFIED: 'Account not verified. Please verify your account.',
  NO_PASSWORD_FIELD: 'No password field found in user object',
  PASSWORD_NOT_HASHED: 'Password not properly hashed',

  // ==================== RESOURCE ERRORS ====================
  NOT_FOUND: 'Resource not found.',
  ALREADY_EXISTS: 'Resource already exists.',
  INVALID_OBJECT_ID: 'Invalid MongoDB ObjectId',
  EMPTY_ARRAY_NOT_ALLOWED: 'Array cannot be empty',
  REQUIRED_PARAM_MISSING: 'Required parameter is missing',
  INVALID_PAGINATION_PARAMS: 'Invalid pagination parameters',

  // ==================== CART/ORDER ERRORS ====================
  CART_EMPTY: 'Cart is empty.',
  INVALID_QUANTITY: 'Invalid quantity.',
  ORDER_CANCELLED: 'Order has been cancelled.',

  // ==================== SERVER ERRORS ====================
  SERVER_ERROR: 'Internal server error.',
  DATABASE_ERROR: 'Database connection error.',
  UPLOAD_ERROR: 'File upload failed.',
  EMAIL_SEND_ERROR: 'Failed to send email.',
  SMS_SEND_ERROR: 'Failed to send SMS.',
  AWS_S3_ERROR: 'AWS S3 service error',
  MONGOOSE_ERROR: 'Database operation failed',
  VALIDATION_MIDDLEWARE_ERROR: 'Validation middleware error',

  // ==================== RATE LIMITING ====================
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',

  // ==================== BUSINESS LOGIC ERRORS ====================
  OPERATION_NOT_ALLOWED: 'Operation not allowed',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this operation',
  FEATURE_NOT_IMPLEMENTED: 'Feature not implemented yet',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',

  // ==================== VALIDATION SPECIFIC ====================
  INVALID_SLUG_FORMAT: 'Slug can only contain lowercase letters, numbers, and hyphens',
  INVALID_BOOLEAN_VALUE: 'Value must be true or false',
  INVALID_NUMBER: 'Invalid number format',
  INVALID_ARRAY: 'Invalid array format',
  STRING_LENGTH_EXCEEDED: 'String length exceeded maximum limit',
  INVALID_URL_FORMAT: 'Invalid URL format',
} as const;

export const SUCCESS_MESSAGES = {
  // ==================== AUTHENTICATION SUCCESS ====================
  LOGIN_SUCCESS: 'Login successful.',
  REGISTER_SUCCESS: 'Registration successful.',
  LOGOUT_SUCCESS: 'Logout successful.',
  PASSWORD_RESET: 'Password reset successful.',
  EMAIL_VERIFIED: 'Email verified successfully.',
  PHONE_VERIFIED: 'Phone verified successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  OTP_SENT: 'OTP sent successfully.',
  OTP_VERIFIED: 'OTP verified successfully.',

  // ✅ NEW: Added from your auth service
  OTP_GENERATED_DEV: 'OTP generated successfully (check server console)',
  OTP_EMAIL_SENT: 'OTP sent to your email',
  OTP_EMAIL_ISSUE: 'OTP generated (email service issue)',
  OTP_SMS_NOT_CONFIGURED: 'OTP would be sent to your phone (SMS service not configured)',
  OTP_VERIFIED_DEV: 'OTP verified successfully (Development Mode)',
  WELCOME_EMAIL_SENT: 'Welcome email sent',
  TEST_USER_CREATED: 'Test user created for development',
  PASSWORD_UPDATED_RELOGIN: 'Password updated. Please try login again.',
  PASSWORD_REHASHED: 'Password re-hashed and saved',
  USER_REGISTERED_SUCCESS: 'User registered successfully',

  // ==================== UPLOAD & S3 SUCCESS ====================
  UPLOAD_URL_GENERATED: 'Upload URL generated successfully',
  BULK_UPLOAD_URLS_GENERATED: 'Bulk upload URLs generated successfully',
  IMAGE_UPLOADED: 'Image uploaded successfully',
  IMAGE_VALIDATED: 'Image validated successfully',
  IMAGE_INFO_FETCHED: 'Image information fetched successfully',
  IMAGE_DELETED: 'Image deleted successfully',
  S3_FILE_INFO_FETCHED: 'File information fetched successfully',
  PRESIGNED_URL_CREATED: 'Presigned URL created successfully',
  DOWNLOAD_URL_GENERATED: 'Download URL generated successfully',
  VIEW_URL_GENERATED: 'View URL generated successfully',
  FILE_EXISTS_CHECKED: 'File existence checked successfully',
  S3_OPERATION_SUCCESS: 'S3 operation completed successfully',

  // ==================== PRODUCT SUCCESS ====================
  SERVICE_ADDED: "Service created successfully",
  SERVICE_UPDATED: 'Service updated successfully.',
  SERVICE_DELETED: 'Service deleted successfully.',
  SERVICE_FETCHED: 'Service fetched successfully',
  
  // ==================== CART SUCCESS ====================
  ADDED_TO_CART: 'Product added to cart.',
  CART_UPDATED: 'Cart updated successfully.',
  CART_CLEARED: 'Cart cleared successfully.',
  CART_FETCHED: 'Cart fetched successfully',

  // ==================== ORDER SUCCESS ====================
  ORDER_PLACED: 'Order placed successfully.',
  ORDER_UPDATED: 'Order updated successfully.',
  ORDER_CANCELLED: 'Order cancelled successfully.',
  ORDER_FETCHED: 'Order fetched successfully',
  ORDERS_FETCHED: 'Orders fetched successfully',

  // ==================== REVIEW SUCCESS ====================
  REVIEW_ADDED: 'Review added successfully.',
  REVIEW_UPDATED: 'Review updated successfully.',
  REVIEW_DELETED: 'Review deleted successfully.',
  REVIEWS_FETCHED: 'Reviews fetched successfully',

  // ==================== GENERAL SUCCESS ====================
  OPERATION_SUCCESS: 'Operation completed successfully',
  DATA_FETCHED: 'Data fetched successfully',
  DATA_UPDATED: 'Data updated successfully',
  DATA_DELETED: 'Data deleted successfully',
  DATA_CREATED: 'Data created successfully',
  BULK_OPERATION_SUCCESS: 'Bulk operation completed successfully',
  VALIDATION_SUCCESS: 'Validation passed successfully',
  HEALTH_CHECK_OK: 'Service is operational',
  CONFIGURATION_VALID: 'Configuration is valid',
  SETTINGS_UPDATED: 'Settings updated successfully',
  CACHE_CLEARED: 'Cache cleared successfully',

  // ==================== PAGINATION SUCCESS ====================
  PAGINATED_DATA_FETCHED: 'Paginated data fetched successfully',

  // ==================== SYSTEM SUCCESS ====================
  SYSTEM_HEALTHY: 'System is healthy',
  SERVICE_RUNNING: 'Service is running normally',
  BACKUP_CREATED: 'Backup created successfully',
  MAINTENANCE_COMPLETED: 'Maintenance completed successfully',

  // ==================== API SUCCESS ====================
  API_REQUEST_SUCCESS: 'API request successful',
  WEBHOOK_RECEIVED: 'Webhook received successfully',
  INTEGRATION_SUCCESS: 'Integration completed successfully',

  // ==================== NOTIFICATION SUCCESS ====================
  NOTIFICATION_SENT: 'Notification sent successfully',
  EMAIL_SENT: 'Email sent successfully',
  SMS_SENT: 'SMS sent successfully',
  PUSH_NOTIFICATION_SENT: 'Push notification sent successfully',

  // ==================== FILE OPERATIONS ====================
  FILE_DOWNLOADED: 'File downloaded successfully',
  FILE_PROCESSED: 'File processed successfully',
  FILE_FORMAT_VALIDATED: 'File format validated successfully',

  // ==================== SEARCH & FILTER ====================
  SEARCH_COMPLETED: 'Search completed successfully',
  FILTER_APPLIED: 'Filter applied successfully',
  SORT_APPLIED: 'Sort applied successfully',
} as const;

// ==================== HTTP STATUS CODE MAPPING ====================
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  PARTIAL_CONTENT: 206,

  // Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  UNPROCESSABLE_ENTITY: 422,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NOT_EXTENDED: 510,
  NETWORK_AUTHENTICATION_REQUIRED: 511,
} as const;

// ==================== RESPONSE TEMPLATES ====================
export const RESPONSE_TEMPLATES = {
  SUCCESS: (message: string, data?: any) => ({
    success: true,
    message,
    data: data || null,
    timestamp: new Date().toISOString(),
  }),

  ERROR: (message: string, errors?: any[], statusCode?: number) => ({
    success: false,
    message,
    errors: errors || [],
    statusCode: statusCode || 500,
    timestamp: new Date().toISOString(),
  }),

  PAGINATED: (
    data: any[],
    total: number,
    page: number,
    limit: number,
    message: string
  ) => {
    const totalPages = Math.ceil(total / limit);
    return {
      success: true,
      message,
      data,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
      timestamp: new Date().toISOString(),
    };
  },

  HEALTH: (service: string, status: string, details?: any) => ({
    success: true,
    message: `${service} is ${status}`,
    service,
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    ...details,
  }),
} as const;

// ==================== VALIDATION MESSAGES ====================
export const VALIDATION_MESSAGES = {
  REQUIRED: (field: string) => `${field} is required`,
  MIN_LENGTH: (field: string, min: number) => `${field} must be at least ${min} characters`,
  MAX_LENGTH: (field: string, max: number) => `${field} cannot exceed ${max} characters`,
  INVALID_FORMAT: (field: string) => `Invalid ${field} format`,
  INVALID_TYPE: (field: string, type: string) => `${field} must be ${type}`,
  NOT_MATCH: (field1: string, field2: string) => `${field1} does not match ${field2}`,
  INVALID_VALUE: (field: string) => `Invalid ${field} value`,
  UNIQUE: (field: string) => `${field} already exists`,
  NOT_FOUND: (field: string) => `${field} not found`,
  INVALID_EMAIL: () => 'Please enter a valid email address',
  INVALID_PHONE: () => 'Please enter a valid 10-digit phone number',
  INVALID_PASSWORD: () => 'Password must be at least 6 characters',
  INVALID_URL: () => 'Please enter a valid URL',
  INVALID_DATE: () => 'Please enter a valid date (YYYY-MM-DD)',
  INVALID_BOOLEAN: () => 'Value must be true or false',
  INVALID_NUMBER: () => 'Value must be a number',
  INVALID_ARRAY: () => 'Value must be an array',
  INVALID_OBJECT_ID: () => 'Invalid MongoDB ObjectId format',
  INVALID_SLUG: () => 'Slug can only contain lowercase letters, numbers, and hyphens',
  INVALID_FILE_TYPE: (allowedTypes: string[]) =>
    `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
  FILE_TOO_LARGE: (maxSizeMB: number) =>
    `File too large. Maximum size: ${maxSizeMB}MB`,
} as const;

// ==================== CATEGORY SPECIFIC MESSAGES ====================
export const CATEGORY_MESSAGES = {
  // Success Messages
  CREATED: 'Category created successfully',
  UPDATED: 'Category updated successfully',
  DELETED: 'Category deleted successfully',
  FETCHED: 'Category fetched successfully',
  LIST_FETCHED: 'Categories fetched successfully',
  TREE_FETCHED: 'Category tree fetched successfully',
  IMAGE_UPLOADED: 'Category image uploaded successfully',
  IMAGE_DELETED: 'Category image deleted successfully',
  STATUS_TOGGLED: 'Category status toggled successfully',
  FEATURED_TOGGLED: 'Category featured status toggled successfully',
  BULK_UPDATED: 'Categories updated in bulk successfully',
  BULK_DELETED: 'Categories deleted in bulk successfully',

  // Error Messages
  NOT_FOUND: 'Category not found',
  EXISTS: 'Category already exists',
  HAS_CHILDREN: 'Cannot delete category with sub-categories',
  INVALID_PARENT: 'Invalid parent category',
  SELF_PARENT: 'Category cannot be its own parent',
  INVALID_IMAGE: 'Invalid category image',
  IMAGE_NOT_FOUND: 'Category image not found',
  SLUG_EXISTS: 'Category slug already exists',

  // Validation Messages
  NAME_REQUIRED: 'Category name is required',
  NAME_LENGTH: 'Category name must be 2-100 characters',
  DESCRIPTION_LENGTH: 'Description cannot exceed 500 characters',
  META_TITLE_LENGTH: 'Meta title cannot exceed 100 characters',
  META_DESC_LENGTH: 'Meta description cannot exceed 200 characters',
  SLUG_INVALID: 'Invalid slug format',
} as const;

// ==================== UPLOAD SPECIFIC MESSAGES ====================
export const UPLOAD_MESSAGES = {
  // Success Messages
  URL_GENERATED: 'Upload URL generated successfully',
  BULK_URLS_GENERATED: 'Bulk upload URLs generated successfully',
  FILE_UPLOADED: 'File uploaded successfully',
  FILE_VALIDATED: 'File validated successfully',
  FILE_INFO_FETCHED: 'File information fetched successfully',
  FILE_DELETED: 'File deleted successfully',

  // Error Messages
  NO_FILE: 'No file provided',
  INVALID_TYPE: 'Invalid file type',
  TOO_LARGE: 'File too large',
  UPLOAD_FAILED: 'File upload failed',
  S3_ERROR: 'S3 storage error',
  NOT_FOUND: 'File not found',
  INVALID_KEY: 'Invalid file key',

  // Validation Messages
  FILENAME_REQUIRED: 'File name is required',
  FILETYPE_REQUIRED: 'File type is required',
  FILES_ARRAY_REQUIRED: 'Files array is required',
} as const;

// ==================== EXPORT ALL MESSAGES ====================
export default {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  RESPONSE_TEMPLATES,
  VALIDATION_MESSAGES,
  CATEGORY_MESSAGES,
  UPLOAD_MESSAGES,
};