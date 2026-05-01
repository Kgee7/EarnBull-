import { randomUUID } from 'crypto';

export interface PaystackTransferRequest {
  amount: number;
  recipientType: 'mobile_money' | 'ghipss';
  accountNumber: string;
  bankCode: string;
  name?: string;
  reason?: string;
}

export function getPaystackProviderCode(network: string): string {
  const norm = network.toUpperCase();
  if (norm === 'MTN') return 'MTN';
  if (norm === 'VODAFONE') return 'VOD';
  if (norm === 'AT' || norm === 'AIRTELTIGO') return 'ATL';
  return 'MTN'; // default to MTN if unknown
}

export async function paystackTransferFunds(request: PaystackTransferRequest): Promise<string> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing PAYSTACK_SECRET_KEY in environment variables.');
  }

  // 1. Create Transfer Recipient
  const recipientRes = await fetch('https://api.paystack.co/transferrecipient', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: request.recipientType,
      name: request.name || 'User Withdrawal',
      account_number: request.accountNumber,
      bank_code: request.bankCode,
      currency: 'GHS',
    }),
  });

  const recipientData = await recipientRes.json();
  if (!recipientRes.ok || !recipientData.status) {
    console.error('Paystack Transfer Recipient Error:', recipientData);
    throw new Error(recipientData.message || 'Failed to create transfer recipient');
  }

  const recipientCode = recipientData.data.recipient_code;

  // 2. Initiate Transfer
  // Paystack expects amount in pesewas (amount * 100)
  const amountInPesewas = Math.round(request.amount * 100);
  
  // Generate a unique reference to prevent double crediting
  const transferReference = `earnbull_${randomUUID()}`;

  const transferRes = await fetch('https://api.paystack.co/transfer', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'balance',
      amount: amountInPesewas,
      recipient: recipientCode,
      reason: request.reason || 'EarnBull Withdrawal',
      reference: transferReference
    }),
  });

  const transferData = await transferRes.json();
  if (!transferRes.ok || !transferData.status) {
    console.error('Paystack Transfer Error:', transferData);
    throw new Error(transferData.message || 'Failed to initiate transfer');
  }

  // transferData.data.reference or transferData.data.transfer_code
  return transferData.data.reference || transferData.data.transfer_code;
}
