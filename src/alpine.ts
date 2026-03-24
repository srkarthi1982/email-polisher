import type { Alpine } from "alpinejs";
import { createEmailPolisherStore } from "./store/app";

export default function initAlpine(Alpine: Alpine) {
  Alpine.store("emailPolisher", createEmailPolisherStore());
}
