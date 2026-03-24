export const APP_KEY = "email-polisher";
export const STORAGE_KEY = "ansiversa.email-polisher.v1";

export const TONES = [
  "Professional",
  "Friendly",
  "Formal",
  "Concise",
] as const;

export const REFINEMENT_KEYS = [
  "shorter",
  "clearer",
  "warmer",
  "direct",
] as const;

export type Tone = (typeof TONES)[number];
export type RefinementKey = (typeof REFINEMENT_KEYS)[number];

export type Variant = {
  id: "a" | "b" | "c";
  label: "Draft A" | "Draft B" | "Draft C";
  opening: string;
  body: string;
  closing: string;
  signature: string;
};

export type EmailBasics = {
  subject: string;
  recipientName: string;
  senderName: string;
  context: string;
};

export type Refinements = Record<RefinementKey, boolean>;

export type EmailWorkspace = {
  basics: EmailBasics;
  selectedTone: Tone;
  refinements: Refinements;
  variants: Variant[];
  activeVariantId: Variant["id"];
};

export const DEFAULT_VARIANTS: Variant[] = [
  { id: "a", label: "Draft A", opening: "", body: "", closing: "", signature: "" },
  { id: "b", label: "Draft B", opening: "", body: "", closing: "", signature: "" },
  { id: "c", label: "Draft C", opening: "", body: "", closing: "", signature: "" },
];

export const DEFAULT_WORKSPACE: EmailWorkspace = {
  basics: {
    subject: "",
    recipientName: "",
    senderName: "",
    context: "",
  },
  selectedTone: "Professional",
  refinements: {
    shorter: false,
    clearer: false,
    warmer: false,
    direct: false,
  },
  variants: structuredClone(DEFAULT_VARIANTS),
  activeVariantId: "a",
};

export function normalizeText(value: string): string {
  return value.replace(/\r\n/g, "\n").trim();
}

export function getGreeting(recipientName: string): string {
  const trimmed = recipientName.trim();
  return trimmed ? `Dear ${trimmed},` : "Dear [Recipient],";
}

export function getActiveVariant(workspace: EmailWorkspace): Variant {
  return (
    workspace.variants.find((variant) => variant.id === workspace.activeVariantId) ??
    workspace.variants[0]
  );
}

function createRefinementLabel(key: RefinementKey): string {
  switch (key) {
    case "shorter":
      return "Make shorter";
    case "clearer":
      return "Make clearer";
    case "warmer":
      return "Make warmer";
    case "direct":
      return "Make more direct";
  }
}

export function getEnabledRefinementLabels(refinements: Refinements): string[] {
  return REFINEMENT_KEYS.filter((key) => refinements[key]).map((key) =>
    createRefinementLabel(key),
  );
}

export function formatVariantEmail(
  basics: EmailBasics,
  tone: Tone,
  refinements: Refinements,
  variant: Variant,
): string {
  const refinementLabels = getEnabledRefinementLabels(refinements);
  const sections = [
    `Subject: ${basics.subject.trim() || "[No subject]"}`,
    `Tone: ${tone}`,
    `Refinement flags: ${
      refinementLabels.length > 0 ? refinementLabels.join(", ") : "None selected"
    }`,
    "",
    getGreeting(basics.recipientName),
    "",
    normalizeText(variant.opening) || "[Opening]",
    "",
    normalizeText(variant.body) || "[Main message]",
    "",
    normalizeText(variant.closing) || "[Closing]",
    "",
    normalizeText(variant.signature) || basics.senderName.trim() || "[Signature]",
  ];

  if (basics.context.trim()) {
    sections.splice(3, 0, `Context: ${basics.context.trim()}`);
  }

  return sections.join("\n");
}

export function formatAllVariants(workspace: EmailWorkspace): string {
  return workspace.variants
    .map((variant) => {
      const formatted = formatVariantEmail(
        workspace.basics,
        workspace.selectedTone,
        workspace.refinements,
        variant,
      );
      return `${variant.label}\n${"=".repeat(variant.label.length)}\n${formatted}`;
    })
    .join("\n\n");
}

export function coerceWorkspace(input: unknown): EmailWorkspace {
  if (!input || typeof input !== "object") {
    return structuredClone(DEFAULT_WORKSPACE);
  }

  const source = input as Partial<EmailWorkspace>;
  const workspace = structuredClone(DEFAULT_WORKSPACE);

  workspace.basics.subject = source.basics?.subject ?? workspace.basics.subject;
  workspace.basics.recipientName =
    source.basics?.recipientName ?? workspace.basics.recipientName;
  workspace.basics.senderName = source.basics?.senderName ?? workspace.basics.senderName;
  workspace.basics.context = source.basics?.context ?? workspace.basics.context;

  if (source.selectedTone && TONES.includes(source.selectedTone)) {
    workspace.selectedTone = source.selectedTone;
  }

  workspace.refinements.shorter =
    source.refinements?.shorter ?? workspace.refinements.shorter;
  workspace.refinements.clearer =
    source.refinements?.clearer ?? workspace.refinements.clearer;
  workspace.refinements.warmer = source.refinements?.warmer ?? workspace.refinements.warmer;
  workspace.refinements.direct = source.refinements?.direct ?? workspace.refinements.direct;

  if (Array.isArray(source.variants)) {
    workspace.variants = workspace.variants.map((defaultVariant) => {
      const incoming = source.variants?.find((variant) => variant.id === defaultVariant.id);
      return {
        ...defaultVariant,
        opening: incoming?.opening ?? defaultVariant.opening,
        body: incoming?.body ?? defaultVariant.body,
        closing: incoming?.closing ?? defaultVariant.closing,
        signature: incoming?.signature ?? defaultVariant.signature,
      };
    });
  }

  if (source.activeVariantId && ["a", "b", "c"].includes(source.activeVariantId)) {
    workspace.activeVariantId = source.activeVariantId as Variant["id"];
  }

  return workspace;
}
