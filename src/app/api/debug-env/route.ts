import { NextResponse } from 'next/server';

/**
 * A diagnostic API route to check for the presence of required environment variables.
 * It DOES NOT reveal the actual values of the secrets for security reasons.
 */
export async function GET() {
  const envVars = {
    MOMO_API_USER: !!process.env.MOMO_API_USER,
    MOMO_API_KEY: !!process.env.MOMO_API_KEY,
    MOMO_SUBSCRIPTION_KEY: !!process.env.MOMO_SUBSCRIPTION_KEY,
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    GOOGLE_GENAI_API_KEY: !!process.env.GOOGLE_GENAI_API_KEY,
    MOMO_TARGET_ENVIRONMENT: process.env.MOMO_TARGET_ENVIRONMENT || 'not set (default: sandbox)',
    MOMO_BASE_URL: process.env.MOMO_BASE_URL || 'not set (default: sandbox)',
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json({
    status: 'ok',
    message: 'Environment variable presence check',
    timestamp: new Date().toISOString(),
    variables: envVars,
  });
}
