import React from 'react';
import { FreebiesView } from '@/components/FreebiesView';
import { useApp } from '@/app/context/AppContext';

export default function GratisPage() {
  const { giveaways, currency } = useApp();

  return (
    <div className="space-y-6">
      <FreebiesView giveaways={giveaways} currency={currency} />
    </div>
  );
}
