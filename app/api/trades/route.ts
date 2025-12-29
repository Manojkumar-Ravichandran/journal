import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import dbConnect from "@/app/lib/db";
import Trade from "@/app/models/Trade";

async function getUserId() {
    const token = await cookies().then((c) => c.get("token")?.value);
    if (!token) return null;
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

export async function GET() {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    try {
        const trades = await Trade.find({ userId }).sort({ createdAt: -1 });
        return NextResponse.json(trades);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch trades" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const data = await req.json();
        await dbConnect();

        const newTrade = new Trade({
            ...data,
            userId,
        });

        await newTrade.save();
        return NextResponse.json(newTrade, { status: 201 });
    } catch (error) {
        console.error("Error saving trade:", error);
        return NextResponse.json({ error: "Failed to save trade" }, { status: 500 });
    }
}
