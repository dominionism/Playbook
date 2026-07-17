/**
 * /blueprint — Create an optimal implementation plan.
 *              Runs after /research. Decomposes the target into ordered
 *              work items, researches genuine uncertainties via sub-agents
 *              with hard termination, and produces a plan at the ceiling
 *              of what's knowable before writing code.
 *
 * Reads the blueprint protocol from ~/.commands/blueprint.md and sends
 * it as a user message.
 */

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export default function (pi: ExtensionAPI) {
  const protocolPath = path.join(os.homedir(), ".commands", "blueprint.md");

  pi.registerCommand("blueprint", {
    description:
      "Create an optimal implementation plan — decompose, research unknowns, and produce a concrete path forward",
    handler: async (_args, ctx) => {
      if (!fs.existsSync(protocolPath)) {
        ctx.ui.notify(
          `Blueprint protocol not found at ${protocolPath}`,
          "error",
        );
        return;
      }

      const protocol = fs.readFileSync(protocolPath, "utf-8");
      pi.sendUserMessage(protocol);
    },
  });
}
