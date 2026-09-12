import React from 'react';
import { WishlistView } from '@/components/WishlistView';
import { useApp } from '@/app/context/AppContext';
import { useRouter } from '@/app/navigation';

export default function DesejosPage() {
  const { wishlist, currency, removeFromWishlist, clearWishlist } = useApp();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <WishlistView
        wishlist={wishlist}
        currency={currency}
        onRemoveItem={removeFromWishlist}
        onClearWishlist={clearWishlist}
        onGoToDeals={() => router.push('/')}
      />
    </div>
  );
}
