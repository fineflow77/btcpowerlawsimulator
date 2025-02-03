'use client';

import WithdrawalSimulator from '@/components/WithdrawalSimulator';
import DCASimulator from '@/components/DCASimulator';

export default function Home() {
  return (
    <div className="p-4 min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <WithdrawalSimulator />
        </div>
        <div>
          <DCASimulator />
        </div>
      </div>
    </div>
  );
}
