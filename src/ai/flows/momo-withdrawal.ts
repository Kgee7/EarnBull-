'use server';
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {webcrypto} from 'crypto';
import {transferFunds} from '@/lib/momo';

const MomoWithdrawalInputSchema = z.object({
  amount: z.number().describe('The amount of GHS to withdraw.'),
  network: z
    .string()
    .describe('The mobile money network to withdraw to (e.g., MTN, VODAFONE, AT).'),
  phoneNumber: z.string().describe('The mobile money number to withdraw to.'),
});

export const momoWithdrawal = ai.defineFlow(
  {
    name: 'momoWithdrawal',
    inputSchema: MomoWithdrawalInputSchema,
    outputSchema: z.object({
      transactionId: z.string().optional(),
      error: z.string().optional(),
    }),
  },
  async (payload) => {
    try {
      await ai.generate({
        prompt: `You are a helpful AI assistant that helps users withdraw money from their mobile money accounts. You are about to withdraw ${payload.amount} GHS to ${payload.phoneNumber} on the ${payload.network} network. Please confirm that you want to proceed.`,
        config: {
          temperature: 0.5,
        }
      });
      
      let transactionId = '';
      if (payload.network.toUpperCase() === 'MTN') {
        transactionId = await transferFunds({
          amount: payload.amount,
          phoneNumber: payload.phoneNumber,
          network: payload.network,
        });
      } else {
        console.info('Non-MTN network used, simulating withdrawal');
        transactionId = webcrypto.randomUUID();
      }

      return {
        transactionId,
      };
    } catch (error: any) {
      console.error('MoMo Withdrawal Flow Error:', error);
      // Return the error instead of throwing it to avoid Next.js production error masking
      return {
        error: error.message || 'Unknown error occurred during withdrawal processing',
      };
    }
  }
);

/**
 * Server Action wrapper for the MoMo withdrawal flow.
 */
export async function runMomoWithdrawal(payload: z.infer<typeof MomoWithdrawalInputSchema>) {
  return await momoWithdrawal(payload);
}
