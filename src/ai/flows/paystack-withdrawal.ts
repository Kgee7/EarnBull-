'use server';
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {paystackTransferFunds} from '@/lib/paystack';

const PaystackWithdrawalInputSchema = z.object({
  amount: z.number().describe('The amount of GHS to withdraw.'),
  recipientType: z.enum(['mobile_money', 'ghipss']).describe('The recipient type on Paystack.'),
  accountNumber: z.string().describe('The account number or mobile money number.'),
  bankCode: z.string().describe('The bank code or mobile money provider code.'),
});

export const paystackWithdrawal = ai.defineFlow(
  {
    name: 'paystackWithdrawal',
    inputSchema: PaystackWithdrawalInputSchema,
    outputSchema: z.object({
      transactionId: z.string().optional(),
      error: z.string().optional(),
    }),
  },
  async (payload) => {
    try {
      await ai.generate({
        prompt: `You are a helpful AI assistant that helps users withdraw money. You are about to withdraw ${payload.amount} GHS to ${payload.accountNumber} with code ${payload.bankCode}. Please confirm that you want to proceed.`,
        config: {
          temperature: 0.5,
        }
      });
      
      const transactionId = await paystackTransferFunds({
        amount: payload.amount,
        recipientType: payload.recipientType,
        accountNumber: payload.accountNumber,
        bankCode: payload.bankCode,
      });

      return {
        transactionId,
      };
    } catch (error: any) {
      console.error('Paystack Withdrawal Flow Error:', error);
      // Return the error instead of throwing it to avoid Next.js production error masking
      return {
        error: error.message || 'Unknown error occurred during withdrawal processing',
      };
    }
  }
);

/**
 * Server Action wrapper for the Paystack withdrawal flow.
 */
export async function runPaystackWithdrawal(payload: z.infer<typeof PaystackWithdrawalInputSchema>) {
  return await paystackWithdrawal(payload);
}
