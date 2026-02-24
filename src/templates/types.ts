import type { TemplateConfig } from "@/types";

export interface TemplateProps {
  config: TemplateConfig;
  spellId: string;
  readOnly?: boolean;
}
