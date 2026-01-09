import React from 'react';
import SubscriptionModal from '@/components/payment/SubscriptionModal';
import type { PricingTier } from '@/components/pricing/PricingSection';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier?: PricingTier;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, selectedTier = 'starter' }) => {
  // Default to 'starter' which is now the $4.99/mo Premium tier
  return <SubscriptionModal isOpen={isOpen} onClose={onClose} selectedTier={selectedTier} />;
};

export default UpgradeModal;
