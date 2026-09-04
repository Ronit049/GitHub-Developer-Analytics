const apiBase = "https://api.github.com";
const elements = {
  form: document.querySelector("#search-form"),
  input: document.querySelector("#username"),
  empty: document.querySelector("#empty-state"),
  loading: document.querySelector("#loading-state"),
  error: document.querySelector("#error-state"),
  errorTitle: document.querySelector("#error-title"),
  errorMessage: document.querySelector("#error-message"),
  dashboard: document.querySelector("#dashboard"),
};

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const fullNumber = new Intl.NumberFormat("en");

function show(state) {
  [elements.empty, elements.loading, elements.error, elements.dashboard].forEach((node) => node.classList.add("hidden"));
  elements[state].classList.remove("hidden");
}

async function request(path) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.message || "GitHub could not complete this request.");
    error.status = response.status;
    throw error;
  }
  return response.json();
}

function updateText(id, value, formatter = compact) {
  document.querySelector(id).textContent = formatter.format(value || 0);
}

function renderLanguages(repositories) {
  const counts = repositories.reduce((result, repo) => {
    if (repo.language) result[repo.language] = (result[repo.language] || 0) + 1;
    return result;
  }, {});
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const list = document.querySelector("#languages-list");
  if (!entries.length) {
    list.innerHTML = '<p class="no-data">No primary languages reported yet.</p>';
    return;
  }
  const max = entries[0][1];
  list.innerHTML = entries.map(([language, count]) => {
    const percent = Math.round((count / repositories.length) * 100);
    const width = Math.max(12, Math.round((count / max) * 100));
    return `<div class="language-row"><span class="language-name">${escapeHtml(language)}</span><span class="language-track"><span class="language-fill" style="width:${width}%"></span></span><span class="language-pct">${percent}%</span></div>`;
  }).join("");
}

function renderRepositories(repositories) {
  const list = document.querySelector("#repositories-list");
  const popular = [...repositories]
    .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (b.forks_count - a.forks_count))
    .slice(0, 5);
  if (!popular.length) {
    list.innerHTML = '<p class="no-data">No public repositories to display.</p>';
    return;
  }
  list.innerHTML = popular.map((repo, index) => `
    <div class="repository-row">
      <span class="repo-rank">0${index + 1}</span>
      <a class="repo-name" href="${repo.html_url}" target="_blank" rel="noreferrer">${escapeHtml(repo.name)}</a>
      <span class="repo-language">${escapeHtml(repo.language || "No language")}</span>
      <span class="repo-stat"><span>★</span> ${compact.format(repo.stargazers_count)}</span>
      <span class="repo-stat">⑂ ${compact.format(repo.forks_count)}</span>
    </div>`).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function activityData(repositories, events) {
  const now = Date.now();
  const ninetyDays = 90 * 24 * 60 * 60 * 1000;
  const activeRepos = repositories.filter((repo) => now - new Date(repo.pushed_at).getTime() < ninetyDays).length;
  const publicEvents = events.filter((event) => now - new Date(event.created_at).getTime() < ninetyDays).length;
  const score = Math.min(100, Math.round((activeRepos / Math.max(repositories.length, 1)) * 55 + Math.min(publicEvents, 45)));
  return { activeRepos, publicEvents, score };
}

function renderProfile(profile, repositories, events) {
  const stars = repositories.reduce((total, repo) => total + repo.stargazers_count, 0);
  const forks = repositories.reduce((total, repo) => total + repo.forks_count, 0);
  const activity = activityData(repositories, events);
  const displayName = profile.name || profile.login;

  const avatar = document.querySelector("#avatar");
  avatar.src = profile.avatar_url;
  avatar.alt = `${displayName}'s avatar`;
  document.querySelector("#display-name").textContent = displayName;
  const profileUrl = document.querySelector("#profile-url");
  profileUrl.href = profile.html_url;
  profileUrl.textContent = `@${profile.login} ↗`;
  updateText("#total-stars", stars, fullNumber);
  updateText("#repo-count", profile.public_repos, fullNumber);
  document.querySelector("#repo-count-note").textContent = `${fullNumber.format(repositories.length)} analyzed`;
  updateText("#followers", profile.followers, fullNumber);
  document.querySelector("#following").textContent = `Following ${fullNumber.format(profile.following)}`;
  updateText("#total-forks", forks, fullNumber);
  updateText("#activity-score", activity.score, fullNumber);
  document.querySelector("#activity-bar").style.width = `${activity.score}%`;
  updateText("#active-repos", activity.activeRepos, fullNumber);
  updateText("#recent-events", activity.publicEvents, fullNumber);
  document.querySelector("#activity-caption").textContent = activity.score > 65 ? "Strong recent public activity" : activity.score > 30 ? "Steady public activity" : "A quieter public activity signal";
  renderLanguages(repositories);
  renderRepositories(repositories);
}

async function analyze(username) {
  const cleanUsername = username.trim().replace(/^@/, "");
  if (!cleanUsername) return;
  show("loading");
  try {
    const [profile, repositories, events] = await Promise.all([
      request(`/users/${encodeURIComponent(cleanUsername)}`),
      request(`/users/${encodeURIComponent(cleanUsername)}/repos?per_page=100&sort=updated&type=owner`),
      request(`/users/${encodeURIComponent(cleanUsername)}/events/public?per_page=100`),
    ]);
    renderProfile(profile, repositories, events);
    show("dashboard");
    history.replaceState({}, "", `?user=${encodeURIComponent(profile.login)}`);
  } catch (error) {
    elements.errorTitle.textContent = error.status === 404 ? "Couldn’t find that profile" : "GitHub API is unavailable";
    elements.errorMessage.textContent = error.status === 404
      ? "Check the username and try again."
      : error.message.includes("rate limit")
        ? "GitHub’s anonymous API limit was reached. Please try again in a few minutes."
        : "Please check your connection and try again.";
    show("error");
  }
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  analyze(elements.input.value);
});

const initialUser = new URLSearchParams(window.location.search).get("user");
if (initialUser) {
  elements.input.value = initialUser;
  analyze(initialUser);
}
