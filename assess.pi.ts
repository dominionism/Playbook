/**
 * /assess — Review a pull request at the ceiling of clarity.
 *
 * Reads the assess protocol from ~/.commands/assess.md and sends it as a
 * user message, substituting the PR reference for $ARGUMENTS the way the
 * md-based CLIs do. The agent fetches the PR via gh, traces the change,
 * produces Story/Delta/Focus visuals via the /visuals engine, and drafts
 * a complete review — posting only after explicit approval.
 */

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export default function (pi: ExtensionAPI) {
  const protocolPath = path.join(os.homedir(), ".commands", "assess.md");

  pi.registerCommand("assess", {
    description:
      "Review a pull request at the ceiling of clarity — Story/Delta/Focus visuals plus a full drafted review, posted only on approval",
    handler: async (args, ctx) => {
      if (!fs.existsSync(protocolPath)) {
        ctx.ui.notify(`Assess protocol not found at ${protocolPath}`, "error");
        return;
      }

      const protocol = fs.readFileSync(protocolPath, "utf-8");
      const prRef =
        typeof args === "string" && args.trim() !== ""
          ? args.trim()
          : "(none — identify the PR per §1)";
      pi.sendUserMessage(protocol.replace("$ARGUMENTS", prRef));
    },
  });
}
