import { resources } from "./resources.js";

export function initGlobalSearch(getRepositories, onProject) {
  const dialog = document.querySelector("#searchDialog");
  const input = document.querySelector("#globalSearch");
  const resultsNode = document.querySelector("#searchResults");
  const openers = [document.querySelector("#globalSearchTrigger")];
  const open = () => { if (!dialog.open) dialog.showModal(); input.value = ""; render(); requestAnimationFrame(() => input.focus()); };
  openers.forEach((button) => button.addEventListener("click", open));
  document.querySelector("#searchClose").addEventListener("click", () => dialog.close());
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); open(); }
  });
  function render() {
    const query = input.value.trim().toLowerCase(); resultsNode.replaceChildren();
    if (!query) {
      const hint = document.createElement("p"); hint.className = "search-empty"; hint.textContent = "Search project names, descriptions, and learning guides."; resultsNode.append(hint); return;
    }
    const projects = getRepositories().filter((repo) => `${repo.name} ${repo.description || ""} ${repo.language || ""}`.toLowerCase().includes(query)).slice(0, 7);
    const guides = resources.filter((item) => `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(query)).slice(0, 5);
    projects.forEach((repo) => {
      const button = document.createElement("button"); button.type = "button"; button.className = "search-result";
      const title = document.createElement("strong"); title.textContent = repo.name;
      const copy = document.createElement("span"); copy.textContent = repo.description || "Public GitHub project";
      const tag = document.createElement("small"); tag.textContent = `Project · ${repo.language || "Other"}`;
      button.append(title, copy, tag); button.addEventListener("click", () => { dialog.close(); onProject(repo); }); resultsNode.append(button);
    });
    guides.forEach((resource) => {
      const link = document.createElement("a"); link.className = "search-result"; link.href = resource.url; link.target = "_blank"; link.rel = "noopener noreferrer";
      const title = document.createElement("strong"); title.textContent = resource.title;
      const copy = document.createElement("span"); copy.textContent = resource.description;
      const tag = document.createElement("small"); tag.textContent = `Learning · ${resource.category}`;
      link.append(title, copy, tag); link.addEventListener("click", () => dialog.close()); resultsNode.append(link);
    });
    if (!projects.length && !guides.length) {
      const empty = document.createElement("p"); empty.className = "search-empty"; empty.textContent = "No matches yet. Try a project name or a learning topic."; resultsNode.append(empty);
    }
  }
  let timer;
  input.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(render, 100); });
}
