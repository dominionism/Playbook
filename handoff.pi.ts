/**
 * /handoff — Generate a session handoff document
 *
 * Reads the handoff protocol from ~/.commands/handoff.md and sends it
 * as a user message. The agent follows the protocol: extracts session
 * context, distills with the 95% rule, and writes a structured handoff
 * to <project-root>/Memories/handoff-YYYY-MM-DD-HHMM.md.
 */

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export default function (pi: ExtensionAPI) {
  const protocolPath = path.join(os.homedir(), ".commands", "handoff.md");

  pi.registerCommand("handoff", {
    description:
      "Generate a session handoff doc in Memories/ — capture full context so a fresh agent can resume",
    handler: async (args, ctx) => {
      if (!fs.existsSync(protocolPath)) {
        ctx.ui.notify(
          `Handoff protocol not found at ${protocolPath}`,
          "error",
        );
        return;
      }

      const protocol = fs.readFileSync(protocolPath, "utf-8");
      const focus = typeof args === "string" ? args.trim() : "";
      pi.sendUserMessage(
        focus === ""
          ? protocol
          : `${protocol}\n\nArguments passed with /handoff (the next session's focus): ${focus}`,
      );
    },
  });
}
