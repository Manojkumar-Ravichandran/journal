"use client";

import React, { useState } from 'react';
import TradeJournal from '@/components/TradeJournal';
import TradeDetail from '@/components/TradeDetail';

export default function JournalPage() {
    const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);

    return (
        <div className="min-h-full">
            {selectedTradeId ? (
                <TradeDetail
                    tradeId={selectedTradeId}
                    onBack={() => setSelectedTradeId(null)}
                />
            ) : (
                <TradeJournal
                    onSelectTrade={(id) => setSelectedTradeId(id)}
                />
            )}
        </div>
    );
}
