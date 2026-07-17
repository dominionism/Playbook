/**
 * /prototype — Build a throwaway prototype to answer a high-fidelity question.
 *             Two branches: a terminal app for logic/state questions, or
 *             several UI variations toggleable from one route.
 *
 * Reads the prototype protocol from ~/.commands/prototype.md and sends it as
 * a user message. The agent picks the right branch, builds the prototype,
 * and captures the answer.
 */

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export default function (pi: ExtensionAPI) {
  const protocolPath = path.join(os.homedir(), ".commands", "prototype.md");

  pi.registerCommand("prototype", {
    description:
      "Build a throwaway prototype — terminal app for logic, or UI variants for design",
    handler: async (_args, ctx) => {
      if (!fs.existsSync(protocolPath)) {
        ctx.ui.notify(
          `Prototype protocol not found at ${protocolPath}`,
          "error",
        );
        return;
      }

      const protocol = fs.readFileSync(protocolPath, "utf-8");
      pi.sendUserMessage(protocol);
    },
  });
}
