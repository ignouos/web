import { ORG } from "./github-api.js";

const number = (value) => new Intl.NumberFormat("en", { notation: value >= 1000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value || 0);
const date = (value) => {
  if (!value) return "Unknown";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "Unknown" : parsed.toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
};

export function renderDashboard(repositories) {
  const stars = repositories.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
  const forks = repositories.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
  const languages = new Map();
  repositories.forEach((repo) => {
    const language = repo.language || "Other";
    languages.set(language, (languages.get(language) || 0) + 1);
  });
  const sorted = [...languages.entries()].sort((a, b) => b[1] - a[1]);
  document.querySelector("#statRepos").textContent = number(repositories.length);
  document.querySelector("#statStars").textContent = number(stars);
  document.querySelector("#statForks").textContent = number(forks);
  document.querySelector("#statLanguages").textContent = String(languages.size);
  document.querySelector("#heroRepoCount").textContent = repositories.length ? `${number(repositories.length)} public projects` : "Community projects";

  const bars = document.querySelector("#languageBars");
  bars.replaceChildren();
  if (!sorted.length) {
    const empty = document.createElement("p"); empty.className = "muted"; empty.textContent = "No public repository language data available yet."; bars.append(empty);
  } else sorted.slice(0, 7).forEach(([language, count]) => {
    const row = document.createElement("div"); row.className = "language-row";
    const top = document.createElement("div"); top.className = "language-row-top";
    const label = document.createElement("span"); label.textContent = language;
    const total = document.createElement("span"); total.textContent = `${count} ${count === 1 ? "project" : "projects"}`;
    top.append(label, total);
    const track = document.createElement("div"); track.className = "language-track";
    const fill = document.createElement("div"); fill.className = "language-fill"; fill.style.width = `${Math.max(4, count / repositories.length * 100)}%`;
    track.append(fill); row.append(top, track); bars.append(row);
  });

  const recent = [...repositories].sort((a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at)).slice(0, 5);
  const list = document.querySelector("#recentRepos"); list.replaceChildren();
  if (!recent.length) {
    const empty = document.createElement("p"); empty.className = "muted"; empty.textContent = "No public projects to display yet."; list.append(empty);
  } else recent.forEach((repo) => {
    const row = document.createElement("div"); row.className = "recent-item";
    const link = document.createElement("a"); link.href = `https://github.com/${ORG}/${encodeURIComponent(repo.name)}`; link.target = "_blank"; link.rel = "noopener noreferrer"; link.textContent = `${repo.name} ↗`;
    const time = document.createElement("time"); time.dateTime = repo.pushed_at || repo.updated_at || ""; time.textContent = date(repo.pushed_at || repo.updated_at);
    row.append(link, time); list.append(row);
  });
}

export { number, date };
