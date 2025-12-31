import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import dbConnect from "@/app/lib/db";
import Trade from "@/app/models/Trade";
import { chatModel } from "@/app/lib/ai";

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

export async function POST(req: NextRequest) {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { messages } = await req.json();

        await dbConnect();
        // Fetch recent trades to give context to the assistant
        const trades = await Trade.find({ userId }).sort({ createdAt: -1 }).limit(10);

        const context = trades.length > 0
            ? `Your recent trades for context: ${JSON.stringify(trades.map(t => ({ symbol: t.symbol, pnl: t.pnl, emotion: t.emotion, discipline: t.disciplineScore })))}`
            : "No trades logged yet.";

        const systemPrompt = `You are a professional trading assistant and psychology coach. 
        Your goal is to help the user improve their trading discipline, manage emotions, and analyze their performance.
        ${context}
        Be concise, professional, and empathetic. Use markdown formatting.`;

        // We'll use a simple generative approach for now (not full chat history management in this step, 
        // but we'll prepend the system prompt and context)

        const lastMessage = messages[messages.length - 1];
        const fullPrompt = `${systemPrompt}\n\nUser Question: ${lastMessage.content}`;

        const result = await chatModel.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ content: text.trim() });
    } catch (error: any) {
        console.error("Chat Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process chat" }, { status: 500 });
    }
}
