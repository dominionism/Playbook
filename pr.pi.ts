/**
 * /pr — Open or update a pull request with a polished, reviewer-facing
 *        summary at the ceiling of clarity. Synthesizes the commit series
 *        into one document, renders structure as Mermaid.js diagrams when
 *        a picture is faster than prose, maps into the repo's PR template
 *        if one exists, and opens/updates via gh. No tool attribution.
 *
 * Mermaid diagrams go in ```mermaid fenced blocks — GitHub renders them
 * natively. For complex diagrams, invoke /diagram which follows the full
 * generation protocol (see ~/.commands/diagram.md).
 *
 * Reads the pr protocol from ~/.commands/pr.md and sends it as a user
 * message. The agent follows the protocol: gathers the commit series,
 * decides atomicity, synthesizes, composes the body, and opens or
 * updates the PR.
 */

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export default function (pi: ExtensionAPI) {
  const protocolPath = path.join(os.homedir(), ".commands", "pr.md");

  pi.registerCommand("pr", {
    description:
      "Open or update a PR — synthesize the commit series into a ceiling-of-clarity, reviewer-facing summary with Mermaid.js diagrams, map into the repo template, push via gh",
    handler: async (_args, ctx) => {
      if (!fs.existsSync(protocolPath)) {
        ctx.ui.notify(
          `PR protocol not found at ${protocolPath}`,
          "error",
        );
        return;
      }

      const protocol = fs.readFileSync(protocolPath, "utf-8");
      pi.sendUserMessage(protocol);
    },
  });
}
