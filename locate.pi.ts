/**
 * /locate — Find the right context tree in the grove and absorb it whole
 *
 * Reads the pointer command from ~/.commands/locate.md (which defers to the
 * canonical protocol in ~/Developer/Grove/protocols/locate.md) and sends it
 * as a user message, substituting the request for $ARGUMENTS the way the
 * md-based CLIs do.
 */

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export default function (pi: ExtensionAPI) {
  const commandPath = path.join(os.homedir(), ".commands", "locate.md");

  pi.registerCommand("locate", {
    description:
      "Find the right context tree in the grove, judge candidates, read it whole, resume versed",
    handler: async (args, ctx) => {
      if (!fs.existsSync(commandPath)) {
        ctx.ui.notify(`Locate command not found at ${commandPath}`, "error");
        return;
      }

      const command = fs.readFileSync(commandPath, "utf-8");
      const request =
        typeof args === "string" && args.trim() !== ""
          ? args.trim()
          : "(none — gather intent per the protocol)";
      pi.sendUserMessage(command.replace("$ARGUMENTS", request));
    },
  });
}
