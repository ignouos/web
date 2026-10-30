import { ORG, fetchRepositoryReadme } from "./github-api.js";
import { date, number } from "./dashboard.js";

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const repositoryUrl = (repo) => `https://github.com/${ORG}/${encodeURIComponent(repo.name)}`;
const externalLink = (href, text, className = "mini-link") => {
  const link = el("a", className, text); link.href = href; link.target = "_blank"; link.rel = "noopener noreferrer"; return link;
};

export function setRepoStatus(message, state = "loading") {
  const status = document.querySelector("#repoStatus");
  status.className = `api-status ${state === "loading" ? "" : state}`;
  status.replaceChildren();
  const spinner = el("span", "status-spinner"); spinner.setAttribute("aria-hidden", "true");
  const copy = el("span", "", message);
  status.append(spinner, copy);
}

export function renderLanguageOptions(repositories) {
  const select = document.querySelector("#languageFilter");
  const current = select.value || "All";
  const languages = [...new Set(repositories.map((repo) => repo.language || "Other"))].sort((a, b) => a.localeCompare(b));
  select.replaceChildren(new Option("All languages", "All"), ...languages.map((language) => new Option(language, language)));
  select.value = languages.includes(current) ? current : "All";
}

export function filteredRepositories(repositories) {
  const query = document.querySelector("#repoSearch").value.trim().toLowerCase();
  const language = document.querySelector("#languageFilter").value;
  const sort = document.querySelector("#sortFilter").value;
  return repositories.filter((repo) => `${repo.name || ""} ${repo.description || ""}`.toLowerCase().includes(query)
    && (language === "All" || (repo.language || "Other") === language))
    .sort((a, b) => {
      if (sort === "stars") return (b.stargazers_count || 0) - (a.stargazers_count || 0);
      if (sort === "forks") return (b.forks_count || 0) - (a.forks_count || 0);
      if (sort === "name") return a.name.localeCompare(b.name);
      return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
    });
}

export function renderRepositories(repositories, onSelect) {
  const grid = document.querySelector("#repoGrid");
  const empty = document.querySelector("#repoEmpty");
  const results = filteredRepositories(repositories);
  grid.replaceChildren();
  results.forEach((repo) => {
    const card = el("article", "repo-card");
    const top = el("div", "repo-top");
    const name = el("button", "repo-name", `${repo.name} ↗`); name.type = "button"; name.addEventListener("click", () => onSelect(repo));
    top.append(name);
    if (repo.archived) top.append(el("span", "repo-badge", "ARCHIVED"));
    const description = el("p", "repo-description", repo.description || "No description provided yet.");
    const meta = el("div", "repo-meta");
    [["◉", repo.language || "Other"], ["☆", number(repo.stargazers_count)], ["⑂", number(repo.forks_count)], ["↻", date(repo.updated_at)]].forEach(([icon, value]) => {
      const item = el("span", "", `${icon} `); const bold = el("b", "", value); item.append(bold); meta.append(item);
    });
    const actions = el("div", "repo-actions");
    const details = el("button", "mini-link", "Details"); details.type = "button"; details.addEventListener("click", () => onSelect(repo)); actions.append(details);
    const url = repositoryUrl(repo);
    actions.append(externalLink(url, "Repository ↗"));
    if (repo.has_issues && !repo.archived) {
      actions.append(externalLink(`${url}/issues`, "Issues ↗"));
      actions.append(externalLink(`${url}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`, "Good first issues ↗"));
    }
    card.append(top, description, meta, actions); grid.append(card);
  });
  const hasResults = results.length > 0;
  grid.classList.toggle("hidden", !hasResults);
  empty.classList.toggle("hidden", hasResults);
  document.querySelector("#repoEmptyTitle").textContent = repositories.length ? "No matching projects" : "No public projects yet";
  document.querySelector("#repoEmptyCopy").textContent = repositories.length ? "Try another search or adjust the language filter." : "When the organization has public repositories, they’ll appear here.";
  return results;
}

function dialogLink(href, label) {
  const link = el("a", "button button-glass", label); link.href = href; link.target = "_blank"; link.rel = "noopener noreferrer"; return link;
}

export async function showRepository(repo) {
  const dialog = document.querySelector("#repoDialog");
  const content = document.querySelector("#dialogContent"); content.replaceChildren();
  const details = el("div", "dialog-project");
  details.append(el("div", "dialog-project-mark", "</>"));
  const title = el("h2", "", repo.name); title.id = "dialogTitle";
  details.append(title, el("p", "", repo.description || "No description provided yet."));
  const meta = el("div", "dialog-meta");
  [["Language", repo.language || "Other"], ["Stars", number(repo.stargazers_count)], ["Forks", number(repo.forks_count)], ["Updated", date(repo.updated_at)], ["Created", date(repo.created_at)]].forEach(([label, value]) => meta.append(el("span", "", `${label} · ${value}`)));
  details.append(meta);
  if (Array.isArray(repo.topics) && repo.topics.length) {
    const topics = el("div", "dialog-topics"); repo.topics.forEach((topic) => topics.append(el("span", "", topic))); details.append(topics);
  }
  const links = el("div", "dialog-links");
  const url = repositoryUrl(repo);
  links.append(dialogLink(url, "Open repository ↗"));
  if (repo.has_issues && !repo.archived) {
    links.append(dialogLink(`${url}/issues`, "Browse issues ↗"));
    links.append(dialogLink(`${url}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`, "Good first issues ↗"));
  }
  if (repo.homepage && /^https?:\/\//i.test(repo.homepage)) links.append(dialogLink(repo.homepage, "Live project ↗"));
  details.append(links);
  const readmeLabel = el("div", "dialog-section-label", "PROJECT README");
  const readme = el("div", "dialog-readme", "Loading README preview…"); details.append(readmeLabel, readme);
  content.append(details); dialog.showModal();
  try {
    const text = await fetchRepositoryReadme(repo.name);
    if (dialog.open && document.querySelector("#dialogTitle")?.textContent === repo.name) readme.textContent = text ? text.replace(/^#{1,6}\s+/gm, "").slice(0, 3500) : "README preview is unavailable. Open the repository to read its documentation.";
  } catch { if (dialog.open) readme.textContent = "README preview could not be loaded. Open the repository to read its documentation."; }
}

export { ORG };
