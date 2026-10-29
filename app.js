(() => {
  "use strict";
  const ORG = "ignouos";
  const API = "https://api.github.com";
  const CACHE_KEY = "open-source-ignou-repos-v1";
  const CACHE_TTL = 10 * 60 * 1000;
  const REQUEST_TIMEOUT = 15000;
  const $ = (selector) => document.querySelector(selector);
  const repoGrid = $("#repoGrid");
  const repoStatus = $("#repoStatus");
  const repoEmpty = $("#repoEmpty");
  const searchInput = $("#repoSearch");
  const languageFilter = $("#languageFilter");
  const refreshButton = $("#refreshRepos");
  let repositories = [];
  let isLoading = false;

  $("#year").textContent = new Date().getFullYear();

  const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));

  const compactNumber = (number) => new Intl.NumberFormat("en", { notation: number >= 1000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(number || 0);
  const dateLabel = (value) => {
    if (!value) return "Unknown";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return date.toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
  };

  function setStatus(message, state = "loading") {
    repoStatus.className = `api-status ${state === "loading" ? "" : state}`;
    repoStatus.innerHTML = state === "loading"
      ? `<span class="status-spinner"></span>${escapeHTML(message)}`
      : `<span class="status-spinner"></span>${escapeHTML(message)}`;
  }

  function readCache() {
    try {
      const item = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      const valid = item && Number.isFinite(item.savedAt) && Array.isArray(item.data)
        && item.data.every((repo) => repo && typeof repo.name === "string");
      return valid ? item : null;
    } catch { return null; }
  }
  function writeCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data })); } catch { /* optional cache */ }
  }

  async function fetchRepos(force = false) {
    const cache = readCache();
    if (!force && cache && Date.now() - cache.savedAt >= 0 && Date.now() - cache.savedAt < CACHE_TTL) {
      repositories = cache.data;
      renderAll();
      setStatus(`Loaded ${repositories.length} public ${repositories.length === 1 ? "repository" : "repositories"} · cached recently`, "success");
      return;
    }
    if (isLoading) return;
    isLoading = true;
    refreshButton.disabled = true;
    refreshButton.style.opacity = ".65";
    setStatus("Connecting to GitHub…");
    try {
      const data = [];
      let page = 1;
      while (true) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
        let response;
        let pageData;
        try {
          response = await fetch(`${API}/orgs/${ORG}/repos?sort=updated&per_page=100&page=${page}`, {
            headers: { Accept: "application/vnd.github+json" },
            signal: controller.signal
          });
          if (response.ok) pageData = await response.json();
        } catch (error) {
          if (error.name === "AbortError") throw new Error("GitHub took too long to respond. Please retry.");
          throw error;
        } finally {
          clearTimeout(timeout);
        }
        if (!response.ok) {
          if (response.status === 403 || response.status === 429) {
            const reset = response.headers.get("x-ratelimit-reset");
            const retryTime = reset ? new Date(Number(reset) * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "later";
            throw new Error(`GitHub's public API limit was reached. Please try again ${retryTime === "later" ? "later" : `after ${retryTime}`}.`);
          }
          if (response.status === 404) throw new Error(`The public organization "${ORG}" could not be found. Check the organization name or its visibility.`);
          throw new Error(`GitHub returned an error (${response.status}). Please try again.`);
        }
        if (!Array.isArray(pageData) || !pageData.every((repo) => repo && typeof repo.name === "string")) {
          throw new Error("GitHub returned an unexpected repository response.");
        }
        data.push(...pageData);
        const nextLink = (response.headers.get("link") || "").split(",").find((link) => /rel="next"/.test(link));
        if (!nextLink) break;
        const nextUrl = nextLink.match(/<([^>]+)>/);
        const nextPage = nextUrl && new URL(nextUrl[1]).searchParams.get("page");
        if (!nextPage || !/^\d+$/.test(nextPage) || Number(nextPage) <= page || Number(nextPage) > 100) {
          throw new Error("GitHub returned invalid pagination information.");
        }
        page = Number(nextPage);
      }
      repositories = data.filter((repo) => !repo.private);
      writeCache(repositories);
      renderAll();
      setStatus(`Connected to GitHub · ${repositories.length} public ${repositories.length === 1 ? "repository" : "repositories"}`, "success");
    } catch (error) {
      if (cache && Array.isArray(cache.data)) {
        repositories = cache.data;
        renderAll();
        setStatus(`${error.message || "Could not refresh GitHub."} Showing cached repository data.`, "error");
      } else {
        repositories = [];
        renderAll();
        setStatus(error.message || "Couldn't load repositories from GitHub. Check your connection and retry.", "error");
      }
    } finally {
      isLoading = false;
      refreshButton.disabled = false;
      refreshButton.style.opacity = "1";
    }
  }

  function renderRepos() {
    const query = searchInput.value.trim().toLowerCase();
    const language = languageFilter.value;
    const filtered = repositories.filter((repo) => {
      const text = `${repo.name || ""} ${repo.description || ""}`.toLowerCase();
      return text.includes(query) && (language === "All" || (repo.language || "Other") === language);
    });
    repoGrid.innerHTML = filtered.map((repo) => {
      const name = escapeHTML(repo.name);
      const url = `https://github.com/${ORG}/${encodeURIComponent(repo.name)}`;
      const description = escapeHTML(repo.description || "No description provided yet.");
      const languageLabel = escapeHTML(repo.language || "Other");
      const archived = repo.archived ? '<span class="repo-badge">ARCHIVED</span>' : "";
      const issueLinks = repo.has_issues && !repo.archived
        ? `<a class="mini-link" href="${url}/issues" target="_blank" rel="noopener noreferrer">Issues ↗</a><a class="mini-link" href="${url}/contribute" target="_blank" rel="noopener noreferrer">Contribute ↗</a>`
        : "";
      return `<article class="repo-card">
        <div class="repo-top"><a class="repo-name" href="${url}" target="_blank" rel="noopener noreferrer">${name} ↗</a>${archived}</div>
        <p class="repo-description">${description}</p>
        <div class="repo-meta">
          <span>◉ <b>${languageLabel}</b></span><span>☆ <b>${compactNumber(repo.stargazers_count)}</b></span>
          <span>⑂ <b>${compactNumber(repo.forks_count)}</b></span><span>↻ <b>${dateLabel(repo.updated_at)}</b></span>
        </div>
        <div class="repo-actions"><a class="mini-link" href="${url}" target="_blank" rel="noopener noreferrer">Repository ↗</a>${issueLinks}</div>
      </article>`;
    }).join("");
    repoEmpty.classList.toggle("hidden", filtered.length !== 0);
    repoGrid.classList.toggle("hidden", filtered.length === 0);
    if (repositories.length && filtered.length === 0) repoEmpty.querySelector("p").textContent = "Try another search or choose a different language.";
    else if (!repositories.length) repoEmpty.querySelector("p").textContent = "When the organization has public repositories, they'll appear here.";
  }

  function renderLanguageOptions() {
    const current = languageFilter.value || "All";
    const languages = [...new Set(repositories.map((repo) => repo.language || "Other"))].sort((a, b) => a.localeCompare(b));
    languageFilter.innerHTML = `<option value="All">All languages</option>${languages.map((language) => `<option value="${escapeHTML(language)}">${escapeHTML(language)}</option>`).join("")}`;
    languageFilter.value = languages.includes(current) ? current : "All";
  }

  function renderActivity() {
    const stars = repositories.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const forks = repositories.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
    const languages = {};
    repositories.forEach((repo) => {
      const name = repo.language || "Other";
      languages[name] = (languages[name] || 0) + 1;
    });
    const sortedLanguages = Object.entries(languages).sort((a, b) => b[1] - a[1]);
    $("#statRepos").textContent = repositories.length ? compactNumber(repositories.length) : "0";
    $("#statStars").textContent = compactNumber(stars);
    $("#statForks").textContent = compactNumber(forks);
    $("#statLanguages").textContent = Object.keys(languages).length;
    const top = sortedLanguages.slice(0, 6);
    $("#languageBars").innerHTML = top.length ? top.map(([name, count]) => `
      <div class="language-row"><div class="language-row-top"><span>${escapeHTML(name)}</span><span>${count} ${count === 1 ? "repo" : "repos"}</span></div>
      <div class="language-track"><div class="language-fill" style="width:${Math.max(4, count / repositories.length * 100)}%"></div></div></div>`).join("") : '<p class="muted">No public repository language data available yet.</p>';
    const recent = [...repositories].sort((a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at)).slice(0, 5);
    $("#recentRepos").innerHTML = recent.length ? recent.map((repo) => `<div class="recent-item"><a href="https://github.com/${ORG}/${encodeURIComponent(repo.name)}" target="_blank" rel="noopener noreferrer">${escapeHTML(repo.name)} ↗</a><time>${dateLabel(repo.pushed_at || repo.updated_at)}</time></div>`).join("") : '<p class="muted">No public repositories to display yet.</p>';
  }

  function renderAll() {
    renderLanguageOptions();
    renderRepos();
    renderActivity();
  }

  searchInput.addEventListener("input", renderRepos);
  languageFilter.addEventListener("change", renderRepos);
  refreshButton.addEventListener("click", () => fetchRepos(true));

  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");
  menuToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navLinks.classList.contains("open")) {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      menuToggle.focus();
    }
  });
  navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  }));

  fetchRepos();
})();
