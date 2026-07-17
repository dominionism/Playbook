/**
 * /visuals — Produce the Story/Delta visual supplement for a PR or review.
 *
 * Reads the shared engine protocol from ~/.commands/visuals.md and sends it
 * as a user message, substituting the caller's request for $ARGUMENTS the
 * way the md-based CLIs do. /pr (authoring mode) and /assess (review mode)
 * follow the same file directly; this command exposes the engine standalone.
 */

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export default function (pi: ExtensionAPI) {
  const protocolPath = path.join(os.homedir(), ".commands", "visuals.md");

  pi.registerCommand("visuals", {
    description:
      "Produce the Story + Delta visual supplement for a PR or review — the shared clarity engine behind /pr and /assess",
    handler: async (args, ctx) => {
      if (!fs.existsSync(protocolPath)) {
        ctx.ui.notify(`Visuals protocol not found at ${protocolPath}`, "error");
        return;
      }

      const protocol = fs.readFileSync(protocolPath, "utf-8");
      const request =
        typeof args === "string" && args.trim() !== ""
          ? args.trim()
          : "(none — detect the mode per §1)";
      pi.sendUserMessage(protocol.replace("$ARGUMENTS", request));
    },
  });
}
