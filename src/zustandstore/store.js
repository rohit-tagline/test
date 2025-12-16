import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const createPersistZustand = (name, initializer, options = {}) =>
  create(
    persist(initializer, {
      name,
      storage: createJSONStorage(() => AsyncStorage),
      ...options,
    }),
  );

export const createZustandStore = initializer => create(initializer);

