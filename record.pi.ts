/**
 * /record — Capture a concept, explanation, or analogy into your personal
 *           engineering textbook at ~/Developer/The Architect/.
 *           Retroactive, on-demand, or manual.
 *
 * Reads the record protocol from ~/.commands/record.md and sends it as a
 * user message. The agent identifies the mode, writes the chapter, and
 * updates the glossary index.
 */

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export default function (pi: ExtensionAPI) {
  const protocolPath = path.join(os.homedir(), ".commands", "record.md");

  pi.registerCommand("record", {
    description:
      "Capture a concept into your personal engineering textbook — save explanations, analogies, and understanding",
    handler: async (_args, ctx) => {
      if (!fs.existsSync(protocolPath)) {
        ctx.ui.notify(
          `Record protocol not found at ${protocolPath}`,
          "error",
        );
        return;
      }

      const protocol = fs.readFileSync(protocolPath, "utf-8");
      pi.sendUserMessage(protocol);
    },
  });
}
