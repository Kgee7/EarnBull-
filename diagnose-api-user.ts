import { config } from 'dotenv';
config({ path: '.env.local' });

async function diagnose() {
  const apiUser = process.env.MOMO_API_USER;
  const subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY;
  const baseUrl = process.env.MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com';

  if (!apiUser || !subscriptionKey) return;

  console.log('\n--- Checking API User Configuration ---');
  try {
    const userResponse = await fetch(`${baseUrl}/v1_0/apiuser/${apiUser}`, {
      headers: { 'Ocp-Apim-Subscription-Key': subscriptionKey }
    });
    console.log('User check status:', userResponse.status);
    if (userResponse.ok) {
      console.log('User configuration:', await userResponse.json());
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

diagnose();
