const resources = [
  { title: "GitHub Skills", category: "GitHub", icon: "⌘", type: "PRACTICE", description: "Learn GitHub through short, interactive courses built around real repository workflows.", url: "https://skills.github.com/" },
  { title: "GitHub Docs: Get started", category: "GitHub", icon: "↗", type: "GITHUB BASICS", description: "Understand repositories, issues, branches, pull requests, and how to collaborate.", url: "https://docs.github.com/en/get-started" },
  { title: "Git documentation", category: "Git", icon: "⌥", type: "VERSION CONTROL", description: "Official reference and tutorials for commits, branches, merging, and everyday Git.", url: "https://git-scm.com/doc" },
  { title: "Oh My Git!", category: "Git", icon: "✳", type: "INTERACTIVE LEARNING", description: "A visual game for exploring Git concepts and building confidence with commands.", url: "https://ohmygit.org/" },
  { title: "First Contributions", category: "Contributing", icon: "＋", type: "FIRST PULL REQUEST", description: "A friendly, practical walkthrough for making your first contribution on GitHub.", url: "https://github.com/firstcontributions/first-contributions" },
  { title: "How to contribute to open source", category: "Contributing", icon: "◎", type: "OPEN SOURCE GUIDE", description: "Find projects, understand contribution workflows, and make a meaningful first change.", url: "https://opensource.guide/how-to-contribute/" },
  { title: "MDN Learn Web Development", category: "Web", icon: "⌘", type: "WEB DEVELOPMENT", description: "Structured lessons on HTML, CSS, JavaScript, and web platform fundamentals.", url: "https://developer.mozilla.org/en-US/docs/Learn" },
  { title: "freeCodeCamp", category: "Web", icon: "▣", type: "BUILD AND PRACTICE", description: "Free interactive curriculum and projects for web development and programming.", url: "https://www.freecodecamp.org/learn/" },
  { title: "Choose a License", category: "Open source", icon: "©", type: "LICENSING", description: "Compare common open-source licenses and understand what permissions they grant.", url: "https://choosealicense.com/" },
  { title: "Open Source Guides", category: "Open source", icon: "◇", type: "COMMUNITY PRACTICE", description: "Practical guides for creating, maintaining, and growing open-source projects.", url: "https://opensource.guide/" }
];
const categories = ["All", ...new Set(resources.map((item) => item.category))];
let activeCategory = "All";

function render() {
  const query = document.querySelector("#resourceSearch").value.trim().toLowerCase();
  const visible = resources.filter((item) => (activeCategory === "All" || item.category === activeCategory)
    && `${item.title} ${item.description} ${item.category} ${item.type}`.toLowerCase().includes(query));
  const grid = document.querySelector("#resourceGrid"); grid.replaceChildren();
  visible.forEach((item) => {
    const card = document.createElement("a"); card.className = "resource-card"; card.href = item.url; card.target = "_blank"; card.rel = "noopener noreferrer";
    const icon = document.createElement("span"); icon.className = "resource-icon"; icon.textContent = item.icon;
    const type = document.createElement("span"); type.className = "resource-type"; type.textContent = `${item.category.toUpperCase()} · ${item.type}`;
    const title = document.createElement("h3"); title.textContent = item.title;
    const description = document.createElement("p"); description.textContent = item.description;
    const action = document.createElement("span"); action.className = "resource-arrow"; action.textContent = "Open resource ↗";
    card.append(icon, type, title, description, action); grid.append(card);
  });
  document.querySelector("#resourceEmpty").classList.toggle("hidden", visible.length > 0);
}

export function initResources() {
  const filters = document.querySelector("#resourceCategories");
  categories.forEach((category) => {
    const button = document.createElement("button"); button.type = "button"; button.className = "category-pill"; button.textContent = category;
    button.setAttribute("aria-pressed", String(category === activeCategory));
    button.addEventListener("click", () => {
      activeCategory = category;
      filters.querySelectorAll("button").forEach((pill) => pill.setAttribute("aria-pressed", String(pill === button)));
      render();
    });
    filters.append(button);
  });
  document.querySelector("#resourceSearch").addEventListener("input", render);
  render();
}

export { resources };
