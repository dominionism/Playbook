/**
 * /diagram — Generate Mermaid.js diagrams from codebase analysis.
 *            Architecture flowcharts, class hierarchies, git graphs,
 *            sequence diagrams. Outputs inline ```mermaid blocks for
 *            GitHub-native rendering or SVG/PNG via mmdc.
 *
 * Reads the diagram protocol from ~/.commands/diagram.md and sends it
 * as a user message, substituting the user's arguments for $ARGUMENTS
 * so scoped queries (e.g. "/diagram flowchart src/auth") flow through
 * to the agent.
 */

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export default function (pi: ExtensionAPI) {
  const commandPath = path.join(os.homedir(), ".commands", "diagram.md");

  pi.registerCommand("diagram", {
    description:
      "Generate Mermaid.js diagrams from codebase analysis — flowcharts, class diagrams, git graphs, sequence diagrams. Outputs inline ```mermaid blocks (GitHub-native) or SVG/PNG via mmdc.",
    handler: async (args, ctx) => {
      if (!fs.existsSync(commandPath)) {
        ctx.ui.notify(
          `Diagram protocol not found at ${commandPath}`,
          "error",
        );
        return;
      }

      const command = fs.readFileSync(commandPath, "utf-8");
      const hint =
        typeof args === "string" && args.trim() !== ""
          ? args.trim()
          : "(scope detected from context)";
      pi.sendUserMessage(command.replace("$ARGUMENTS", hint));
    },
  });
}
