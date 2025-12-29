import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import User from "../../../models/User";
import dbConnect from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const token = await cookies().then((cookies) => cookies.get("token")?.value);
  if (!token) return NextResponse.json({}, { status: 401 });

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
  await dbConnect();

  const user = await User.findById(decoded.userId).select("-password");
  return NextResponse.json({ user });
}
