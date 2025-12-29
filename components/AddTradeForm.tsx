"use client";

import React, { useState, useRef } from 'react';
import { Emotion, InstrumentType, TradeDirection } from '@/app/types';
import { saveTrade } from '@/app/services/mockDataService';

const AddTradeForm: React.FC<{ onComplete: () => void, onCancel: () => void }> = ({ onComplete, onCancel }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        symbol: '',
        instrumentType: InstrumentType.EQUITY,
        direction: TradeDirection.LONG,
        entryPrice: '',
        exitPrice: '',
        quantity: '',
        entryReason: '',
        emotion: Emotion.CALM,
        rulesFollowed: [] as string[],
        rulesViolated: [] as string[],
        images: [] as string[]
    });

    const availableRules = [
        "Wait for candle close",
        "Stop loss defined before entry",
        "Max 2% risk per trade",
        "Trade during high volatility",
        "Confluence of 2+ indicators"
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, reader.result as string]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const entryPriceNum = parseFloat(formData.entryPrice) || 0;
        const exitPriceNum = parseFloat(formData.exitPrice) || 0;
        const quantityNum = parseFloat(formData.quantity) || 0;

        const pnl = formData.direction === TradeDirection.LONG
            ? (exitPriceNum - entryPriceNum) * quantityNum
            : (entryPriceNum - exitPriceNum) * quantityNum;

        try {
            await saveTrade({
                symbol: formData.symbol,
                instrumentType: formData.instrumentType,
                direction: formData.direction,
                entryPrice: entryPriceNum,
                exitPrice: exitPriceNum,
                quantity: quantityNum,
                pnl,
                entryTime: new Date().toISOString(),
                exitTime: new Date().toISOString(),
                entryReason: formData.entryReason,
                emotion: formData.emotion,
                rulesFollowed: formData.rulesFollowed,
                rulesViolated: formData.rulesViolated,
                images: formData.images,
                disciplineScore: Math.max(0, 100 - (formData.rulesViolated.length * 20))
            });
            onComplete();
        } catch (error) {
            console.error("Failed to save trade:", error);
            alert("Failed to save trade. Please try again.");
        }
    };

    const toggleRule = (rule: string, list: 'followed' | 'violated') => {
        const key = list === 'followed' ? 'rulesFollowed' : 'rulesViolated';
        const otherKey = list === 'followed' ? 'rulesViolated' : 'rulesFollowed';

        setFormData(prev => ({
            ...prev,
            [key]: prev[key].includes(rule) ? prev[key].filter(r => r !== rule) : [...prev[key], rule],
            [otherKey]: prev[otherKey].filter(r => r !== rule)
        }));
    };

    return (
        <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Core Details */}
                <section className="bg-background border border-border p-6 rounded-2xl space-y-4">
                    <h3 className="font-bold text-primary flex items-center gap-2">
                        <span>📈</span> Trade Execution
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 col-span-2 md:col-span-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Symbol</label>
                            <input
                                required
                                className="w-full bg-card border border-border p-3 rounded-xl focus:border-primary outline-none transition-all text-foreground text-sm"
                                placeholder="e.g. AAPL, BTC/USD"
                                value={formData.symbol}
                                onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1 col-span-2 md:col-span-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Direction</label>
                            <div className="flex bg-card p-1 rounded-xl border border-border">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, direction: TradeDirection.LONG })}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.direction === TradeDirection.LONG ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Long
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, direction: TradeDirection.SHORT })}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.direction === TradeDirection.SHORT ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Short
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Entry Price</label>
                            <input
                                required
                                type="number" step="any"
                                className="w-full bg-card border border-border p-3 rounded-xl focus:border-primary outline-none transition-all text-foreground text-sm"
                                placeholder="0.00"
                                value={formData.entryPrice}
                                onChange={e => setFormData({ ...formData, entryPrice: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Exit Price</label>
                            <input
                                required
                                type="number" step="any"
                                className="w-full bg-card border border-border p-3 rounded-xl focus:border-primary outline-none transition-all text-foreground text-sm"
                                placeholder="0.00"
                                value={formData.exitPrice}
                                onChange={e => setFormData({ ...formData, exitPrice: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1 col-span-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Quantity</label>
                            <input
                                required
                                type="number" step="any"
                                className="w-full bg-card border border-border p-3 rounded-xl focus:border-primary outline-none transition-all text-foreground text-sm"
                                placeholder="0"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                            />
                        </div>
                    </div>
                </section>

                {/* Trade Evidence (Images) */}
                <section className="bg-background border border-border p-6 rounded-2xl space-y-4">
                    <h3 className="font-bold text-primary flex items-center gap-2">
                        <span>🖼️</span> Attached Evidence
                    </h3>
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-4">
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >✕</button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-20 h-20 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                            >
                                <span className="text-xl text-muted-foreground group-hover:text-primary">+</span>
                                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Upload</span>
                            </button>
                        </div>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <p className="text-[10px] text-muted-foreground font-medium italic">Attach screenshots of your entry setup or order window.</p>
                    </div>
                </section>

                {/* Psychological Context */}
                <section className="bg-background border border-border p-6 rounded-2xl space-y-4">
                    <h3 className="font-bold text-primary flex items-center gap-2">
                        <span>🧠</span> The Psychology
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Main Emotion Entering Trade</label>
                            <div className="flex flex-wrap gap-2">
                                {Object.values(Emotion).map(emotion => (
                                    <button
                                        key={emotion}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, emotion })}
                                        className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${formData.emotion === emotion
                                            ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20'
                                            : 'bg-card border-border text-muted-foreground hover:border-border/50'
                                            }`}
                                    >
                                        {emotion}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Why did you enter this trade?</label>
                            <textarea
                                required
                                rows={3}
                                className="w-full bg-card border border-border p-4 rounded-xl focus:border-primary outline-none transition-all resize-none text-xs italic text-foreground"
                                placeholder="Describe your confluence, market structure, or indicators..."
                                value={formData.entryReason}
                                onChange={e => setFormData({ ...formData, entryReason: e.target.value })}
                            />
                        </div>
                    </div>
                </section>

                {/* Rules Checklist */}
                <section className="bg-background border border-border p-6 rounded-2xl space-y-4">
                    <h3 className="font-bold text-primary flex items-center gap-2">
                        <span>📜</span> Discipline Audit
                    </h3>
                    <div className="space-y-3">
                        {availableRules.map(rule => (
                            <div key={rule} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border group hover:border-border/50 transition-all">
                                <span className="text-xs font-medium text-foreground">{rule}</span>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => toggleRule(rule, 'followed')}
                                        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${formData.rulesFollowed.includes(rule) ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10'}`}
                                    >✓</button>
                                    <button
                                        type="button"
                                        onClick={() => toggleRule(rule, 'violated')}
                                        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${formData.rulesViolated.includes(rule) ? 'bg-red-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10'}`}
                                    >✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 bg-muted hover:bg-muted/80 text-muted-foreground py-3.5 rounded-2xl font-black text-sm transition-all border border-border"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 bg-primary hover:opacity-90 text-primary-foreground py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-primary/20 active:scale-95"
                    >
                        Log Trade & Get Score
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddTradeForm;
