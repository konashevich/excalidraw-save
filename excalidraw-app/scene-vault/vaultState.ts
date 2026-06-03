import { atom } from "../app-jotai";

/** Set when IndexedDB vault writes fail with QuotaExceededError. */
export const sceneVaultQuotaExceededAtom = atom(false);

/** Bumped when the vault changes (this tab or another via BroadcastChannel). */
export const sceneVaultListRevisionAtom = atom(0);
