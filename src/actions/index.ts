import type { ActionAPIContext } from "astro:actions";
import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { db, eq, and, Emails } from "astro:db";

function requireUser(context: ActionAPIContext) {
  const locals = context.locals as App.Locals | undefined;
  const user = locals?.user;

  if (!user) {
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to perform this action.",
    });
  }

  return user;
}

export const server = {
  createEmail: defineAction({
    input: z.object({
      id: z.string().optional(),
      subject: z.string().optional(),
      bodyOriginal: z.string().min(1, "Original body is required"),
      bodyPolished: z.string().optional(),
      tone: z.string().optional(),
      language: z.string().optional(),
      context: z.string().optional(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);

      const [email] = await db
        .insert(Emails)
        .values({
          id: input.id ?? crypto.randomUUID(),
          userId: user.id,
          subject: input.subject,
          bodyOriginal: input.bodyOriginal,
          bodyPolished: input.bodyPolished,
          tone: input.tone,
          language: input.language,
          context: input.context,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return { email };
    },
  }),

  updateEmail: defineAction({
    input: z.object({
      id: z.string(),
      subject: z.string().optional(),
      bodyOriginal: z.string().optional(),
      bodyPolished: z.string().optional(),
      tone: z.string().optional(),
      language: z.string().optional(),
      context: z.string().optional(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);
      const { id, ...rest } = input;

      const [existing] = await db
        .select()
        .from(Emails)
        .where(and(eq(Emails.id, id), eq(Emails.userId, user.id)))
        .limit(1);

      if (!existing) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Email not found.",
        });
      }

      const updateData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(rest)) {
        if (typeof value !== "undefined") {
          updateData[key] = value;
        }
      }

      if (Object.keys(updateData).length === 0) {
        return { email: existing };
      }

      const [email] = await db
        .update(Emails)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(and(eq(Emails.id, id), eq(Emails.userId, user.id)))
        .returning();

      return { email };
    },
  }),

  listEmails: defineAction({
    input: z.object({}).optional(),
    handler: async (_, context) => {
      const user = requireUser(context);

      const emails = await db.select().from(Emails).where(eq(Emails.userId, user.id));

      return { emails };
    },
  }),

  deleteEmail: defineAction({
    input: z.object({
      id: z.string(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);

      const [deleted] = await db
        .delete(Emails)
        .where(and(eq(Emails.id, input.id), eq(Emails.userId, user.id)))
        .returning();

      if (!deleted) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Email not found.",
        });
      }

      return { email: deleted };
    },
  }),
};
