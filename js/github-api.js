const ORG = "ignouos";
const API = "https://api.github.com";
const CACHE_KEY = "open-source-ignou-repos-v2";
const CACHE_TTL = 10 * 60 * 1000;
const TIMEOUT = 15000;

export function readCache() {
  try {
    const item = JSON.parse(
      localStorage.getItem(CACHE_KEY) ||
        localStorage.getItem("open-source-ignou-repos-v1") ||
        "null",
    );
    if (!item || !Number.isFinite(item.savedAt) || !Array.isArray(item.data))
      return null;
    if (
      !item.data.every(
        (repo) =>
          repo &&
          typeof repo.name === "string" &&
          typeof repo.html_url === "string",
      )
    )
      return null;
    return item;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ savedAt: Date.now(), data }),
    );
  } catch {
    /* Cache is optional. */
  }
}

async function fetchPage(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    return await fetch(url, {
      headers: { Accept: "application/vnd.github+json" },
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError")
      throw new Error("GitHub took too long to respond. Please retry.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function responseError(response) {
  if (response.status === 403 || response.status === 429) {
    const reset = response.headers.get("x-ratelimit-reset");
    const retryTime = reset
      ? new Date(Number(reset) * 1000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "later";
    return new Error(
      `GitHub's public API limit was reached. Please try again ${retryTime === "later" ? "later" : `after ${retryTime}`}.`,
    );
  }
  if (response.status === 404)
    return new Error(
      `The public organization "${ORG}" could not be found. Check its name or visibility.`,
    );
  return new Error(
    `GitHub returned an error (${response.status}). Please try again.`,
  );
}

export async function loadRepositories({ force = false } = {}) {
  const cached = readCache();
  const age = cached ? Date.now() - cached.savedAt : Infinity;
  if (!force && age >= 0 && age < CACHE_TTL)
    return { data: cached.data, cached: true };

  try {
    const data = [];
    let page = 1;
    while (page <= 100) {
      const response = await fetchPage(
        `${API}/orgs/${ORG}/repos?sort=updated&per_page=100&page=${page}`,
      );
      if (!response.ok) throw responseError(response);
      const pageData = await response.json();
      if (
        !Array.isArray(pageData) ||
        !pageData.every((repo) => repo && typeof repo.name === "string")
      ) {
        throw new Error("GitHub returned an unexpected repository response.");
      }
      data.push(...pageData.filter((repo) => !repo.private));
      const next = (response.headers.get("link") || "")
        .split(",")
        .find((link) => /rel="next"/.test(link));
      if (!next) break;
      const match = next.match(/<([^>]+)>/);
      const nextPage = match && new URL(match[1]).searchParams.get("page");
      if (
        !nextPage ||
        !/^\d+$/.test(nextPage) ||
        Number(nextPage) <= page ||
        Number(nextPage) > 100
      ) {
        throw new Error("GitHub returned invalid pagination information.");
      }
      page = Number(nextPage);
    }
    writeCache(data);
    return { data, cached: false };
  } catch (error) {
    if (cached?.data?.length)
      return {
        data: cached.data,
        cached: true,
        stale: true,
        error: error.message,
      };
    throw error;
  }
}

export async function fetchRepositoryReadme(name) {
  const response = await fetchPage(
    `${API}/repos/${ORG}/${encodeURIComponent(name)}/readme`,
  );
  if (!response.ok) return "";
  const payload = await response.json();
  if (!payload.content || !payload.encoding) return "";
  try {
    if (payload.encoding !== "base64")
      return String(payload.content).slice(0, 12000);
    const binary = atob(payload.content.replace(/\s/g, ""));
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    );
    return new TextDecoder().decode(bytes).slice(0, 12000);
  } catch {
    return "";
  }
}

export { ORG };
