import { defineTable, column, NOW } from "astro:db";

export const Emails = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(),
    subject: column.text({ optional: true }),
    bodyOriginal: column.text(),                // user's raw draft
    bodyPolished: column.text({ optional: true }), // improved version
    tone: column.text({ optional: true }),      // "formal", "friendly", "apologetic", etc.
    language: column.text({ optional: true }),  // e.g. "en", "ta", "ar"
    context: column.text({ optional: true }),   // short description of use-case
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

export const tables = {
  Emails,
} as const;
