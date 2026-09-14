'use client';
import React from 'react';
import { WorscoiLoginModal } from './WorscoiLoginModal';

interface AuthModalProps {
  onClose?: () => void;
  isOpen?: boolean;
}

export function AuthModal({ onClose, isOpen = true }: AuthModalProps) {
  return (
    <WorscoiLoginModal
      isOpen={isOpen}
      onClose={onClose || (() => {})}
    />
  );
}

export default AuthModal;
