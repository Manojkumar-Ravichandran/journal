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
        if (!token) {
            console.log("No auth token found in cookies");
            return null;
        }
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        return decoded.userId;
    } catch (error) {
        console.error("Auth Error in getUserId:", error);
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
        const trades = await Trade.find({ userId }).sort({ createdAt: -1 }).limit(20);

        if (trades.length === 0) {
            return NextResponse.json({ insight: "Start logging trades to receive personalized behavioral insights." });
        }

        const tradeSummary = trades.map(t => ({
            symbol: t.symbol,
            pnl: t.pnl,
            emotion: t.emotion,
            disciplineScore: t.disciplineScore,
            rulesViolated: t.rulesViolated
        }));

        const prompt = `Analyze these recent trading logs and provide a single, concise behavioral insight (1-2 sentences) for the trader. Be encouraging but direct.
        
        Recent Trades:
        ${JSON.stringify(tradeSummary, null, 2)}
        
        Return only the insight text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ insight: text.trim() });
    } catch (error: any) {
        console.error("AI Insight Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate AI insight" },
            { status: 500 }
        );
    }
}
