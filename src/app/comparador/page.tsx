import React from 'react';
import { PriceComparatorView } from '@/components/PriceComparatorView';
import { useApp } from '@/app/context/AppContext';

export default function ComparadorPage() {
  const { currency } = useApp();

  return (
    <div className="space-y-6">
      <PriceComparatorView currency={currency} />
    </div>
  );
}
