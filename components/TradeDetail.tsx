"use client";

import React, { useEffect, useState } from 'react';
import { Trade, AIReplay } from '@/app/types';
import { getTradeById } from '@/app/services/mockDataService';
import { analyzeTrade } from '@/app/services/geminiService';

const TradeDetail: React.FC<{ tradeId: string, onBack: () => void }> = ({ tradeId, onBack }) => {
    const [trade, setTrade] = useState<Trade | null>(null);
    const [replay, setReplay] = useState<AIReplay | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedImg, setSelectedImg] = useState<string | null>(null);

    useEffect(() => {
        const fetchTrade = async () => {
            const t = await getTradeById(tradeId);
            if (t) {
                setTrade(t);
            }
        };
        fetchTrade();
    }, [tradeId]);

    const runAIAnalysis = async () => {
        if (!trade) return;
        setLoading(true);
        try {
            const result = await analyzeTrade(trade);
            setReplay(result);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (!trade) return (
        <div className="p-20 text-center animate-in fade-in duration-500">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">Loading Trade Data...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in slide-in-from-right duration-700 pb-20">
            <header className="flex flex-col md:flex-row md:items-center gap-6 bg-card border border-border p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-32 -translate-y-32"></div>

                <button onClick={onBack} className="w-12 h-12 flex items-center justify-center hover:bg-muted rounded-2xl transition-all border border-border text-foreground shadow-lg active:scale-90">←</button>

                <div className="relative z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-5xl font-black text-foreground tracking-tight">{trade.symbol}</h2>
                        <span className={`px-4 py-1 rounded-xl text-xs font-black uppercase tracking-widest border ${trade.direction === 'Long' ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}>
                            {trade.direction}
                        </span>
                    </div>
                    <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                        <span className="text-primary">#</span> {trade.id.toUpperCase()}
                        <span className="w-1 h-1 bg-border rounded-full"></span>
                        {new Date(trade.createdAt).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="md:ml-auto text-right relative z-10">
                    <p className={`text-5xl font-black font-mono tracking-tighter ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trade.pnl >= 0 ? '+' : '−'}${Math.abs(trade.pnl).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mt-1">Net Performance</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Visual/Timeline */}
                    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden aspect-video relative group shadow-2xl border-b-4 border-b-primary/30">
                        <img src={trade.images && trade.images.length > 0 ? trade.images[0] : `https://images.unsplash.com/photo-1611974717424-36244769d18a?q=80&w=2070&auto=format&fit=crop`} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-all duration-1000 scale-105 group-hover:scale-100" alt="Trade Chart" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
                        <div className="absolute bottom-8 left-8 flex items-center gap-4">
                            <span className="bg-background/80 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-black text-muted-foreground border border-border uppercase tracking-[0.2em] shadow-2xl">Visual Summary</span>
                            {trade.images && trade.images.length > 1 && (
                                <span className="bg-primary px-4 py-2 rounded-2xl text-[10px] font-black text-primary-foreground uppercase tracking-[0.2em] shadow-xl shadow-primary/20">+{trade.images.length - 1} Perspective{trade.images.length > 2 ? 's' : ''}</span>
                            )}
                        </div>
                    </div>

                    {/* Evidence Gallery */}
                    {trade.images && trade.images.length > 0 && (
                        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl">
                            <h3 className="text-xl font-black text-foreground mb-6 flex items-center gap-3 tracking-tight">
                                <span className="p-2 bg-primary/10 rounded-xl">🖼️</span> Visual Proof
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {trade.images.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="aspect-square rounded-[1.5rem] overflow-hidden border border-border hover:border-primary/50 cursor-pointer transition-all duration-300 shadow-lg group"
                                        onClick={() => setSelectedImg(img)}
                                    >
                                        <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={`evidence-${idx}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Trade Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Entry Price', value: `$${trade.entryPrice.toLocaleString()}`, color: 'border-b-blue-500/30' },
                            { label: 'Exit Price', value: `$${trade.exitPrice.toLocaleString()}`, color: 'border-b-purple-500/30' },
                            { label: 'Units', value: `${trade.quantity.toLocaleString()}`, color: 'border-b-teal-500/30' },
                            { label: 'Score', value: `${trade.disciplineScore}`, color: 'border-b-primary/30' },
                        ].map(item => (
                            <div key={item.label} className={`bg-card border border-border p-6 rounded-[2rem] shadow-xl border-b-4 ${item.color} group hover:-translate-y-1 transition-all duration-300`}>
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-2">{item.label}</p>
                                <p className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Trade Log */}
                    <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden">
                        <h3 className="text-2xl font-black text-foreground mb-8 tracking-tight">Strategic Context</h3>
                        <div className="p-8 bg-background/80 border border-border rounded-3xl shadow-inner relative italic">
                            <span className="absolute -top-4 -left-2 text-6xl text-primary/20 font-serif">"</span>
                            <p className="text-foreground leading-relaxed text-xl relative z-10">
                                {trade.entryReason}
                            </p>
                            <span className="absolute -bottom-10 -right-2 text-6xl text-primary/20 font-serif rotate-180">"</span>
                        </div>

                        <div className="mt-12 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em]">Decision Timeline</p>
                            </div>
                            <div className="relative pl-4 space-y-12 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                                <div className="relative pl-10 group">
                                    <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-border border-2 border-border group-hover:bg-primary transition-colors"></div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Pre-Execution</p>
                                    <p className="text-lg font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">Setup Recognition</p>
                                    <p className="text-sm text-muted-foreground mt-2 font-medium">All parameters aligned with the {trade.instrumentType.toLowerCase()} ruleset.</p>
                                </div>
                                <div className="relative pl-10 group">
                                    <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{new Date(trade.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p className="text-lg font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">Position Entry</p>
                                    <p className="text-sm text-muted-foreground mt-2 font-medium">Filled {trade.quantity} @ ${trade.entryPrice.toLocaleString()}</p>
                                </div>
                                <div className="relative pl-10 group">
                                    <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{new Date(trade.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p className="text-lg font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">Exit Finalized</p>
                                    <p className="text-sm text-muted-foreground mt-2 font-medium">Closed @ ${trade.exitPrice.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Insights */}
                <div className="space-y-8">
                    {/* AI Decision Replay */}
                    <div className="bg-primary/5 border border-primary/20 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border-t-4 border-t-primary/30">
                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/10 blur-3xl rounded-full group-hover:bg-primary/20 transition-all duration-700"></div>

                        <div className="flex items-center gap-4 mb-8">
                            <span className="text-3xl p-3 bg-primary/20 rounded-[1.25rem] shadow-inner">🤖</span>
                            <div>
                                <h3 className="font-black text-foreground text-xl uppercase tracking-tight">AI Replay</h3>
                                <p className="text-[10px] text-primary font-black uppercase tracking-widest">Powered by Gemini</p>
                            </div>
                        </div>

                        {!replay ? (
                            <div className="text-center py-6">
                                <p className="text-sm text-muted-foreground mb-8 leading-relaxed font-medium">Let Gemini analyze your psychological state and decision quality based on this log.</p>
                                <button
                                    onClick={runAIAnalysis}
                                    disabled={loading}
                                    className="w-full bg-primary hover:opacity-90 text-primary-foreground py-5 rounded-2xl font-black transition-all disabled:opacity-50 shadow-xl shadow-primary/30 active:scale-95 text-sm uppercase tracking-widest"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Analyzing...
                                        </span>
                                    ) : 'Execute Analysis'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                                <div className="bg-background/80 p-6 rounded-3xl border border-primary/20 shadow-inner relative">
                                    <div className="absolute -top-2 left-6 px-3 py-1 bg-primary text-[8px] font-black rounded-full uppercase tracking-widest">Insight</div>
                                    <p className="text-md text-foreground leading-relaxed italic font-medium">"{replay.aiSummary}"</p>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em] mb-4">Strategic Lessons</p>
                                    <div className="space-y-3">
                                        {replay.suggestions.map((s, idx) => (
                                            <div key={idx} className="text-xs text-foreground flex gap-4 p-4 bg-card/50 rounded-2xl border border-border group hover:border-primary/30 transition-all cursor-default shadow-sm font-medium">
                                                <span className="text-primary font-black">0{idx + 1}</span>
                                                <span className="flex-1">{s}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-border">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Execution Score</span>
                                        <span className="font-mono font-black text-2xl text-primary">{replay.disciplineScore}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-background rounded-full overflow-hidden shadow-inner p-0.5 border border-border">
                                        <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.3)]" style={{ width: `${replay.disciplineScore}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rules Audit */}
                    <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                        <h3 className="text-xl font-black mb-8 text-foreground uppercase tracking-tight">Discipline Audit</h3>
                        <div className="space-y-4 relative z-10">
                            {trade.rulesFollowed.map(rule => (
                                <div key={rule} className="flex items-center gap-4 p-5 bg-green-500/5 border border-green-500/10 rounded-2xl group hover:border-green-500/30 transition-all duration-300">
                                    <div className="w-8 h-8 flex items-center justify-center bg-green-500/20 text-green-500 rounded-xl text-sm font-black shadow-inner group-hover:scale-110 transition-transform">✓</div>
                                    <span className="text-sm text-foreground font-bold uppercase tracking-tight">{rule}</span>
                                </div>
                            ))}
                            {trade.rulesViolated.map(rule => (
                                <div key={rule} className="flex items-center gap-4 p-5 bg-red-500/5 border border-red-500/10 rounded-2xl group hover:border-red-500/30 transition-all duration-300">
                                    <div className="w-8 h-8 flex items-center justify-center bg-red-500/20 text-red-500 rounded-xl text-sm font-black shadow-inner group-hover:scale-110 transition-transform">!</div>
                                    <span className="text-sm text-foreground font-bold uppercase tracking-tight">{rule}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mental State */}
                    <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-xl">
                        <h3 className="text-xl font-black mb-8 text-foreground uppercase tracking-tight">Psychological Frame</h3>
                        <div className="flex flex-wrap gap-3">
                            <div className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                                {trade.emotion}
                            </div>
                            <div className="px-5 py-3 rounded-2xl bg-muted border border-border text-muted-foreground text-[10px] font-black uppercase tracking-widest">Cold Focus</div>
                            <div className="px-5 py-3 rounded-2xl bg-muted border border-border text-muted-foreground text-[10px] font-black uppercase tracking-widest">Rules-Driven</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {selectedImg && (
                <div
                    className="fixed inset-0 z-[110] bg-background/95 flex items-center justify-center p-8 backdrop-blur-xl animate-in fade-in duration-500"
                    onClick={() => setSelectedImg(null)}
                >
                    <button className="absolute top-8 right-8 text-muted-foreground hover:text-foreground text-5xl transition-colors active:scale-90">✕</button>
                    <img src={selectedImg} className="max-w-full max-h-full object-contain rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-border zoom-in animate-in duration-500" alt="Lightbox" />
                </div>
            )}
        </div>
    );
};

export default TradeDetail;
