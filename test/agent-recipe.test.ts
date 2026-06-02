import test from "node:test";
import assert from "node:assert/strict";
import {
  AGENT_CLI_RECIPE,
  AGENT_HEADLESS_SETUP,
  agentRecipePayload,
  agentRecipeHumanLines
} from "../src/app/agent-recipe.js";

test("agent recipe payload exposes CLI commands and the no-browser sign-in for server agents", () => {
  const payload = agentRecipePayload();
  assert.ok(payload.cliCommands.length >= 5);
  assert.equal(payload.headless.signIn, "vibecodr login agent --no-browser");
  assert.equal(payload.headless.credentialStore, "VC_TOOLS_CREDENTIAL_STORE=file");
  assert.equal(payload.headless.nonInteractive, "--non-interactive");
  // Every recipe entry is a real `vibecodr ...` invocation (Model A), not an MCP URL.
  for (const entry of payload.cliCommands) {
    assert.ok(entry.command.startsWith("vibecodr "), `recipe command should be a CLI call: ${entry.command}`);
    assert.ok(entry.purpose.length > 0);
  }
  const commands = payload.cliCommands.map((entry) => entry.command).join("\n");
  assert.match(commands, /vibecodr browser /);
  assert.match(commands, /vibecodr computer /);
  assert.match(commands, /vibecodr mcp call /);
});

test("agent recipe human lines explain the CLI-as-tool-interface and no-browser sign-in", () => {
  const lines = agentRecipeHumanLines();
  assert.ok(lines.length > 0);
  assert.ok(lines.some((line) => line.includes("vibecodr login agent --no-browser")));
  assert.ok(lines.some((line) => line.includes("no MCP client")));
});

test("agent recipe payload returns fresh copies so callers cannot mutate shared state", () => {
  const first = agentRecipePayload();
  first.cliCommands.push({ purpose: "mutation", command: "vibecodr should-not-leak" });
  const second = agentRecipePayload();
  assert.equal(second.cliCommands.length, AGENT_CLI_RECIPE.length);
  assert.notEqual(second.headless, AGENT_HEADLESS_SETUP);
});
