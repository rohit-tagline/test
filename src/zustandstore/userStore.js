import { createPersistZustand } from './store';

const initialState = {
  accessToken: null,
  userId: null,
  profile: null,
  isLoading: false,
  hasSeenOnboarding: false,
};

export const useUserStore = createPersistZustand('mapboxUser', set => ({
  ...initialState,
  setHasSeenOnboarding: value => set(() => ({ hasSeenOnboarding: value })),
  setAuthData: ({ accessToken, userId, profile }) =>
    set(() => ({
      accessToken: accessToken ?? null,
      userId: userId ?? null,
      profile: profile ?? null,
    })),
  setProfile: profile => set(() => ({ profile })),
  setLoading: isLoading => set(() => ({ isLoading })),
  logout: () =>
    set(state => ({
      ...initialState,
      // keep onboarding completed so user returns to login, not onboarding
      hasSeenOnboarding: state.hasSeenOnboarding || true,
    })),
}));

export default useUserStore;

