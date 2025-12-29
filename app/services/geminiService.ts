import { Trade, Emotion, AIReplay } from '../types';

export async function getBehavioralInsight(trades: Trade[]): Promise<string> {
    // Mock implementation - can be replaced with actual Gemini API call
    if (trades.length === 0) {
        return "Start logging trades to receive personalized behavioral insights.";
    }

    const avgDiscipline = trades.reduce((sum, t) => sum + t.disciplineScore, 0) / trades.length;
    const emotionCounts = trades.reduce((acc, t) => {
        acc[t.emotion] = (acc[t.emotion] || 0) + 1;
        return acc;
    }, {} as Record<Emotion, number>);

    const dominantEmotion = Object.entries(emotionCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] as Emotion;

    const winRate = (trades.filter(t => t.pnl > 0).length / trades.length) * 100;

    // Generate insight based on data
    const insights = [
        avgDiscipline > 80
            ? "You're maintaining excellent discipline. Keep following your system!"
            : avgDiscipline > 60
                ? "Your discipline is improving. Focus on sticking to your rules during high-emotion trades."
                : "Discipline needs work. Consider reducing position sizes until you can consistently follow your plan.",

        dominantEmotion === Emotion.CALM
            ? "You trade best when calm. Try to recreate these conditions more often."
            : dominantEmotion === Emotion.FOMO
                ? "FOMO is your biggest challenge. Set strict entry criteria and stick to them."
                : dominantEmotion === Emotion.REVENGE
                    ? "Revenge trading is destroying your results. Take mandatory breaks after losses."
                    : dominantEmotion === Emotion.CONFIDENT
                        ? "Confidence is good, but don't let it turn into overconfidence."
                        : "Anxiety is affecting your trades. Consider smaller positions to reduce stress.",

        winRate > 60
            ? `Strong ${winRate.toFixed(0)}% win rate. Focus on letting winners run.`
            : winRate > 40
                ? `${winRate.toFixed(0)}% win rate is decent. Work on cutting losses faster.`
                : `${winRate.toFixed(0)}% win rate needs improvement. Review your edge and risk management.`
    ];

    // Simulate async delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return insights[Math.floor(Math.random() * insights.length)];
}

export async function getWeeklyReport(trades: Trade[]): Promise<string> {
    // Can be expanded for weekly behavioral reports
    const weekTrades = trades.filter(t => {
        const tradeDate = new Date(t.createdAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return tradeDate > weekAgo;
    });

    const totalPnL = weekTrades.reduce((sum, t) => sum + t.pnl, 0);

    return `This week: ${weekTrades.length} trades, $${totalPnL.toFixed(2)} P&L`;
}

export async function analyzeTrade(trade: Trade): Promise<AIReplay> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const win = trade.pnl > 0;
    const rulesFollowedCount = trade.rulesFollowed.length;
    const rulesViolatedCount = trade.rulesViolated.length;

    let summary = "";
    if (win && rulesViolatedCount === 0) {
        summary = "Excellent execution. You followed your plan perfectly and the market rewarded you. This is the 'Golden Standard' of your trading.";
    } else if (win && rulesViolatedCount > 0) {
        summary = "You made money, but you broke your rules. This is a 'bad win' which can lead to dangerous habits. Be careful!";
    } else if (!win && rulesViolatedCount === 0) {
        summary = "A 'good loss'. You followed your plan but the trade didn't work out. This is a natural part of trading. Maintain this discipline.";
    } else {
        summary = "A 'bad loss'. You broke your rules and lost money. You need to reset and figure out why you bypassed your safeguards.";
    }

    return {
        tradeId: trade.id,
        aiSummary: summary,
        missedOpportunity: "Considered waiting for a deeper pullback for an even better R:R.",
        betterEntry: `$${(trade.entryPrice * 0.995).toFixed(2)}`,
        betterExit: `$${(trade.exitPrice * 1.01).toFixed(2)}`,
        disciplineScore: Math.max(0, 100 - (rulesViolatedCount * 20)),
        suggestions: [
            "Review your entry checklist before every click.",
            "Mandatory 5-minute cooldown after any rule violation.",
            "Record a voice note about your emotions next time."
        ]
    };
}
