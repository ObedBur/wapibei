// Centralized exchange rate constants
export const EXCHANGE_RATE_USD_TO_FC = 2800;
export const CURRENCY_SYMBOLS = {
    USD: '$',
    FC: 'FC',
} as const;
export type Currency = keyof typeof CURRENCY_SYMBOLS;

/**
 * Convertit un prix d'une devise à une autre
 */
export function convertPrice(amount: number, from: Currency, to: Currency): number {
    if (from === to) return amount;
    if (from === 'USD' && to === 'FC') return amount * EXCHANGE_RATE_USD_TO_FC;
    if (from === 'FC' && to === 'USD') return amount / EXCHANGE_RATE_USD_TO_FC;
    return amount;
}

/**
 * Formate un prix avec le symbole de devise
 */
export function formatPrice(amount: number, currency: Currency): string {
    const symbol = CURRENCY_SYMBOLS[currency];
    return `${amount.toLocaleString()} ${symbol}`;
}
