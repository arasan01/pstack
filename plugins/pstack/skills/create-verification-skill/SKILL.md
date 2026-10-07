---
name: create-verification-skill
description: "Generate a project-local verification skill that drives your app the way a user does — any language, framework, or platform. Use for /create-verification-skill, \"make a control skill for this repo\", \"make a driver skill for this repo\", or when a project has no scripted way to prove UI/CLI/service behavior."
---

# Create a verification skill

On Codex, read the [platform mapping](../poteto-mode/references/codex-tools.md), including its per-skill notes, before following this skill.

On GitHub Copilot, read the [platform mapping](../poteto-mode/references/copilot-tools.md), including its per-skill notes, before following this skill.

Generate a project-local `verify` skill that exercises the changed product through its real user or consumer entry points and captures evidence. Use the project skill path from the current runtime mapping; on Claude Code it is `.claude/skills/verify/`. At the repo root, `verify` replaces Claude Code's bundled user-only `/verify` so playbooks can invoke it ([Claude Code 2.1.200 or later](https://code.claude.com/docs/en/skills#run-and-verify-your-app)). In a monorepo, put it in the touched package directory. Write for the next agent reading it cold, not for a human who already knows the setup.

## 1. Interview the repo, not the user

Answer these from the codebase and only ask the user what you cannot observe:

- **Surface:** what does a user actually touch? A web UI, a CLI/TUI, a desktop app, an API, a mobile app, a library? A repo can have several; pick the primary one and note the rest.
- **Run:** how does the changed product run locally? Read the repo's build configuration and documented commands, whether package scripts, Makefile, Xcode project, Gradle project, or another toolchain. Note ports, env vars, seed data, auth, device/simulator requirements, and supported platforms. For a library, build it and run a small real consumer through its public API; there may be no app or server to launch.
- **Drive:** use existing project drivers and the session's supported tools first. Match the recipe to the product: browser automation for web or compatible Electron apps, native accessibility or platform automation for desktop/mobile apps, PTY helpers for CLI/TUI, real requests for services, or a consumer program for libraries. Do not assume CDP, a debug port, or JavaScript. If a necessary capability is unavailable, report it rather than generating unexecutable steps.
- **Observe:** what evidence can be captured? Screenshots, terminal transcripts, response bodies, logs, exit codes, DB state.
- **Isolate:** can two instances run side by side (ports, data dirs, profiles)? If not, say so in the generated skill: refusing to double-drive a shared instance beats corrupting the user's session.

If the checkout doesn't build or start as-is, fix that first (or report it precisely) before generating; a skill written against a broken base teaches wrong steps. When an irrelevant missing asset blocks startup (a static dir the API never serves, a sample config), the generated skill may create it, clearly marked as verification scaffolding, and remove it in cleanup.

## 2. Generate the skill

Write `SKILL.md` at the discovered project verification path with YAML frontmatter (`name: verify` and a `description` that names the product, its entry points, and when to use it). Frontmatter is required for discovery; do not set `disable-model-invocation`. Include these sections, grounded in the repo with no placeholders:

- **Launch:** the exact build/install and execution commands, plus readiness evidence such as a log line, response, prompt, or running app. Include teardown. For a short-lived CLI or TUI, start each drive in its own isolated session. For mobile/native apps, identify the device or simulator and installed build. For libraries, name the built artifact and consumer invocation instead of inventing a server.
- **Doctor:** a read-only check that the target is usable: the intended build/artifact, device, process, endpoint, or consumer dependencies are available. Check ownership and auth when relevant; do not require a port or server for a library. Run it first whenever anything looks off.
- **Drive:** the harness recipe with real selectors/commands from this repo, not examples. Prefer stable handles (ARIA labels, data attributes, prompt strings, route paths) over coordinates and tab order.
- **Evidence:** what to capture for a proof and where it goes. State the proof standards: exercise the real user path, not internal setters or test-only endpoints; capture the action and the resulting state, not just the final screen; verify side effects (files written, rows inserted, messages sent) alongside what's visible; mocks only where a production boundary already isolates the external system. When the safe path is a dry-run or test mode, verify what it actually skips by observing (files, network, git refs) rather than trusting its name: some dry-runs still touch the network or open a browser.
- **Cleanup:** how to tear down instances the run created. Never kill by process name; kill what you started. Cleanup removes instances and scratch state, never the evidence: proof artifacts survive the teardown, in a location the skill names.
- **Helpers:** any script the skill ships is executable and its invocation is shown in the skill body. A helper the reader has to reverse-engineer is not a helper.

## 3. Seed the feature map

Create `features/README.md` under the generated skill directory plus one file per user-facing or consumer-facing feature you can identify (start with the top 3-5 from routes, commands, menus, public APIs, or docs). Follow [`references/feature-map-example/`](references/feature-map-example/), with a README index and one file per feature. Describe what the feature is, how a user or consumer reaches it, how to exercise it, and the observable result that proves it works. The four H2s are `Sub-features`, `How to get to it (user POV)`, `Driving it with <harness>`, and `Gotchas`. For a library, the consumer's public API call is the user entry point. A proof of one convenient entry point is incomplete when the map lists others.

## 4. Prove the generated skill before handing it over

Run its own instructions end to end once: launch, doctor, drive ONE mapped feature (one is enough; the map exists so later runs can cover the rest), capture evidence, clean up. After cleanup, confirm the evidence still exists at the named location — a cleanup that eats the proof fails this step. Fix what fails, and run the generated cleanup after every failed iteration too, so broken attempts don't strand processes and ports. A generated skill that was never executed is a draft, not a deliverable.

## 5. Offer the maintenance loop

Point the user at `/maintain-verification-skill` for keeping the map honest as the app changes. Suggest a cadence only if they ask.
