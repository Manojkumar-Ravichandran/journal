import mongoose, { Schema, models } from "mongoose";

const TradeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true },
    instrumentType: { type: String, required: true },
    direction: { type: String, required: true },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    pnl: { type: Number, required: true },
    entryTime: { type: String, required: true },
    exitTime: { type: String, required: true },
    entryReason: { type: String, required: true },
    emotion: { type: String, required: true },
    rulesFollowed: { type: [String], default: [] },
    rulesViolated: { type: [String], default: [] },
    disciplineScore: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    notes: String,
    size: Number,
  },
  { timestamps: true }
);

export default models.Trade || mongoose.model("Trade", TradeSchema);
