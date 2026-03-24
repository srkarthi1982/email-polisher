import {
  DEFAULT_WORKSPACE,
  STORAGE_KEY,
  TONES,
  type EmailWorkspace,
  type RefinementKey,
  coerceWorkspace,
  formatAllVariants,
  formatVariantEmail,
  getActiveVariant,
  getEnabledRefinementLabels,
} from "../lib/email";

type CopyStatus = "" | "Copied current draft" | "Copied all variants";

export type EmailPolisherStore = EmailWorkspace & {
  tones: readonly string[];
  copyStatus: CopyStatus;
  init(): void;
  activeVariant: EmailWorkspace["variants"][number];
  refinementLabels: string[];
  currentEmailText: string;
  allVariantsText: string;
  setActiveVariant(variantId: "a" | "b" | "c"): void;
  toggleRefinement(refinementKey: RefinementKey): void;
  copyCurrent(): Promise<void>;
  copyAll(): Promise<void>;
  resetDraft(): void;
  persist(): void;
};

export function createEmailPolisherStore(): EmailPolisherStore {
  const workspace = structuredClone(DEFAULT_WORKSPACE);

  return {
    ...workspace,
    tones: TONES,
    copyStatus: "",
    init() {
      if (typeof window === "undefined") {
        return;
      }

      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.persist();
        return;
      }

      try {
        const parsed = JSON.parse(raw);
        const restored = coerceWorkspace(parsed);
        this.basics = restored.basics;
        this.selectedTone = restored.selectedTone;
        this.refinements = restored.refinements;
        this.variants = restored.variants;
        this.activeVariantId = restored.activeVariantId;
      } catch {
        this.persist();
      }
    },
    get activeVariant() {
      return getActiveVariant(this);
    },
    get refinementLabels() {
      return getEnabledRefinementLabels(this.refinements);
    },
    get currentEmailText() {
      return formatVariantEmail(
        this.basics,
        this.selectedTone,
        this.refinements,
        this.activeVariant,
      );
    },
    get allVariantsText() {
      return formatAllVariants(this);
    },
    setActiveVariant(variantId) {
      this.activeVariantId = variantId;
      this.persist();
    },
    toggleRefinement(refinementKey) {
      this.refinements[refinementKey] = !this.refinements[refinementKey];
      this.persist();
    },
    async copyCurrent() {
      await navigator.clipboard.writeText(this.currentEmailText);
      this.copyStatus = "Copied current draft";
    },
    async copyAll() {
      await navigator.clipboard.writeText(this.allVariantsText);
      this.copyStatus = "Copied all variants";
    },
    resetDraft() {
      if (!window.confirm("Clear this draft and start a new one?")) {
        return;
      }

      const fresh = structuredClone(DEFAULT_WORKSPACE);
      this.basics = fresh.basics;
      this.selectedTone = fresh.selectedTone;
      this.refinements = fresh.refinements;
      this.variants = fresh.variants;
      this.activeVariantId = fresh.activeVariantId;
      this.copyStatus = "";
      this.persist();
    },
    persist() {
      if (typeof window === "undefined") {
        return;
      }

      const state: EmailWorkspace = {
        basics: this.basics,
        selectedTone: this.selectedTone,
        refinements: this.refinements,
        variants: this.variants,
        activeVariantId: this.activeVariantId,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
  };
}
