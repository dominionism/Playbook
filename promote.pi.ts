/**
 * /promote — Promote implementation learnings into durable context.
 *           Updates the plan, glossary, ADRs, and research notes with
 *           what was actually built vs. what was planned. Run after a
 *           meaningful chunk of work, before /handoff or /commit.
 *
 * Reads the promote protocol from ~/.commands/promote.md and sends it
 * as a user message. The agent follows the protocol: gathers current
 * state, identifies deltas, proposes them to the user, and writes
 * confirmed changes.
 */

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export default function (pi: ExtensionAPI) {
  const protocolPath = path.join(os.homedir(), ".commands", "promote.md");

  pi.registerCommand("promote", {
    description:
      "Promote implementation learnings into durable context — update plan, glossary, ADRs, and research notes",
    handler: async (_args, ctx) => {
      if (!fs.existsSync(protocolPath)) {
        ctx.ui.notify(
          `Promote protocol not found at ${protocolPath}`,
          "error",
        );
        return;
      }

      const protocol = fs.readFileSync(protocolPath, "utf-8");
      pi.sendUserMessage(protocol);
    },
  });
}
