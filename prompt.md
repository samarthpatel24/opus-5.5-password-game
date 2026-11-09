# Beginning prompt (verbatim)

Your challenge is to autonomously complete all 35 rules of **The Password Game**: https://neal.fun/password-game/

Use browser automation (Playwright or available browser tools) to interact with the actual website.

**Rules:**
- No human assistance, hints, or manual intervention.
- Do not inspect the game's source code, hidden state, or internal validation logic.
- You may write scripts and use external tools to solve individual puzzles.
- Maintain all previously satisfied rules as new rules appear.
- Independently plan, execute, debug, and recover from failures.
- Do not bypass, modify, or exploit the game's rules.

**Benchmark requirements:**
- Record every rule reached, major failure, and recovery attempt.
- Track total execution time and approximate token usage.
- Save screenshots at meaningful milestones.
- Continue until you complete the game or reach a genuine blocker.

**Setup (process only):**
1. Browser must run HEADED so I can watch live. Do NOT build an HTTP/eval server to drive the page (the permission classifier blocks it as an RCE surface). Instead:
   - Install Playwright in your scratchpad (`npm i playwright`); browsers are already cached in ~/Library/Caches/ms-playwright.
   - Launch the cached Chromium binary directly as a background task with `--remote-debugging-port=9222 --remote-debugging-address=127.0.0.1 --user-data-dir=<scratchpad>/profile --window-position=0,0 https://neal.fun/password-game/`.
   - Each step is a short Node script that does `chromium.connectOverCDP('http://127.0.0.1:9222')`, acts, then `process.exit(0)`. Never call browser.close(); it kills the shared browser.
2. Concurrency: any background helper you write (e.g. one that keeps the password state alive while you think) must share a mkdir-based lock with your step scripts so two processes never type into the editor at once.
3. Editing safety: once the password contains something that must never be deleted, stop using select-all + delete. Select and replace only the ranges around it, using DOM Selection ranges over the editor's text nodes (counted in UTF-16 offsets, since emoji are 2+ units). Formatting toggles via keyboard shortcuts (Meta+B etc.) apply to typed characters.
4. Benchmark log: run `date +%s` first and save the start time. Keep <scratchpad>/benchmark.md updated with one line per rule reached (rule #, wall-clock time, attempts) and every failure + recovery. Save a PNG screenshot at each new rule.
5. Final report: highest rule reached, whether the game confirmed completion, total time, approximate tokens, and key difficulties.
6. Give me a one-line status at each new rule. Don't stop to ask questions.

**Goal:** Finish all 35 rules autonomously.

Start immediately. Do not ask me for guidance.
