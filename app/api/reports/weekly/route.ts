import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import dbConnect from "@/app/lib/db";
import Trade from "@/app/models/Trade";
import { model } from "@/app/lib/ai";

async function getUserId() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return null;
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

export async function GET() {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    try {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const trades = await Trade.find({
            userId,
            createdAt: { $gte: weekAgo }
        }).sort({ createdAt: 1 });

        if (trades.length === 0) {
            return NextResponse.json({ report: "No trades logged this week. Start trading to see your report!" });
        }

        const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
        const winRate = (trades.filter(t => t.pnl > 0).length / trades.length) * 100;

        const summary = trades.map(t => ({
            symbol: t.symbol,
            pnl: t.pnl,
            emotion: t.emotion,
            discipline: t.disciplineScore
        }));

        const prompt = `Generate a weekly trading performance report based on these logs. 
        Total PnL: $${totalPnL.toFixed(2)}
        Win Rate: ${winRate.toFixed(1)}%
        
        Trades:
        ${JSON.stringify(summary, null, 2)}
        
        The report should highlight:
        1. Overall performance summary.
        2. Psychological patterns (emotions).
        3. Discipline trends.
        4. Areas for improvement next week.
        
        Keep it professional, analytical, and supportive. Use markdown formatting.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ report: text.trim() });
    } catch (error: any) {
        console.error("Weekly Report Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate weekly report" },
            { status: 500 }
        );
    }
}
