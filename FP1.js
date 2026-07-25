// ============ DATA ============
const tools = [
  { name: "Nmap", category: "Network", icon: "👁️", desc: "Network scanning and discovery tool.", rating: 5, difficulty: "Beginner", os: ["🐧", "🪟", "🍎"], link:"https://nmap.org/download.html" },
  { name: "Wireshark", category: "Network", icon: "🦈", desc: "Network protocol analyzer and packet sniffer.", rating: 5, difficulty: "Intermediate", os: ["🐧", "🪟", "🍎"] },
  { name: "Burp Suite", category: "Web Security", icon: "⚡", desc: "Web vulnerability scanner and proxy tool.", rating: 4, difficulty: "Intermediate", os: ["🐧", "🪟", "🍎"] },
  { name: "Metasploit", category: "Exploitation", icon: "Ⓜ️", desc: "Penetration testing framework.", rating: 5, difficulty: "Advanced", os: ["🐧", "🍎"] },
  { name: "John the Ripper", category: "Password", icon: "🕵️", desc: "Password cracking tool.", rating: 4, difficulty: "Intermediate", os: ["🐧", "🪟", "🍎"] },
  { name: "Hashcat", category: "Password", icon: "🐱", desc: "Advanced password recovery tool.", rating: 4, difficulty: "Advanced", os: ["🐧", "🪟", "🍎"] },
  { name: "SQLmap", category: "Web Security", icon: "💉", desc: "Automated SQL injection and database takeover.", rating: 4, difficulty: "Intermediate", os: ["🐧", "🍎"] },
  { name: "Aircrack-ng", category: "Wireless", icon: "📡", desc: "Wireless network security assessment.", rating: 4, difficulty: "Advanced", os: ["🐧"] },
];

const tips = [
  "Never upload confidential files to online malware scanners — many keep and share what you submit.",
  "Rotate API keys and tokens regularly, even if you have no reason to believe they were leaked.",
  "Isolate testing environments from production networks before running any exploitation tool.",
  "Always get written authorization before scanning or testing a network you don't own.",
  "Keep a hashcat/John wordlist updated, stale wordlists quietly cut your success rate.",
];

const toolsGrid = document.getElementById("toolsGrid");
const favorites = new Set(JSON.parse(localStorage.getItem("favTools") || "[]"));
let activeCategory = "all";
let activeNames = null; 


function renderTools(list) {
  toolsGrid.innerHTML = "";

  if (list.length === 0) {
    const message = activeCategory === "favorites"
      ? "No favorites yet — click the star on any tool card to add one."
      : "No tools found.";
    toolsGrid.innerHTML = `<p class="empty-note">${message}</p>`;
    return;
  }

  list.forEach(tool => {
    const card = document.createElement("div");
    card.className = "tool-card";

    const tagClass = "tag-" + tool.category.replace(/\s+/g, "-");
    const isFav = favorites.has(tool.name);   
    const stars = "★".repeat(tool.rating) + "☆".repeat(5 - tool.rating);

    card.innerHTML = `
      <div class="tool-card-top">
        <div class="tool-icon">${tool.icon}</div>
        <button class="fav-btn ${isFav ? "active" : ""}" data-name="${tool.name}" aria-label="Toggle favorite">★</button>
      </div>
      <h4 class="tool-name">${tool.name}</h4>
      <div class="tool-meta">
        <span class="tool-tag ${tagClass}">${tool.category}</span>
        <span class="tool-stars">${stars}</span>
      </div>
      <p class="tool-desc">${tool.desc}</p>
      <div class="tool-footer">
        <span class="tool-os">${tool.os.join(" ")}</span>
        <span class="difficulty difficulty-${tool.difficulty}">${tool.difficulty}</span>
      </div>
      <button class="tool-open" data-name="${tool.name}">Open tool →</button>
    `;
    toolsGrid.appendChild(card);
  });
}

renderTools(filterTools("", activeCategory));

// ============ FILTERING ============
function filterTools(query, category) {
  const q = query.trim().toLowerCase();

  let pool = tools;

  if (activeNames) {
    pool = tools.filter(t => activeNames.includes(t.name));
  } else if (category === "favorites") {
    const savedFavs = new Set(JSON.parse(localStorage.getItem("favTools") || "[]"));
    pool = tools.filter(t => savedFavs.has(t.name));
  }

  return pool.filter(t => {
    const matchesQuery = !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q);
    const matchesCategory = activeNames || category === "favorites" || !category || category === "all" || category === "dashboard" || t.category === category;
    return matchesQuery && matchesCategory;
  });
}

function runSearch(query) {
  renderTools(filterTools(query, activeCategory));
}

function clearNamesFilter() {
  activeNames = null;
}

function setActiveCategory(category) {
  activeNames = null;
  activeCategory = category;
  document.querySelectorAll(".nav-item[data-category]").forEach(n => n.classList.remove("active"));
  document.querySelectorAll(`.nav-item[data-category="${category}"]`).forEach(n => n.classList.add("active"));
}

