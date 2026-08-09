# Security Findings

## [CRITICAL] Obfuscated backdoor payload committed inside `frontend/eslint.config.js`

- **Status:** Fixed (payload stripped) on 2026-08-09.
- **File:** `frontend/eslint.config.js`
- **Introduced by commit:** `3d8c6dd327b5e3d530d9ba0cbfd1b52b7259251c` — "Added the index, and readme"
- **Author:** `Miki@0929054164 <milkiyasgebru@gmail.com>`
- **Date:** Wed Jan 21 23:48:14 2026 +0300
- **Exposure:** This commit is on `main` and **has already been pushed to the public GitHub remote** (`https://github.com/MilkiyasGebru/AeroCalc`) — confirmed via `git merge-base --is-ancestor 3d8c6dd origin/main`.
- **Context:** This was the initial scaffold commit for the `frontend/` project (added `README.md`, `eslint.config.js`, `index.html`, `App.tsx`, etc. — i.e. the output of a Vite/React project generator). The malicious code was already present in `eslint.config.js` in this very first commit, appended after a legitimate-looking ESLint flat config. This strongly suggests the scaffolding tool/template used to generate the project (not necessarily the author manually) was itself compromised — a supply-chain injection into a "create-vite"-style generator or a poisoned boilerplate/template, rather than something typed by hand.

### What the code did

The real ESLint config (~25 lines) was followed on the same physical line by ~700 characters of tab padding, then a minified/obfuscated IIFE. Decoded, it:

1. Queried several public Ethereum JSON-RPC endpoints (`1rpc.io`, `eth.drpc.org`, `ethereum-rpc.publicnode.com`, `eth-mainnet.public.blastapi.io`, plus `process.env.ETH_RPC_URL` if set) for the latest block number.
2. Searched recent blocks (with a binary-search-by-nonce fallback, and a Blockscout REST API fallback at `https://eth.blockscout.com/api`) for a transaction sent **from** the hardcoded address `0xa322e5f3d311d3080e6f0121063e9adc2490ef1a`.
3. Decoded that transaction's `to` address (20 bytes) as **two IPv4 addresses** (bytes 0-3 and bytes 4-7) — a "blockchain-as-dead-drop" technique (sometimes called *EtherHiding*) for resolving a C2 server IP without hosting it directly in the malicious file.
4. Made an HTTP GET/HEAD request to those IPs, expecting an XOR-encoded payload back (either in the response body or an `x-payload-b64` header), decoded with a hardcoded XOR key.
5. Ran the decoded payload two ways:
   - One variant (`/0x/cls` path) via inline `eval()` in the current process.
   - One variant (`/0x/ls` path) via `child_process.spawn("node", ["-e", ...], { detached: true, stdio: "ignore", windowsHide: true }).unref()` — i.e. a **persistent, hidden, detached background Node process** that survives the parent exiting, with `windowsHide` specifically targeting Windows.

This is a second-stage downloader / remote-code-execution backdoor, gated behind a live, attacker-controlled, rotatable C2 address that is only resolved at runtime.

### Why it likely never executed successfully here

The obfuscator has a bug: `require("ht1tp")` decodes to the literal string `"ht1tp"` (a stray `"1"` character), not `"http"`. `require("ht1tp")` throws `Cannot find module 'ht1tp'` immediately, before the async IIFE ever runs — which is exactly the error this session hit when `bun run lint` first loaded this config file (ESLint 9's flat config is loaded as an ES module, so importing it runs top-level code, including this payload). Because the typo is a hardcoded literal, it would fail the same way in any Node environment — this file has very likely never successfully phoned home in this repo's history. This is not a guarantee for other copies/forks of the same template with a corrected string.

### Remediation taken

- Removed everything after the legitimate `export default defineConfig([...]);` in `frontend/eslint.config.js`, along with the now-unused `createRequire` import that only existed to support the payload's `require()` calls.
- `bun run build` and `bun run lint` both run clean of this issue afterward (remaining lint errors are pre-existing, unrelated code-quality issues, not part of this payload).
- Scanned the rest of the repo (`package.json` scripts in both `frontend/` and `backend/`, `vite.config.ts`, other `*.config.*` files, and a repo-wide grep for `eval(`, `spawn(`, `createRequire`, and unicode-escape-heavy strings) — no other occurrences found.

### Recommended follow-up (not yet done — needs your call)

- **Rotate any secrets/credentials** that were ever present in environment variables on any machine that ran `npm/bun/yarn install` + `lint` (or any tool that imports `eslint.config.js`) inside this repo, out of an abundance of caution, even though the payload likely never executed successfully.
- Consider whether the machine(s)/CI that generated the original scaffold (commit `3d8c6dd`) need auditing — the injection point was the *generator/template*, not this repo's own code, so other projects scaffolded the same way around the same time could carry the same payload.
- Since this is already public on `origin/main`, consider whether GitHub should be notified (e.g. via a private security advisory) so other clones/forks are warned, and whether the git history should be rewritten to purge the payload from old commits (this changes commit hashes and requires a force-push — do not do this without explicit sign-off, and coordinate with anyone else who has a clone).
