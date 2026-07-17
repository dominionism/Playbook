/**
 * /consolidate — Distill this session into its context tree in the grove
 *
 * Reads the pointer command from ~/.commands/consolidate.md (which defers to
 * the canonical protocol in ~/Developer/Grove/protocols/consolidate.md) and
 * sends it as a user message, substituting the subject hint for $ARGUMENTS
 * the way the md-based CLIs do.
 */

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export default function (pi: ExtensionAPI) {
  const commandPath = path.join(os.homedir(), ".commands", "consolidate.md");

  pi.registerCommand("consolidate", {
    description:
      "Distill the session into its grove tree — route, write leaves, refresh canopy, user accepts via diff",
    handler: async (args, ctx) => {
      if (!fs.existsSync(commandPath)) {
        ctx.ui.notify(`Consolidate command not found at ${commandPath}`, "error");
        return;
      }

      const command = fs.readFileSync(commandPath, "utf-8");
      const hint =
        typeof args === "string" && args.trim() !== ""
          ? args.trim()
          : "(none — scope per the protocol's first beat)";
      pi.sendUserMessage(command.replace("$ARGUMENTS", hint));
    },
  });
}
