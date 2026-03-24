/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Domain for main Ansiversa app URL (e.g., ansiversa.com) */
  readonly ANSIVERSA_COOKIE_DOMAIN: string;

  /** Optional: Override the root app URL (fallback: https://ansiversa.com) */
  readonly PUBLIC_ROOT_APP_URL?: string;
}

interface Window {
  Alpine: import('alpinejs').Alpine;
}

declare namespace App {
  interface Locals {
    rootAppUrl?: string;
  }
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
