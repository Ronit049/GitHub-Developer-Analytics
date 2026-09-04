# GitHub Developer Analytics

A fast, privacy-conscious dashboard for exploring the public footprint of any GitHub developer. Enter a username to see profile signals, repository performance, language preferences, and recent public activity in one place.

![GitHub Developer Analytics dashboard](https://img.shields.io/badge/data-GitHub%20REST%20API-181717?logo=github&logoColor=white)
![No build step](https://img.shields.io/badge/setup-zero%20build%20step-C7F255?labelColor=101315)

## Features

- **Profile overview** — display name, avatar, followers, following, and public repository count.
- **Repository signals** — total stars and forks across the developer's public repositories.
- **Language breakdown** — primary languages ranked by the number of public repositories that use them.
- **Activity pulse** — a lightweight 0–100 score based on repositories updated in the last 90 days and recent public GitHub events.
- **Popular projects** — the five repositories with the strongest star and fork signals.
- **Thoughtful states** — clear loading, missing-profile, and GitHub API rate-limit feedback.
- **Responsive interface** — designed to work cleanly on desktop and mobile screens.

## How it works

```text
GitHub username
      |
      v
GitHub REST API
  ├── /users/{username}
  ├── /users/{username}/repos
  └── /users/{username}/events/public
      |
      v
Profile, repository, language, and activity analytics
```

The application runs entirely in the browser. It requests only publicly available GitHub data and never asks users to sign in or provide an access token.

## Run locally

This is a dependency-free static website. Open `index.html` directly in a browser, or serve the folder with any static web server.

For example, with Node.js:

```bash
npx serve .
```

Then open the address printed by the server and enter a public GitHub username, such as `ronit-raj`.

## Project structure

```text
.
├── index.html   # Page structure and dashboard sections
├── styles.css   # Responsive visual system and component styles
├── app.js       # GitHub API client, analytics calculations, and rendering
└── README.md
```

## Metric notes

| Metric | Calculation |
| --- | --- |
| Total stars | Sum of stars on the public repositories returned by GitHub. |
| Total forks | Sum of forks on the public repositories returned by GitHub. |
| Top languages | Repository primary languages, grouped and ranked by repository count. |
| Activity pulse | A 0–100 public signal using repos pushed within 90 days and recent public events. |
| Popular repositories | Ranked by stars, with forks used to break ties. |

GitHub returns at most 100 repositories per request. For accounts with more than 100 public repositories, the dashboard clearly indicates how many were analyzed.

## GitHub API limits

Unauthenticated browser requests are subject to GitHub's public API rate limit. If the limit is reached, wait for it to reset and try again. For a production deployment with heavier traffic, add a small server-side proxy and authenticate it with a GitHub token stored securely in environment variables—never in browser code.

## Deploy

The site is ready for any static host, including GitHub Pages, Netlify, or Vercel. On GitHub Pages, publish the `main` branch from the repository root.

## License

This project is available under the [MIT License](LICENSE).


---

## 🤝 Connect With Me

<p align="center">
  <a href="https://github.com/YOUR_USERNAME">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" />
  </a>
  <a href="YOUR_LINKEDIN_URL">
    <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" />
  </a>
  <a href="YOUR_PORTFOLIO_URL">
    <img src="https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  </a>
</p>

---

<p align="center">
  ⭐ If you found this repository useful, consider giving it a star!
</p>

<p align="center">
  <b>Keep Learning • Keep Building • Keep Growing 🚀</b>
</p>

<p align="center">
  Made with ❤️ by <b>YOUR NAME</b>
</p>
