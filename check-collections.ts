import { config } from 'dotenv';
config({ path: '.env.local' });

async function checkCollections() {
  const apiUser = process.env.MOMO_API_USER;
  const apiKey = process.env.MOMO_API_KEY;
  const subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY;
  const baseUrl = process.env.MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com';

  if (!apiUser || !apiKey || !subscriptionKey) return;

  const basicAuth = Buffer.from(`${apiUser}:${apiKey}`).toString('base64');
  
  console.log('\n--- Checking Collections Token ---');
  try {
    const response = await fetch(`${baseUrl}/collection/token/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'application/json',
      },
    });
    console.log('Collections Token status:', response.status);
    console.log('Collections Token response:', await response.text());
  } catch (err) {
    console.error('Error:', err);
  }
}

checkCollections();
