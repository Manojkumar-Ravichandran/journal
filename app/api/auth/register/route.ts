import bcrypt from "bcryptjs";
import dbConnect from "../../../lib/db";
import User from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();
  const { name, email, password } = await req.json();

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashed });

  return NextResponse.json({ success: true });
}
