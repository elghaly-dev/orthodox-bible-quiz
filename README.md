# Orthodox Bible Quiz

A small offline Bible quiz page in Arabic and English, by elghaly.

- Multiple-choice questions, one right answer each.
- The verse reference is shown after every answer.
- Score at the end.
- No accounts, no tracking, no outside requests.

Arabic wording follows the public-domain Van Dyck translation. English wording follows the public-domain KJV.

## Use

Open the page from any static host (for example GitHub Pages), or on a computer run
`python3 -m http.server` in this folder and open `localhost:8000`. After the first visit
on a secure host, a small service worker keeps the files for use with no signal.

## Files

| file | what |
|---|---|
| `index.html`, `style.css`, `app.js` | the page |
| `quiz-core.js` | scoring and question checks (used by the page and the tests) |
| `questions.json` | the question bank (edit this) |
| `questions.js` | generated from `questions.json` by `node scripts/build.js` |
| `sw.js` | offline cache, same-origin only |

## Questions

Each question has an `id`, a `section` (`ot`, `gospels`, `acts_epistles`), Arabic and English text,
3 or 4 options per language in the same order, one `answer` index, and a verse reference.
After editing `questions.json`, run `node scripts/build.js`, then `node --test`.

## Licences

- Code: MIT (see `LICENSE`).
- Questions are newly written. Arabic wording follows the Van Dyck translation (public domain);
  English wording follows the King James Version (public domain).
- Psalm numbers follow the Hebrew numbering used by Van Dyck and KJV.
