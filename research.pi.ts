/**
 * /research — Map a codebase or feature for complete understanding.
 *            Comprehensive mode maps the full project; specific mode
 *            deep-dives a feature, module, or area.
 *
 * Reads the research protocol from ~/.commands/research.md and sends
 * it as a user message. The agent follows the protocol: maps structure,
 * traces architecture, understands the domain, and produces a concise
 * synthesis it carries for the rest of the session.
 */

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export default function (pi: ExtensionAPI) {
  const protocolPath = path.join(os.homedir(), ".commands", "research.md");

  pi.registerCommand("research", {
    description:
      "Map a codebase or feature — comprehensive overview or deep-dive on a specific area",
    handler: async (_args, ctx) => {
      if (!fs.existsSync(protocolPath)) {
        ctx.ui.notify(
          `Research protocol not found at ${protocolPath}`,
          "error",
        );
        return;
      }

      const protocol = fs.readFileSync(protocolPath, "utf-8");
      pi.sendUserMessage(protocol);
    },
  });
}
