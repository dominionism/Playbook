/**
 * /commit — Commit the staged work with a conventional-commit message at the
 *           ceiling of clarity. Analyzes the actual diff, splits mixed
 *           concerns atomically. No visuals — those go in /pr as Mermaid
 *           diagrams. No tool attribution, ever.
 *
 * Reads the commit protocol from ~/.commands/commit.md and sends it as a
 * user message. The agent follows the protocol: gathers the diff, composes
 * the message, and commits the staged set.
 */

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export default function (pi: ExtensionAPI) {
  const protocolPath = path.join(os.homedir(), ".commands", "commit.md");

  pi.registerCommand("commit", {
    description:
      "Commit staged work — analyze the diff, split mixed concerns, write a ceiling-of-clarity conventional commit message",
    handler: async (_args, ctx) => {
      if (!fs.existsSync(protocolPath)) {
        ctx.ui.notify(
          `Commit protocol not found at ${protocolPath}`,
          "error",
        );
        return;
      }

      const protocol = fs.readFileSync(protocolPath, "utf-8");
      pi.sendUserMessage(protocol);
    },
  });
}
