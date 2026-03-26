'use server';
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {webcrypto} from 'crypto';

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
      input: `You are a helpful AI assistant that helps users withdraw money from their mobile money accounts. You are about to withdraw ${payload.amount} GHS to ${payload.phoneNumber} on the ${payload.network} network. Please confirm that you want to proceed.`,
      temperature: 0.5,
    });
    const transactionId = webcrypto.randomUUID();

    return {
      transactionId,
    };
  }
);
