# Password Game benchmark
start_epoch: 1794259683

| Rule | t+sec | attempts | note |
|---|---|---|---|
| 1 | 73 | 1 | |
| 2 | 73 | 1 | |
| 3 | 73 | 1 | |
| 4 | 73 | 1 | |
| 5 | 73 | 1 | |
| 6 | 73 | 1 | |
| 7 | 73 | 1 | |
| 8 | 73 | 1 | |
| 9 | 73 | 1 | |
| 10 | 73 | 1 | |
| 11 | 89 | 1 | wordle 'truce' via NYT API |
| 12 | 97 | 0 | passed implicitly (He) |
| 13 | 104 | 1 | moon age 29.5d -> new moon |
| 14 | 126 | 1 | street view -> finland |
| 15 | 132 | 1 | leap year 0 |
| 16 | 163 | 1 | chess Qxc6+ (solved from screenshot); digits 997->937 |
| 17 | 189 | 1 | egg at index 0 |
| 18 | 267 | 1 | elements He,V,Hg,Ge,Ne,I = 200 |
| 19 | 267 | 3 | FAIL: bold only applied to 2 vowels (ProseMirror selection sync) -> added delay; FAIL: y counts as vowel -> bolded y |
| 20 | 267 | 1 | fire in pepsi; wrote fix.js (removes fire, restores target text) |
| 21 | 424 | 2 | weightlifters x3 (state lagged one refresh) |
| 22 | 424 | 0 | affirmation already present |
| 23 | 424 | 1 | Paul hatched; background feeder.js keeps 6 worms under shared lock |
| 24 | 424 | 1 | yt-dlp search -> youtu.be/Zqno_vux6d8 (509s); digits 937->5 |
| 25 | 446 | 1 | sacrificed J,W (unused; kept a-f for hex) |
| 26 | 493 | 1 | select-all italic |
| 27 | 493 | 1 | select-all Wingdings |
| 28 | 512 | 1 | screenshot pixel sample -> #bdcec2; slot 5->3 |
| 29 | 529 | 1 | Times New Roman on [MDCLXVI]+ runs |
| 30 | 555 | 1 | per-digit size = d^2 (size select became index 0) |
| 31 | 607 | 1 | sizes cmd: k-th instance of each letter gets k-th size (48 ops) |
| 32 | 783 | 2 | FAIL: digit budget too tight for rule 35 time -> swapped video to bG0tmiIvgKA (digits 0), block HgGeNe->Sn; length counted in graphemes |
| 33 | 783 | 1 | prime 97; only fails transiently when Paul eats a worm |
| 34 | 783 | 1 | passed on reveal |
| 35 | 955 | 1 | tick.js keeps time 03:12, slot 9, length 101 (prime); all 35 green at once |
| 36 (final) | 955 | 2 | clicked Yes; retype: plain text FAILED (formatting must match) -> copyfmt.js copied bold/italic/font/size runs -> "Congratulations! You have sucessfully chosen a password in 101 characters." |

## Summary
- Highest rule: 35/35 + final retype; game confirmed completion.
- Total wall time: 955s (~15 min).
- Final password (101 graphemes): 🐔🐛🐛🐛🐛🐛🐛Hello!may9XXXVpepsidbfentruce🌑03:12finland0Qxc6+SnI am loved🏋️‍♂️🏋️‍♂️🏋️‍♂️youtu.be/bG0tmiIvgKA#bdcec2!101
- Failures/recoveries: bold toggles lost (selection sync delay); y counts as vowel; fire repaired by fix.js; rule 21 state lag; digit budget re-plan for time rule (video swap + element block swap); retype needed formatting copy.
