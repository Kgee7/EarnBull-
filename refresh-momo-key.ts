import { config } from 'dotenv';
config({ path: '.env.local' });

async function refreshKey() {
  const apiUser = process.env.MOMO_API_USER;
  const subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY;
  const baseUrl = process.env.MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com';

  if (!apiUser || !subscriptionKey) {
    console.error('Missing MOMO_API_USER or MOMO_SUBSCRIPTION_KEY in .env.local');
    return;
  }

  console.log(`Refreshing API Key for User: ${apiUser}...`);
  
  try {
    const response = await fetch(`${baseUrl}/v1_0/apiuser/${apiUser}/apikey`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Failed to refresh key: ${response.status}`, errText);
      return;
    }

    const data = await response.json();
    console.log('--- NEW API KEY GENERATED ---');
    console.log(data.apiKey);
    console.log('-----------------------------');
    console.log('Please update your MOMO_API_KEY in .env.local with this value.');
  } catch (err) {
    console.error('Error refreshing key:', err);
  }
}

refreshKey();
