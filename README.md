# Opus 5.5 vs The Password Game

Claude Code (`claude-opus-5-5`) finished all 35 rules of [The Password Game](https://neal.fun/password-game/) plus the final retype, with no human help. It drove headed Chromium through Playwright over CDP.

**Result:** the game showed *"Congratulations! You have sucessfully chosen a password in 101 characters."* (`screenshots/complete.png`)

**Video:** https://www.youtube.com/watch?v=FT890KqC44Q

## Statistics
| Metric | Value |
|---|---|
| Rules completed | 35/35 + final retype |
| Time | 955 s (~16 min) |
| Model calls / tool calls | 74 / 73 |
| Output tokens | 58.8k |
| Input tokens (cache read / write) | 6.75M / 110k |
| Major failures recovered | 6 |
| Final password length | 101 characters |

## Hard parts
- **Bold vowels:** the game also counts `y` as a vowel.
- **Fire:** a script removed the 🔥 and restored the burned characters.
- **Paul (rule 23):** a background feeder kept 🐛 in the password.
- **Time rule:** time digits broke the digit sum of 25. Fixed by switching to an 8:29 video whose ID has no digits.
- **Final retype:** formatting has to match as well as the text. A script copied it over.

## Files
- `prompt.md`: the original prompt
- `benchmark.md`: per-rule log
- `session_log.md`: cleaned session log
- `scripts/`: all scripts (`g.js` is the step driver)
- `screenshots/`, `logs/`
