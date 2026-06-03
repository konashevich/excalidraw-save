import { createStore, get } from "idb-keyval";
import { beforeEach, describe, expect, it } from "vitest";

import { appJotaiStore } from "../app-jotai";

import { idbSet } from "./idbWrite";
import { sceneVaultQuotaExceededAtom } from "./vaultState";

const testStore = createStore("idb-write-test-db", "idb-write-test-store");

describe("idbSet", () => {
  beforeEach(() => {
    appJotaiStore.set(sceneVaultQuotaExceededAtom, false);
  });

  it("persists values and clears quota flag on success", async () => {
    appJotaiStore.set(sceneVaultQuotaExceededAtom, true);
    await idbSet("ok-key", { ok: true }, testStore);
    expect(await get("ok-key", testStore)).toEqual({ ok: true });
    expect(appJotaiStore.get(sceneVaultQuotaExceededAtom)).toBe(false);
  });
});
