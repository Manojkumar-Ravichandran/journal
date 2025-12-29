import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "../../../lib/db";
import User from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();
  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({}, { status: 401 });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return NextResponse.json({}, { status: 401 });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!);

  const res = NextResponse.json({ success: true });
  res.cookies.set("token", token, { httpOnly: true });

  return res;
}
