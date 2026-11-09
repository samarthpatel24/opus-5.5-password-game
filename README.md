# Opus 5.5 vs The Password Game

Claude Code (model `claude-opus-5-5`) completed all 35 rules of https://neal.fun/password-game/ plus the final retype, autonomously, using headed Chromium driven over CDP with Playwright.

**Result:** the game confirmed *"Congratulations! You have sucessfully chosen a password in 101 characters."* (`screenshots/complete.png`)

## Statistics
Computed from the raw session transcript (not committed).

| Metric | Value |
|---|---|
| Rules completed | 35/35 + final confirmation + retype |
| Wall time (start epoch to completion) | 955 s (about 16 min) |
| Session span (first to last transcript entry) | 21:27:56 to 21:47:19 UTC (includes this packaging step) |
| Model API calls | 74 |
| Tool calls | 73 |
| Output tokens | 58,797 |
| Uncached input tokens | 152 |
| Cache-read input tokens | 6,749,172 |
| Cache-write input tokens | 110,222 |
| Date | 2026-11-10 (IST), around 03:00 local |

## Final password (101 graphemes)
`🐔🐛🐛🐛🐛🐛🐛Hello!may9XXXVpepsidbfentruce🌑03:12finland0Qxc6+SnI am loved🏋️‍♂️🏋️‍♂️🏋️‍♂️youtu.be/bG0tmiIvgKA#bdcec2!101`

## How the puzzles were solved
- **CAPTCHA, Street View, chess:** read from screenshots. The CAPTCHA was "dbfen", the scene was Finland, and the best move was Qxc6+ (bxc6, then Ba6 mate).
- **Wordle:** "truce", taken from the NYT Wordle API.
- **Moon phase:** calculated as a new moon 🌑.
- **YouTube video of 8:29:** found with yt-dlp search, filtering video IDs by their digits, roman numerals, element symbols and sacrificed letters.
- **Hex color:** read by sampling pixels from a screenshot of the swatch.
- **Paul (rule 23):** a background feeder (`scripts/feeder.js`) kept 6 🐛 in the password.
- **Time (rule 35):** a background script (`scripts/tick.js`) kept the time, a digit slot (to hold the digit sum at 25) and a prime length in step.
- Both helpers share a mkdir lock with the step scripts, so only one process types at a time.

## Failures and recoveries
1. **Bold vowels:** the first pass bolded only 2 of 16 vowels because the editor hadn't registered the selection. A short delay fixed it. The game also counts **y** as a vowel.
2. **Fire:** `scripts/fix.js` removed the 🔥 and restored the burned characters.
3. **Rule 21:** the state lagged by one refresh, then the rule passed with no change.
4. **Digit sum vs. time:** the first video ID had digits adding to 14, leaving no room for the time digits. Swapping to `bG0tmiIvgKA` (digit sum 0) and changing the element group HgGeNe→Sn kept atomic numbers at 200.
5. **Length counting:** the game counts visible characters (🏋️‍♂️ counts as 1), learned from its own character counter.
6. **Retype:** plain text was rejected because formatting must match too. `scripts/copyfmt.js` copied bold, italic, font and size from the original.

## Layout
- `prompt.md`: the beginning prompt, verbatim.
- `benchmark.md`: per-rule log written during the run (rule, seconds since start, attempts, notes).
- `scripts/`: every script used.
  - `g.js` is the step driver: state, type, replace, rep, fmt, opt, sizes, shot, eval.
  - `peek*.js` were the first page probes.
- `screenshots/`: milestone and puzzle screenshots.
- `session_log.md`: sanitized session log (prompts, messages, tool calls, truncated results; private context removed).
- `logs/feeder.log`, `logs/tick.log`: logs from the background helpers. `logs/ids.txt` holds the YouTube candidates; `logs/start_time` holds the start epoch.

## Caveats
- Some rules in `benchmark.md` share a timestamp because they were logged in batches.
- Screenshots exist for rules 10, 14, 16, 25 and 35 and for the final stages, not for every rule.
- The answers depend on the date: the Wordle, moon phase and time are for 2026-11-10, and the CAPTCHA, country, chess position and color are random each game.

## Reproduce
```
npm i playwright
"<chromium>" --remote-debugging-port=9222 --remote-debugging-address=127.0.0.1 --user-data-dir=./profile https://neal.fun/password-game/
node scripts/g.js state
```
