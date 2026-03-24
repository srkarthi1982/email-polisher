import { defineMiddleware } from "astro:middleware";

// Primary domain for Ansiversa (used to build the root app URL)
const COOKIE_DOMAIN =
  import.meta.env.ANSIVERSA_COOKIE_DOMAIN ?? "ansiversa.com";

// Root app URL
const ROOT_APP_URL =
  import.meta.env.PUBLIC_ROOT_APP_URL ?? `https://${COOKIE_DOMAIN}`;

export const onRequest = defineMiddleware(async (context, next) => {
  const { locals, url } = context;
  const pathname = url.pathname;

  // Allow static assets
  if (
    pathname.startsWith("/_astro/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/images/")
  ) {
    return next();
  }

  locals.rootAppUrl = ROOT_APP_URL;

  // V1 is intentionally public for structured drafting workflows.
  // We keep middleware locals shape in place for compatibility.

  return next();
});
