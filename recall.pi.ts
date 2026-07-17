/**
 * /recall — Resume from the latest handoff in Memories/
 *
 * Reads the recall protocol from ~/.commands/recall.md and sends it as a
 * user message. The agent follows the protocol: locates project root,
 * finds the latest handoff in Memories/, absorbs context, verifies state,
 * and picks up at the exact next action.
 *
 * Mirrors handoff.pi.ts intentionally — same dumb bridge pattern as
 * Claude Code and opencode use, so /recall behaves identically across CLIs.
 */

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export default function (pi: ExtensionAPI) {
  const protocolPath = path.join(os.homedir(), ".commands", "recall.md");

  pi.registerCommand("recall", {
    description:
      "Resume from the latest handoff in Memories/ — absorb context, verify state, pick up where you left off",
    handler: async (args, ctx) => {
      if (!fs.existsSync(protocolPath)) {
        ctx.ui.notify(
          `Recall protocol not found at ${protocolPath}`,
          "error",
        );
        return;
      }

      const protocol = fs.readFileSync(protocolPath, "utf-8");
      const flags = typeof args === "string" ? args.trim() : "";
      pi.sendUserMessage(
        flags === ""
          ? protocol
          : `${protocol}\n\nArguments passed with /recall: ${flags}`,
      );
    },
  });
}
