import { create } from 'zustand';
import { Transaction } from '@/types';
import {
  getTransactions,
  rechargeWallet,
  creditWallet,
  subscribeToWallet,
  unsubscribeFromWallet,
} from '@/services/wallet/WalletService';
import { paymentService } from '@/services/payment';
import { useAuthStore } from './authStore';

interface WalletState {
  balance: number;
  transactions: Transaction[];
  isProcessing: boolean;
  setBalance: (balance: number) => void;
  fetchTransactions: () => Promise<void>;
  recharge: (amount: number, packId?: string) => Promise<boolean>;
  addCredits: (amount: number) => Promise<boolean>;
  subscribe: (userId: string) => () => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: 0,
  transactions: [],
  isProcessing: false,

  setBalance: (balance) => set({ balance }),

  fetchTransactions: async () => {
    const profile = useAuthStore.getState().profile;
    if (!profile) return;
    const transactions = await getTransactions(profile.id);
    set({ transactions });
  },

  recharge: async (amount, packId) => {
    set({ isProcessing: true });
    try {
      const payment = await paymentService.charge(amount, { packId: packId ?? 'custom' });
      if (!payment.success) return false;

      const result = await rechargeWallet(amount, payment.transactionId);
      set({ balance: result.wallet_balance, isProcessing: false });
      await get().fetchTransactions();
      useAuthStore.getState().refreshProfile();
      return true;
    } catch {
      set({ isProcessing: false });
      return false;
    }
  },

  addCredits: async (amount) => {
    set({ isProcessing: true });
    try {
      const result = await creditWallet(amount, 'Test credit');
      set({ balance: result.wallet_balance, isProcessing: false });
      await get().fetchTransactions();
      useAuthStore.getState().refreshProfile();
      return true;
    } catch {
      set({ isProcessing: false });
      return false;
    }
  },

  subscribe: (userId) => {
    const channel = subscribeToWallet(userId, (balance) => set({ balance }));
    return () => {
      unsubscribeFromWallet(channel);
    };
  },

  reset: () => set({ balance: 0, transactions: [], isProcessing: false }),
}));
