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
      transactionId: z.string(),
    }),
  },
  async (payload) => {
    await ai.generate({
      prompt: `You are a helpful AI assistant that helps users withdraw money from their mobile money accounts. You are about to withdraw ${payload.amount} GHS to ${payload.phoneNumber} on the ${payload.network} network. Please confirm that you want to proceed.`,
      config: {
        temperature: 0.5,
      }
    });
    let transactionId = '';

    try {
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
    } catch (error: any) {
      console.error('MoMo Withdrawal Flow Error:', error);
      throw new Error(`Failed to process withdrawal: ${error.message || 'Unknown error'}`);
    }

    return {
      transactionId,
    };
  }
);
