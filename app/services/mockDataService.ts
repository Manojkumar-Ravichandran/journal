import { Trade, Emotion, TradeDirection, InstrumentType } from '../types';

export async function getTrades(): Promise<Trade[]> {
    try {
        const response = await fetch('/api/trades');
        if (!response.ok) throw new Error('Failed to fetch trades');
        const data = await response.json();
        return data.map((t: any) => ({ ...t, id: t._id }));
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getTradeById(id: string): Promise<Trade | undefined> {
    try {
        const response = await fetch(`/api/trades/${id}`);
        if (!response.ok) throw new Error(`Failed to fetch trade: ${response.status}`);
        const data = await response.json();
        return { ...data, id: data._id };
    } catch (error) {
        console.error(error);
        return undefined;
    }
}

export async function addTrade(trade: Omit<Trade, 'id' | 'createdAt'>): Promise<Trade> {
    const response = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trade),
    });
    if (!response.ok) throw new Error('Failed to add trade');
    const data = await response.json();
    return { ...data, id: data._id };
}

export const saveTrade = addTrade;
