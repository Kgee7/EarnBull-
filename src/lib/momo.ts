import { webcrypto } from 'crypto';

interface MomoTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface MomoTransferRequest {
  amount: number;
  phoneNumber: string;
  network?: string;
  payerMessage?: string;
  payeeNote?: string;
}

/**
 * Get a token for disbursement
 */
async function getMomoToken(): Promise<string> {
  const apiUser = process.env.MOMO_API_USER;
  const apiKey = process.env.MOMO_API_KEY;
  const subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY;
  const baseUrl = process.env.MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com';

  console.log('[MoMo Debug] Checking variables:', {
    hasApiUser: !!apiUser,
    hasApiKey: !!apiKey,
    hasSubKey: !!subscriptionKey,
    baseUrl
  });

  if (!apiUser || !apiKey || !subscriptionKey) {
    const missing = [];
    if (!apiUser) missing.push('MOMO_API_USER');
    if (!apiKey) missing.push('MOMO_API_KEY');
    if (!subscriptionKey) missing.push('MOMO_SUBSCRIPTION_KEY');
    throw new Error(`Missing MTN MoMo credentials in environment variables: ${missing.join(', ')}`);
  }

  const basicAuth = Buffer.from(`${apiUser}:${apiKey}`).toString('base64');

  const response = await fetch(`${baseUrl}/disbursement/token/`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to get MoMo Token:', { status: response.status, error: errorText });
    throw new Error(`MoMo Auth Token Error [${response.status}]: ${errorText}`);
  }

  const data = (await response.json()) as MomoTokenResponse;
  return data.access_token;
}

/**
 * Transfer funds via MTN MoMo Disbursement API
 */
export async function transferFunds(request: MomoTransferRequest): Promise<string> {
  const subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY;
  const targetEnvironment = process.env.MOMO_TARGET_ENVIRONMENT || 'sandbox';
  const baseUrl = process.env.MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com';

  if (!subscriptionKey) {
    throw new Error('Missing MOMO_SUBSCRIPTION_KEY in environment variables.');
  }

  const token = await getMomoToken();
  const referenceId = webcrypto.randomUUID();

  // According to MoMo API, transfer requires an amount, currency, externalId, payee, payerMessage, and payeeNote
  // We use EUR by default on sandbox unless otherwise told. If they want GHS, they must configure it.
  const payload = {
    amount: request.amount.toString(),
    currency: 'EUR', // Sandbox default currency for MTN
    externalId: referenceId,
    payee: {
      partyIdType: 'MSISDN',
      partyId: request.phoneNumber, // Phone number should include Country code e.g. 233...
    },
    payerMessage: request.payerMessage || 'EarnBull Withdrawal',
    payeeNote: request.payeeNote || 'Withdrawal from EarnBull',
  };

  const response = await fetch(`${baseUrl}/disbursement/v1_0/transfer`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Reference-Id': referenceId,
      'X-Target-Environment': targetEnvironment,
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok && response.status !== 202) {
    const errorText = await response.text();
    console.error('MoMo Transfer Request Failed:', errorText);
    throw new Error(`MoMo API Transfer failed: ${response.status}`);
  }

  // 202 ACCEPTED means the transfer is being processed. 
  // We can query status using GET /disbursement/v1_0/transfer/{referenceId} if needed later.
  return referenceId;
}
