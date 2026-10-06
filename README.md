# Welcome to your organization's demo respository
This code repository (or "repo") is designed to demonstrate the best GitHub has to offer with the least amount of noise.

The repo includes an `index.html` file (so it can render a web page), two GitHub Actions workflows, and a CSS stylesheet dependency.

## Newsletter

The home page has a newsletter sign-up with double opt-in: an address is stored as
pending, receives a signed confirmation link, and only gets the newsletter once it
is confirmed. Links expire after `CONFIRM_TTL_HOURS` (48 by default), and each IP
address can sign up `SIGNUPS_PER_HOUR` times an hour (5 by default).

Set `NEWSLETTER_SECRET` and `CONFIRM_URL_BASE` (see `.env.example`), then apply
`db/migrations/001_subscribers.sql`.

```sh
npm install
npm test
```
