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

export async function GET(
    req: NextRequest,
    { params }: { params: { tradeId: string } }
) {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { tradeId } = params;

    await dbConnect();
    try {
        const trade = await Trade.findOne({ _id: tradeId, userId });
        if (!trade) return NextResponse.json({ error: "Trade not found" }, { status: 404 });

        const prompt = `Act as an expert trading coach. Analyze this specific trade and provide a detailed review.
        
        Trade Details:
        - Symbol: ${trade.symbol}
        - Direction: ${trade.direction}
        - Entry Price: ${trade.entryPrice}
        - Exit Price: ${trade.exitPrice}
        - PnL: ${trade.pnl}
        - Emotion: ${trade.emotion}
        - Rules Followed: ${trade.rulesFollowed?.join(", ") || "None"}
        - Rules Violated: ${trade.rulesViolated?.join(", ") || "None"}
        - Notes: ${trade.notes || "None"}
        
        Provide the response in the following JSON format:
        {
          "aiSummary": "A brief overall summary of the trade execution",
          "missedOpportunity": "Something the trader could have done better",
          "betterEntry": "Suggestion for a better entry level (hypothetical)",
          "betterExit": "Suggestion for a better exit level (hypothetical)",
          "disciplineScore": 0-100 number,
          "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
        }
        
        Return ONLY the JSON.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawText = response.text();
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        const text = jsonMatch ? jsonMatch[0] : rawText;

        const analysis = JSON.parse(text);
        return NextResponse.json({ ...analysis, tradeId });
    } catch (error: any) {
        console.error("Trade Analysis Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to analyze trade" },
            { status: 500 }
        );
    }
}