// ============ CARD CLICKS (favorite + open) ============
toolsGrid.addEventListener("click", (e) => {
  const favBtn = e.target.closest(".fav-btn");
  if (favBtn) {
    const name = favBtn.dataset.name;
    if (favorites.has(name)) {
      favorites.delete(name);
      favBtn.classList.remove("active");
    } else {
      favorites.add(name);
      favBtn.classList.add("active");
    }
    localStorage.setItem("favTools", JSON.stringify([...favorites]));
    renderFavoritesPanel();

    if (activeCategory === "favorites") {
      runSearch(document.getElementById("heroSearchInput").value);
    }
    return;
  }

  const openBtn = e.target.closest(".tool-open");
  if (openBtn) {
    showToast(`Opening details for ${openBtn.dataset.name}...`);
  }
});

// ============ HERO SEARCH ============
document.getElementById("heroSearchBtn").addEventListener("click", () => {
  const value = document.getElementById("heroSearchInput").value;
  clearNamesFilter();
  runSearch(value);
  recordSearch(value);
});
document.getElementById("heroSearchInput").addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    clearNamesFilter();
    runSearch(e.target.value);
    recordSearch(e.target.value);
  }
});

// ============ HERO POPULAR TAGS ============
document.querySelectorAll(".hero-tag").forEach(tag => {
  tag.addEventListener("click", () => {
    const name = tag.dataset.name;
    document.getElementById("heroSearchInput").value = name;
    clearNamesFilter();
    setActiveCategory("all");
    runSearch(name);
    recordSearch(name);
  });
});

// ============ QUICK START CARDS ============
document.querySelectorAll(".qs-card").forEach(card => {
  card.addEventListener("click", () => {
    activeNames = card.dataset.names.split(",");
    document.getElementById("heroSearchInput").value = "";
    document.querySelectorAll(".nav-item[data-category]").forEach(n => n.classList.remove("active"));
    renderTools(filterTools("", activeCategory));
    document.getElementById("toolsGrid").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// ============ SIDEBAR CATEGORY FILTER ============
document.querySelectorAll(".nav-item[data-category]").forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    setActiveCategory(item.dataset.category);
    runSearch(document.getElementById("heroSearchInput").value);
  });
});

// ============ TOP NAVBAR LINKS ============
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    const action = link.dataset.action;
    if (action === "learn") {
      showToast("Cheat sheets, resources and tips live in the sidebar under Learn.");
      return;
    }
    if (action === "community") {
      showToast("Community hub is coming soon.");
      return;
    }
    setActiveCategory(action);
    runSearch(document.getElementById("heroSearchInput").value);
  });
});

// ============ RECENT SEARCHES ============
function recordSearch(term) {
  const clean = term.trim();
  if (!clean) return;
  let recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
  recent = recent.filter(r => r.toLowerCase() !== clean.toLowerCase());
  recent.unshift(clean);
  recent = recent.slice(0, 5);
  localStorage.setItem("recentSearches", JSON.stringify(recent));
  renderRecentSearches();
}

function renderRecentSearches() {
  const list = JSON.parse(localStorage.getItem("recentSearches") || "[]");
  const panel = document.getElementById("recentSearchesPanel");

  if (list.length === 0) {
    panel.innerHTML = `<li class="empty-note">Your recent searches will show up here.</li>`;
    return;
  }

  panel.innerHTML = list.map(term =>
    `<li><button data-term="${term}">${term}</button></li>`
  ).join("");
}

document.getElementById("recentSearchesPanel").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-term]");
  if (!btn) return;
  const term = btn.dataset.term;
  document.getElementById("heroSearchInput").value = term;
  clearNamesFilter();
  setActiveCategory("all");
  runSearch(term);
  recordSearch(term);
});

// ============ FAVORITES PANEL ============
function renderFavoritesPanel() {
  const panel = document.getElementById("favoritesPanel");
  if (favorites.size === 0) {
    panel.innerHTML = `<p class="empty-note">No favorites yet — star a tool to save it here.</p>`;
    return;
  }
  panel.innerHTML = [...favorites].map(name =>
    `<span class="fav-chip">★ ${name}</span>`
  ).join("");
}

// ============ THEME TOGGLE ============
const themeToggle = document.getElementById("themeToggle");
function applyTheme(theme) {
  document.body.classList.toggle("light-theme", theme === "light");
  themeToggle.textContent = theme === "light" ? "☀️" : "🌙";
}
const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light-theme");
  const next = isLight ? "dark" : "light";
  applyTheme(next);
  localStorage.setItem("theme", next);
});

// ============ QUICK ACTIONS ============
document.querySelectorAll(".quick-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    showToast(`${btn.dataset.action} launched.`);
  });
});

// ============ TOAST HELPER ============
let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ============ DAILY TIP ============
function renderDailyTip() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  const tip = tips[dayOfYear % tips.length];
  document.getElementById("tipText").textContent = tip;
}

// ============ INIT ============
renderFavoritesPanel();
renderRecentSearches();
renderDailyTip();