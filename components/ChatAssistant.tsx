"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, MessageSquare, Loader2 } from 'lucide-react';
import { sendChatMessage } from '@/app/services/geminiService';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await sendChatMessage([...messages, userMessage]);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-primary text-primary-foreground rounded-2xl shadow-2xl hover:scale-110 transition-all duration-300 z-50 group"
            >
                <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-accent rounded-full animate-ping"></span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[32rem] bg-card border border-border rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="p-4 border-b border-border bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-black text-sm text-foreground">AI Trading Coach</h3>
                        <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.length === 0 && (
                    <div className="text-center py-8 space-y-3">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-2xl">👋</div>
                        <p className="text-sm font-medium text-muted-foreground px-8">
                            Hi! I&apos;m your trading assistant. Ask me about your performance, discipline, or for some psychological advice.
                        </p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-muted text-foreground rounded-tl-none border border-border'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-muted p-3 rounded-2xl rounded-tl-none border border-border">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-muted/30">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything..."
                        className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 pr-12 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
