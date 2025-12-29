import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import dbConnect from "@/app/lib/db";
import Trade from "@/app/models/Trade";
import mongoose from "mongoose";

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

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid Trade ID format" }, { status: 400 });
    }

    await dbConnect();
    try {
        const trade = await Trade.findOne({ _id: id, userId });
        if (!trade) {
            return NextResponse.json({ error: "Trade not found in database" }, { status: 404 });
        }
        return NextResponse.json(trade);
    } catch (error: any) {
        console.error("Database error in getTradeById:", error);
        return NextResponse.json({
            error: "Internal server error while fetching trade",
            details: error.message
        }, { status: 500 });
    }
}
