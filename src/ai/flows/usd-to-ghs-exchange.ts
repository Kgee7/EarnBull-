'use server';
/**
 * @fileOverview A flow that provides an up-to-date USD to GHS exchange rate.
 *
 * - getUsdToGhsExchangeRate - A function that returns the current USD to GHS exchange rate.
 * - UsdToGhsExchangeRateOutput - The return type for the getUsdToGhsExchangeRate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UsdToGhsExchangeRateOutputSchema = z.object({
  exchangeRate: z.number().describe('The current USD to GHS exchange rate.'),
  isUpToDate: z.boolean().describe('Whether the exchange rate is up-to-date.'),
});
export type UsdToGhsExchangeRateOutput = z.infer<typeof UsdToGhsExchangeRateOutputSchema>;

export async function getUsdToGhsExchangeRate(): Promise<UsdToGhsExchangeRateOutput> {
  return usdToGhsExchangeRateFlow();
}

const usdToGhsExchangeRateFlow = ai.defineFlow(
  {
    name: 'usdToGhsExchangeRateFlow',
    outputSchema: UsdToGhsExchangeRateOutputSchema,
  },
  async () => {
    // This is a placeholder implementation.
    // In a real application, you would fetch the exchange rate from a reliable API.
    // For demonstration purposes, we return a fixed value and indicate that it might not be up-to-date.
    const exchangeRate = 12.5;
    const isUpToDate = false;

    return {
      exchangeRate,
      isUpToDate,
    };
  }
);
