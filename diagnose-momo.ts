import { config } from 'dotenv';
config({ path: '.env.local' });

async function diagnose() {
  const apiUser = process.env.MOMO_API_USER;
  const apiKey = process.env.MOMO_API_KEY;
  const subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY;
  const baseUrl = process.env.MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com';

  console.log('--- MTN MoMo Diagnostics ---');
  console.log('Base URL:', baseUrl);
  console.log('API User:', apiUser ? 'Present' : 'MISSING');
  console.log('API Key:', apiKey ? 'Present' : 'MISSING');
  console.log('Subscription Key:', subscriptionKey ? 'Present' : 'MISSING');

  if (!apiUser || !apiKey || !subscriptionKey) return;

  // 1. Verify API User exists
  console.log('\n1. Verifying API User existence...');
  try {
    const userResponse = await fetch(`${baseUrl}/v1_0/apiuser/${apiUser}`, {
      headers: { 'Ocp-Apim-Subscription-Key': subscriptionKey }
    });
    console.log('User check status:', userResponse.status);
    if (!userResponse.ok) {
      console.log('User check failed. Likely the apiUser is not registered with this subscription key.');
    }
  } catch (err) {
    console.error('Network error during user check:', err);
  }

  // 2. Attempt Token generation
  console.log('\n2. Attempting Token generation (Disbursement)...');
  const basicAuth = Buffer.from(`${apiUser}:${apiKey}`).toString('base64');
  try {
    const tokenResponse = await fetch(`${baseUrl}/disbursement/token/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'application/json',
      },
    });
    const data = await tokenResponse.text();
    console.log('Token status:', tokenResponse.status);
    console.log('Token response:', data);
  } catch (err) {
    console.error('Network error during token generation:', err);
  }
}

diagnose();
