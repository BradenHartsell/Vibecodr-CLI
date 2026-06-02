// Shared "drive the hosted tools through the CLI" recipe.
//
// An agent operating inside a server (headless, no browser) uses Vibecodr's
// hosted tools by shelling out to the `vibecodr` CLI, which holds the
// credential — instead of wiring a hosted MCP URL into its own MCP client.
// The MCP URL is OAuth-gated, so that path needs a browser sign-in and cannot
// complete on a headless box. This recipe is surfaced from `vibecodr status`
// and `vibecodr doctor` (the commands an agent already runs), in both the
// human output and the `--json` envelope, so a server-side agent can
// self-serve without a new command.

export interface AgentRecipeCommand {
  purpose: string;
  command: string;
}

export const AGENT_CLI_RECIPE: readonly AgentRecipeCommand[] = [
  { purpose: "Screenshot a public page (saved locally)", command: "vibecodr browser screenshot <url> --local" },
  { purpose: "Read a page as text", command: "vibecodr browser read <url>" },
  { purpose: "Save a page as a PDF", command: "vibecodr browser pdf <url> --local" },
  { purpose: "Crawl a few public pages", command: "vibecodr browser crawl <url>" },
  { purpose: "Run a command on the hosted computer", command: "vibecodr computer run \"<command>\"" },
  { purpose: "Run a test on the hosted computer", command: "vibecodr computer test" },
  { purpose: "Call any hosted tool directly", command: "vibecodr mcp call <tool> --input-json '{}'" },
  { purpose: "List saved proof from past runs", command: "vibecodr proof list" },
  { purpose: "Check remaining capacity", command: "vibecodr usage" }
];

export interface AgentHeadlessSetup {
  signIn: string;
  credentialStore: string;
  nonInteractive: string;
}

export const AGENT_HEADLESS_SETUP: AgentHeadlessSetup = {
  signIn: "vibecodr login agent --no-browser",
  credentialStore: "VC_TOOLS_CREDENTIAL_STORE=file",
  nonInteractive: "--non-interactive"
};

export interface AgentRecipePayload {
  description: string;
  cliCommands: AgentRecipeCommand[];
  headless: AgentHeadlessSetup;
}

// Stable machine-readable block embedded in `vibecodr status --json` and
// `vibecodr doctor --json` under the `agent` key, so a server-side agent can
// read the recipe directly.
export function agentRecipePayload(): AgentRecipePayload {
  return {
    description:
      "Drive Vibecodr's hosted tools by running these CLI commands directly; the CLI holds the credential, so no MCP client or browser is needed. Sign in headlessly with `vibecodr login agent --no-browser`.",
    cliCommands: AGENT_CLI_RECIPE.map((entry) => ({ ...entry })),
    headless: { ...AGENT_HEADLESS_SETUP }
  };
}

// Compact human block appended to `vibecodr doctor`. Kept short on purpose —
// the full recipe is always available in `--json` under the `agent` key.
export function agentRecipeHumanLines(): string[] {
  return [
    "Agent on a server (no browser)? Drive the hosted tools through the CLI — no MCP client needed:",
    ...AGENT_CLI_RECIPE.slice(0, 4).map((entry) => `  ${entry.command}`),
    `  ...full list in \`vibecodr doctor --json\` (the \"agent\" field).`,
    `Sign in once with no browser: \`${AGENT_HEADLESS_SETUP.signIn}\` (set \`${AGENT_HEADLESS_SETUP.credentialStore}\` first if there is no system keychain).`
  ];
}
