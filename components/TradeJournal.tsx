"use client";

import React, { useEffect, useState } from 'react';
import { Trade } from '@/app/types';
import { getTrades } from '@/app/services/mockDataService';

const TradeJournal: React.FC<{ onSelectTrade: (id: string) => void }> = ({ onSelectTrade }) => {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchTrades = async () => {
            const data = await getTrades();
            setTrades(data);
        };
        fetchTrades();
    }, []);

    const filteredTrades = trades.filter(t =>
        t.symbol.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/50 p-6 rounded-[2rem] border border-border shadow-xl">
                <div>
                    <h2 className="text-3xl font-black text-white">Trading Journal</h2>
                    <p className="text-muted-foreground text-sm font-medium">Reflect on every execution to achieve mastery.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search ticker..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 md:w-64 bg-background border border-border px-5 py-3 rounded-2xl text-sm focus:outline-none focus:border-primary transition-all text-foreground shadow-inner"
                    />
                    <button className="bg-primary text-primary-foreground p-3 rounded-2xl hover:opacity-90 shadow-lg shadow-primary/20">🔍</button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrades.map((trade) => (
                    <div
                        key={trade.id}
                        onClick={() => onSelectTrade(trade.id)}
                        className="group bg-card border border-border p-6 rounded-[2rem] hover:border-primary/50 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden flex flex-col h-full"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-primary/10 transition-all duration-700"></div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-2xl font-black text-foreground">{trade.symbol}</h3>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-widest ${trade.direction === 'Long' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                        {trade.direction}
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">{new Date(trade.createdAt).toLocaleDateString()} • {new Date(trade.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-xl font-mono font-black ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {trade.pnl >= 0 ? '+' : '−'}${Math.abs(trade.pnl).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                                <div className="flex items-center justify-end gap-1 mt-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${trade.disciplineScore > 80 ? 'bg-green-500' : trade.disciplineScore > 50 ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.15em]">Score: {trade.disciplineScore}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto space-y-4 relative z-10">
                            <div className="p-4 bg-background/80 rounded-2xl border border-border shadow-inner">
                                <p className="text-sm text-muted-foreground italic font-medium line-clamp-2 leading-relaxed">"{trade.entryReason}"</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1.5 bg-muted rounded-xl text-[10px] font-black text-muted-foreground flex items-center gap-1.5 border border-border uppercase tracking-widest">
                                    <span className="text-sm">🧘</span> {trade.emotion}
                                </span>
                                {trade.rulesViolated.length > 0 && (
                                    <span className="px-3 py-1.5 bg-red-950/30 border border-red-500/20 rounded-xl text-[10px] font-black text-red-400 uppercase tracking-widest">
                                        ⚠️ {trade.rulesViolated.length} Violations
                                    </span>
                                )}
                                {trade.rulesFollowed.length > 0 && (
                                    <span className="px-3 py-1.5 bg-green-950/30 border border-green-500/20 rounded-xl text-[10px] font-black text-green-400 uppercase tracking-widest">
                                        ✅ {trade.rulesFollowed.length} Rules
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TradeJournal;
