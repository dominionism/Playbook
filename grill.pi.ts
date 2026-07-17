/**
 * /grill — Relentlessly interview the user about a plan, resolving every branch
 *         of the design tree. Challenges against the project's CONTEXT.md and
 *         ADRs, sharpens terminology, and updates documentation inline.
 *
 * Reads the grill protocol from ~/.commands/grill.md and sends it as a user
 * message. The agent follows the protocol: interviews one question at a time,
 * consults domain docs, and captures decisions as they crystallize.
 */

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export default function (pi: ExtensionAPI) {
  const protocolPath = path.join(os.homedir(), ".commands", "grill.md");

  pi.registerCommand("grill", {
    description:
      "Grill me — interview relentlessly about a plan, sharpen domain language, update CONTEXT.md and ADRs",
    handler: async (_args, ctx) => {
      if (!fs.existsSync(protocolPath)) {
        ctx.ui.notify(
          `Grill protocol not found at ${protocolPath}`,
          "error",
        );
        return;
      }

      const protocol = fs.readFileSync(protocolPath, "utf-8");
      pi.sendUserMessage(protocol);
    },
  });
}
