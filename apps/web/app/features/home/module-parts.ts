// The site's modules' parts of the home page (WebModule.home), loaded with the page.
import type { ComponentType } from "react";
import { loadParts } from "../../site-modules";

export const HOME_PARTS: readonly ComponentType[] = (await loadParts((m) => m.home)).map(({ part }) => part);
