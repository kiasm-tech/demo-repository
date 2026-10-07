# Welcome to your organization's demo respository
This code repository (or "repo") is designed to demonstrate the best GitHub has to offer with the least amount of noise.

The repo includes an `index.html` file (so it can render a web page), two GitHub Actions workflows, and a CSS stylesheet dependency.

## Opening hours

The home page says whether the shop is open right now and when it next opens or closes, always in
the shop's time zone (`src/hours/`). Hours and holiday closures live in `src/hours/schedule.ts`.

```sh
npm install
npm test        # vitest
npm run build   # compiles src/ to dist/, which index.html loads
```
