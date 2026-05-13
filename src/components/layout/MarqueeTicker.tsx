import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MOCK_TICKERS = [
  { id: 1, user: "0x7A...3b21", action: "bought", amount: "2,500", token: "PEPE", type: "buy" },
  { id: 2, user: "0x3F...9c4A", action: "sold", amount: "10,000", token: "DOGE", type: "sell" },
  { id: 3, user: "0x12...8e99", action: "bought", amount: "500", token: "SAT", type: "buy" },
  { id: 4, user: "0x9B...11a2", action: "created", amount: "", token: "NEW_MEME", type: "create" },
  { id: 5, user: "0x44...d21f", action: "sold", amount: "1,200", token: "SHIB", type: "sell" },
  { id: 6, user: "0x8C...55e4", action: "bought", amount: "5,000", token: "WIF", type: "buy" },
];

export function MarqueeTicker() {
  // Duplicate array to create a seamless loop
  const displayTickers = [...MOCK_TICKERS, ...MOCK_TICKERS];

  return (
    <div className="w-full bg-surface-elevated border-b border-border overflow-hidden h-10 flex items-center relative z-40">
      <div className="flex animate-marquee whitespace-nowrap min-w-max">
        {displayTickers.map((ticker, index) => (
          <div 
            key={`${ticker.id}-${index}`} 
            className="flex items-center gap-2 px-6 text-sm"
          >
            <span className="text-content-secondary">{ticker.user}</span>
            
            {ticker.type === 'buy' && <span className="text-accent-success flex items-center"><ArrowUpRight className="w-3 h-3 mr-1"/>{ticker.action}</span>}
            {ticker.type === 'sell' && <span className="text-accent-danger flex items-center"><ArrowDownRight className="w-3 h-3 mr-1"/>{ticker.action}</span>}
            {ticker.type === 'create' && <span className="text-accent-primary">{ticker.action}</span>}
            
            {ticker.amount && <span className="font-medium text-content-primary">{ticker.amount}</span>}
            <span className="font-bold text-content-primary">{ticker.token}</span>
            
            {/* Separator dot */}
            <span className="w-1.5 h-1.5 rounded-full bg-border ml-6"></span>
          </div>
        ))}
      </div>
    </div>
  );
}
