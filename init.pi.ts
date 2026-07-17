/**
 * /init — Bootstrap the project's Context/ and Memories/ directories
 *         with empty templates. Run once per project so other commands
 *         never need to create scaffolding.
 *
 * Reads the init protocol from ~/.commands/init.md and sends it as a
 * user message. The agent creates the directory structure, writes the
 * Glossary.md template, and reports what was done.
 */

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export default function (pi: ExtensionAPI) {
  const protocolPath = path.join(os.homedir(), ".commands", "init.md");

  pi.registerCommand("init", {
    description:
      "Bootstrap Context/ and Memories/ directories with empty templates — run once per project",
    handler: async (_args, ctx) => {
      if (!fs.existsSync(protocolPath)) {
        ctx.ui.notify(
          `Init protocol not found at ${protocolPath}`,
          "error",
        );
        return;
      }

      const protocol = fs.readFileSync(protocolPath, "utf-8");
      pi.sendUserMessage(protocol);
    },
  });
}
