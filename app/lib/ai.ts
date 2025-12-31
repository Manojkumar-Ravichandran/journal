import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not defined in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Using gemini-flash-latest which is verified to work with this account
export const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export const chatModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
