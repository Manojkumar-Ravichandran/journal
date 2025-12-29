"use client";
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Trade, Emotion } from '../types';
import { getTrades } from '../services/mockDataService';
import { getBehavioralInsight } from '../services/geminiService';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import AddTradeForm from '@/components/AddTradeForm';

export default function Dashboard() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [insight, setInsight] = useState<string>("Analyzing your performance...");
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadTrades = async () => {
    const data = await getTrades();
    setTrades([...data]); // Use spread to force re-render if needed
    getBehavioralInsight(data).then(setInsight);
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    loadTrades();
  }, [user, loading, router]);

  const onLogTrade = () => {
    setIsModalOpen(true);
  };

  const handleTradeComplete = () => {
    setIsModalOpen(false);
    loadTrades();
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  const disciplineScore = trades.length > 0
    ? Math.round(trades.reduce((acc, t) => acc + t.disciplineScore, 0) / trades.length)
    : 0;

  const emotionData = Object.values(Emotion).map(emotion => ({
    name: emotion,
    value: trades.filter(t => t.emotion === emotion).length
  })).filter(d => d.value > 0);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const recentTrades = trades.slice(0, 5);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-8 animate-in transition-colors duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-foreground">Welcome, {user?.name.split(' ')[0]}</h2>
          <p className="text-muted-foreground mt-1 font-medium">{today}</p>
        </div>
        <button
          onClick={onLogTrade}
          className="bg-primary hover:opacity-90 text-primary-foreground px-8 py-3.5 rounded-2xl font-black transition-all shadow-xl shadow-primary/30 active:scale-95 group flex items-center gap-2"
        >
          <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span>
          Log New Trade
        </button>
      </header>

      {/* AI Insight Card */}
      <div className="bg-primary/10 border border-primary/20 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-primary/20 transition-all duration-700"></div>
        <div className="p-4 bg-primary/20 rounded-2xl text-primary text-3xl shadow-inner">🧠</div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <h3 className="font-black text-primary text-lg">AI Behavior Signal</h3>
            <span className="text-[10px] bg-accent px-2 py-0.5 rounded-full text-accent-foreground font-black uppercase tracking-widest">Real-time</span>
          </div>
          <p className="text-muted-foreground mt-2 text-lg italic leading-snug">"{insight}"</p>
        </div>
        <button className="bg-muted hover:bg-muted/80 px-6 py-2.5 rounded-xl text-sm font-bold text-foreground border border-border transition-all">Deep Dive</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Discipline Score */}
        <div className="bg-card border border-border p-8 rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Discipline Score</h4>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">📈</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="absolute w-full h-full -rotate-90">
                <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/50" />
                <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={502} strokeDashoffset={502 - (502 * disciplineScore / 100)} className="text-primary transition-all duration-1000 ease-out" strokeLinecap="round" />
              </svg>
              <div className="text-center z-10">
                <span className="text-6xl font-black text-foreground">{disciplineScore}</span>
                <span className="text-xl text-muted-foreground font-bold block">Points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Mistakes */}
        <div className="bg-card border border-border p-8 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Recurrent Friction</h4>
            <span className="bg-red-500/10 px-2 py-1 rounded text-[10px] text-red-500 font-black tracking-widest uppercase">Action Items</span>
          </div>
          <div className="space-y-4">
            {[
              { id: 1, label: 'Moved Stop Loss', count: 5, color: 'text-orange-400' },
              { id: 2, label: 'Chasing Price', count: 3, color: 'text-red-400' },
              { id: 3, label: 'Oversizing', count: 2, color: 'text-purple-400' },
            ].map(m => (
              <div key={m.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50 group hover:border-accent transition-all cursor-default">
                <div className="flex items-center gap-4">
                  <span className={`text-xl ${m.color}`}>⚡</span>
                  <span className="font-bold text-foreground">{m.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-foreground">{m.count}x</span>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Incident</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emotion Analysis */}
        <div className="bg-card border border-border p-8 rounded-3xl flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Psych Profile</h4>
            <span className="text-[10px] text-muted-foreground bg-muted px-3 py-1 rounded-full font-bold uppercase tracking-widest">{trades.length} Logs</span>
          </div>
          <div className="flex-1 min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={emotionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {emotionData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 p-2 bg-muted/30 rounded-xl border border-border/50">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <span className="text-[10px] font-black uppercase tracking-tight text-muted-foreground">{d.name}</span>
                <span className="ml-auto text-[10px] font-black text-foreground">{Math.round(d.value / trades.length * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Trades Table */}
      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5">
        <div className="p-8 border-b border-border flex justify-between items-center bg-muted/50">
          <h3 className="font-black text-xl tracking-tight text-foreground">Timeline Activity</h3>
          <button className="bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-xl text-xs font-bold transition-all border border-border">View Full Log</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] bg-muted/30 border-b border-border">
                <th className="px-8 py-4">Instrument</th>
                <th className="px-8 py-4">Bias</th>
                <th className="px-8 py-4">Mental State</th>
                <th className="px-8 py-4">PnL</th>
                <th className="px-8 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {recentTrades.map((trade) => (
                <tr key={trade.id} className="hover:bg-primary/5 transition-colors cursor-pointer group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-muted group-hover:bg-primary/10 flex items-center justify-center font-black text-sm text-foreground transition-colors border border-border">
                        {trade.symbol.substring(0, 3)}
                      </div>
                      <span className="font-black text-foreground">{trade.symbol}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${trade.direction === 'Long' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                      {trade.direction}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className="p-1 bg-muted rounded-lg text-sm border border-border">
                        {trade.emotion === Emotion.CALM && '🧘'}
                        {trade.emotion === Emotion.CONFIDENT && '🚀'}
                        {trade.emotion === Emotion.FOMO && '🤯'}
                        {trade.emotion === Emotion.REVENGE && '👿'}
                        {trade.emotion === Emotion.ANXIOUS && '⛈️'}
                      </span>
                      <span className="text-sm font-bold text-muted-foreground">{trade.emotion}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-mono font-black text-lg">
                    <span className={trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {trade.pnl >= 0 ? '+' : '−'}${Math.abs(trade.pnl).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <p className="text-xs font-bold text-foreground">{new Date(trade.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(trade.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log New Trade"
      >
        <AddTradeForm
          onComplete={handleTradeComplete}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
