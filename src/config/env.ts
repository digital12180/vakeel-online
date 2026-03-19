import dotenv from "dotenv";
dotenv.config();

function getEnvVariables(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable ${key}`);
    }
    return value;
}
function getEnvVariablesNum(key: string): number {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable ${key}`);

    }
    return Number(value);
}
export const env = {
    NODE_ENV: getEnvVariables("NODE_ENV"),
    PORT: getEnvVariablesNum("PORT"),
    API_PREFIX: getEnvVariables("API_PREFIX"),
    MONGODB_URI: getEnvVariables("MONGODB_URI"),
    REDIS_URL:  getEnvVariables("REDIS_URL"),
    JWT_SECRET:  getEnvVariables("JWT_SECRET"),
    JWT_EXPIRES_IN:  getEnvVariables("JWT_EXPIRES_IN"),
    JWT_REFRESH_SECRET:  getEnvVariables("JWT_REFRESH_SECRET"),
    JWT_REFRESH_EXPIRES_IN:  getEnvVariables("JWT_REFRESH_EXPIRES_IN"),
    BCRYPT_ROUNDS:  getEnvVariablesNum("BCRYPT_ROUNDS"),
    STRIPE_PUBLISHABLE_KEY:  getEnvVariables("STRIPE_PUBLISHABLE_KEY"),
    STRIPE_SECRET_KEY:  getEnvVariables("STRIPE_SECRET_KEY"),
    STRIPE_WEBHOOK_SECRET:  getEnvVariables("STRIPE_WEBHOOK_SECRET"),
    CURRENCY:  getEnvVariables("CURRENCY"),
    CONSULTATION_FEE:  getEnvVariablesNum("CONSULTATION_FEE"),
    SMTP_HOST:  getEnvVariablesNum("SMTP_HOST"),
    SMTP_PORT:  getEnvVariablesNum("SMTP_PORT"),
    SMTP_SECURE: Boolean(process.env.SMTP_SECURE)||false,
    SMTP_USER:  getEnvVariables("SMTP_USER"),
    SMTP_PASS:  getEnvVariables("SMTP_PASS"),
    EMAIL_FROM:  getEnvVariables("EMAIL_FROM"),
    TWILIO_ACCOUNT_SID:  getEnvVariables("TWILIO_ACCOUNT_SID"),
    TWILIO_AUTH_TOKEN:  getEnvVariables("TWILIO_AUTH_TOKEN"),
    TWILIO_PHONE_NUMBER:  getEnvVariablesNum("TWILIO_PHONE_NUMBER"),
    CLOUDINARY_CLOUD_NAME:  getEnvVariables("CLOUDINARY_CLOUD_NAME"),
    CLOUDINARY_API_KEY:  getEnvVariables("CLOUDINARY_API_KEY"),
    CLOUDINARY_API_SECRET:  getEnvVariables("CLOUDINARY_API_SECRET"),
    MAX_FILE_SIZE:  getEnvVariablesNum("MAX_FILE_SIZE"),
    ALLOWED_FILE_TYPES: getEnvVariables("ALLOWED_FILE_TYPES"),
    FRONTEND_URL: getEnvVariables("FRONTEND_URL"),
    FRONTEND_URL_PROD:  getEnvVariables("FRONTEND_URL_PROD"),
    ADMIN_EMAIL:  getEnvVariables("ADMIN_EMAIL"),
    ADMIN_PASSWORD:  getEnvVariables("ADMIN_PASSWORD"),
}