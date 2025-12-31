import { Trade, AIReplay } from '../types';

export async function getBehavioralInsight(trades: Trade[]): Promise<string> {
    try {
        const response = await fetch('/api/behavior/summary');
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to fetch insight (${response.status})`);
        }
        const data = await response.json();
        return data.insight;
    } catch (error: any) {
        console.error('Error getting behavioral insight:', error);
        return `Thinking about your patterns... (${error.message})`;
    }
}

export async function getWeeklyReport(trades: Trade[]): Promise<string> {
    try {
        const response = await fetch('/api/reports/weekly');
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to fetch weekly report (${response.status})`);
        }
        const data = await response.json();
        return data.report;
    } catch (error: any) {
        console.error('Error getting weekly report:', error);
        return "Setting up your weekly review...";
    }
}

export async function analyzeTrade(trade: Trade): Promise<AIReplay> {
    try {
        const response = await fetch(`/api/replay/${trade.id}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to analyze trade (${response.status})`);
        }
        return await response.json();
    } catch (error: any) {
        console.error('Error analyzing trade:', error);
        throw error;
    }
}

export async function sendChatMessage(messages: any[]): Promise<string> {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages })
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to send message (${response.status})`);
        }
        const data = await response.json();
        return data.content;
    } catch (error: any) {
        console.error('Chat error:', error);
        return `I'm having trouble connecting to the AI: ${error.message}`;
    }
}
