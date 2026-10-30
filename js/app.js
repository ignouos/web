import { loadRepositories } from "./github-api.js";
import { renderDashboard } from "./dashboard.js";
import {
  renderLanguageOptions,
  renderRepositories,
  setRepoStatus,
  showRepository,
} from "./repositories.js";
import { initResources } from "./resources.js";
import { initGlobalSearch } from "./search.js";
import { initHeroCanvas } from "./hero-canvas.js";
import {
  initNavigation,
  initPreferences,
  initReveals,
  toast,
} from "./navigation.js";

let repositories = [];
let loading = false;
const refreshButton = document.querySelector("#refreshRepos");
const grid = document.querySelector("#repoGrid");

function renderAll() {
  renderLanguageOptions(repositories);
  renderRepositories(repositories, showRepository);
  renderDashboard(repositories);
}

function renderSkeletons() {
  grid.replaceChildren();
  for (let index = 0; index < 6; index++) {
    const card = document.createElement("div");
    card.className = "repo-card skeleton-card";
    card.setAttribute("aria-hidden", "true");
    card.innerHTML = "<span></span><span></span><span></span><span></span>";
    grid.append(card);
  }
}

async function fetchRepos(force = false) {
  if (loading) return;
  loading = true;
  refreshButton.disabled = true;
  if (!repositories.length) renderSkeletons();
  setRepoStatus(
    force ? "Refreshing public projects from GitHub…" : "Connecting to GitHub…",
  );
  try {
    const result = await loadRepositories({ force });
    repositories = result.data;
    renderAll();
    const count = repositories.length;
    setRepoStatus(
      result.stale
        ? `${result.error} Showing cached repository data.`
        : result.cached
          ? `Loaded ${count} public ${count === 1 ? "project" : "projects"} · cached recently`
          : `Connected to GitHub · ${count} public ${count === 1 ? "project" : "projects"}`,
      result.stale ? "error" : "success",
    );
  } catch (error) {
    if (repositories.length) {
      renderAll();
      setRepoStatus(
        `${error.message || "Could not refresh GitHub."} Showing the current project data.`,
        "error",
      );
    } else {
      renderAll();
      setRepoStatus(
        error.message ||
          "Couldn’t load projects from GitHub. Check your connection and retry.",
        "error",
      );
    }
    toast("Project data could not be refreshed. You can retry anytime.");
  } finally {
    loading = false;
    refreshButton.disabled = false;
  }
}

initNavigation();
initPreferences();
initResources();
initReveals();
initHeroCanvas();
initGlobalSearch(() => repositories, showRepository);
document.querySelector("#year").textContent = new Date().getFullYear();
document
  .querySelector("#repoSearch")
  .addEventListener("input", () =>
    renderRepositories(repositories, showRepository),
  );
document
  .querySelector("#languageFilter")
  .addEventListener("change", () =>
    renderRepositories(repositories, showRepository),
  );
document
  .querySelector("#sortFilter")
  .addEventListener("change", () =>
    renderRepositories(repositories, showRepository),
  );
refreshButton.addEventListener("click", () => fetchRepos(true));
document.querySelector("#clearRepoFilters").addEventListener("click", () => {
  document.querySelector("#repoSearch").value = "";
  document.querySelector("#languageFilter").value = "All";
  document.querySelector("#sortFilter").value = "updated";
  renderRepositories(repositories, showRepository);
});
document
  .querySelector("#dialogClose")
  .addEventListener("click", () =>
    document.querySelector("#repoDialog").close(),
  );
for (const dialog of document.querySelectorAll("dialog"))
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
document.addEventListener(
  "pointermove",
  (event) => {
    const card = event.target.closest?.(".repo-card,.resource-card");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  },
  { passive: true },
);
fetchRepos();
