// ============ DATA ============
const tools = [
  { name: "Nmap", category: "Network", icon: "👁️", desc: "Network scanning and discovery tool.", rating: 5, difficulty: "Beginner", os: ["🐧", "🪟", "🍎"], url: "https://nmap.org/download.html" },
  { name: "Wireshark", category: "Network", icon: "🦈", desc: "Network protocol analyzer and packet sniffer.", rating: 5, difficulty: "Intermediate", os: ["🐧", "🪟", "🍎"], url: "https://www.wireshark.org/download.html" },
  { name: "Burp Suite", category: "Web Security", icon: "⚡", desc: "Web vulnerability scanner and proxy tool.", rating: 4, difficulty: "Intermediate", os: ["🐧", "🪟", "🍎"], url: "https://portswigger.net/burp/communitydownload" },
  { name: "Metasploit", category: "Exploitation", icon: "Ⓜ️", desc: "Penetration testing framework.", rating: 5, difficulty: "Advanced", os: ["🐧", "🍎"], url: "https://www.metasploit.com/download" },
  { name: "John the Ripper", category: "Password", icon: "🕵️", desc: "Password cracking tool.", rating: 4, difficulty: "Intermediate", os: ["🐧", "🪟", "🍎"], url: "https://www.openwall.com/john/" },
  { name: "Hashcat", category: "Password", icon: "🐱", desc: "Advanced password recovery tool.", rating: 4, difficulty: "Advanced", os: ["🐧", "🪟", "🍎"], url: "https://hashcat.net/hashcat/" },
  { name: "SQLmap", category: "Web Security", icon: "💉", desc: "Automated SQL injection and database takeover.", rating: 4, difficulty: "Intermediate", os: ["🐧", "🍎"], url: "https://sqlmap.org/" },
  { name: "Aircrack-ng", category: "Wireless", icon: "📡", desc: "Wireless network security assessment.", rating: 4, difficulty: "Advanced", os: ["🐧"], url: "https://www.aircrack-ng.org/downloads.html" },
];

const tips = [
  "Never upload confidential files to online malware scanners — many keep and share what you submit.",
  "Rotate API keys and tokens regularly, even if you have no reason to believe they were leaked.",
  "Isolate testing environments from production networks before running any exploitation tool.",
  "Always get written authorization before scanning or testing a network you don't own.",
  "Keep a hashcat/John wordlist updated — stale wordlists quietly cut your success rate.",
];

const toolsGrid = document.getElementById("toolsGrid");
const favorites = new Set(JSON.parse(localStorage.getItem("favTools") || "[]"));
let activeCategory = "all";
let activeNames = null; // when set, overrides category filtering (used by Quick Start / hero tags)

// ============ RENDER TOOL CARDS ============
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
      <a class="tool-open" href="${tool.url}" target="_blank" rel="noopener noreferrer">Download ${tool.name} →</a>
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
    if (btn.dataset.action === "Hash Generator") {
      openHashModal();
      return;
    }
    showToast(`${btn.dataset.action} launched.`);
  });
});

// ============ HASH GENERATOR ============
const hashModal = document.getElementById("hashModal");
const hashInput = document.getElementById("hashInput");
const hashOutput = document.getElementById("hashOutput");
const copyHashBtn = document.getElementById("copyHashBtn");
let selectedAlgo = "MD5";

function openHashModal() {
  hashModal.classList.add("open");
  hashInput.focus();
  updateHash();
}
function closeHashModalFn() {
  hashModal.classList.remove("open");
}

document.getElementById("closeHashModal").addEventListener("click", closeHashModalFn);
hashModal.addEventListener("click", (e) => {
  if (e.target === hashModal) closeHashModalFn();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && hashModal.classList.contains("open")) closeHashModalFn();
});

document.querySelectorAll(".algo-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".algo-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    selectedAlgo = tab.dataset.algo;
    updateHash();
  });
});

hashInput.addEventListener("input", updateHash);

async function updateHash() {
  const text = hashInput.value;
  if (!text) {
    hashOutput.value = "";
    return;
  }
  hashOutput.value = await computeHash(text, selectedAlgo);
}

async function computeHash(text, algo) {
  if (algo === "MD5") {
    return md5(text);
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

copyHashBtn.addEventListener("click", async () => {
  if (!hashOutput.value) return;
  try {
    await navigator.clipboard.writeText(hashOutput.value);
    showToast("Hash copied to clipboard.");
  } catch {
    hashOutput.select();
    document.execCommand("copy");
    showToast("Hash copied to clipboard.");
  }
});

// ---- MD5 implementation (RFC 1321), since Web Crypto has no native MD5 ----
function md5(input) {
  function rotateLeft(x, c) { return (x << c) | (x >>> (32 - c)); }
  function addUnsigned(x, y) {
    const x8 = x & 0x80000000, y8 = y & 0x80000000;
    const x4 = x & 0x40000000, y4 = y & 0x40000000;
    const result = (x & 0x3FFFFFFF) + (y & 0x3FFFFFFF);
    if (x4 & y4) return result ^ 0x80000000 ^ x8 ^ y8;
    if (x4 | y4) {
      if (result & 0x40000000) return result ^ 0xC0000000 ^ x8 ^ y8;
      return result ^ 0x40000000 ^ x8 ^ y8;
    }
    return result ^ x8 ^ y8;
  }
  const F = (x, y, z) => (x & y) | (~x & z);
  const G = (x, y, z) => (x & z) | (y & ~z);
  const H = (x, y, z) => x ^ y ^ z;
  const I = (x, y, z) => y ^ (x | ~z);
  function FF(a, b, c, d, x, s, ac) { a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b); }
  function GG(a, b, c, d, x, s, ac) { a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b); }
  function HH(a, b, c, d, x, s, ac) { a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b); }
  function II(a, b, c, d, x, s, ac) { a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b); }

  function convertToWordArray(str) {
    const messageLength = str.length;
    const numberOfWords_temp1 = messageLength + 8;
    const numberOfWords_temp2 = (numberOfWords_temp1 - (numberOfWords_temp1 % 64)) / 64;
    const numberOfWords = (numberOfWords_temp2 + 1) * 16;
    const wordArray = new Array(numberOfWords - 1).fill(0);
    let bytePosition, byteCount = 0, wordCount;
    while (byteCount < messageLength) {
      wordCount = (byteCount - (byteCount % 4)) / 4;
      bytePosition = (byteCount % 4) * 8;
      wordArray[wordCount] |= str.charCodeAt(byteCount) << bytePosition;
      byteCount++;
    }
    wordCount = (byteCount - (byteCount % 4)) / 4;
    bytePosition = (byteCount % 4) * 8;
    wordArray[wordCount] |= 0x80 << bytePosition;
    wordArray[numberOfWords - 2] = messageLength << 3;
    wordArray[numberOfWords - 1] = messageLength >>> 29;
    return wordArray;
  }

  function toHex(n) {
    let s = "";
    for (let i = 0; i < 4; i++) s += ("0" + ((n >>> (i * 8)) & 255).toString(16)).slice(-2);
    return s;
  }

  const x = convertToWordArray(unescape(encodeURIComponent(input)));
  let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;

    a = FF(a, b, c, d, x[k+0], 7, 0xD76AA478);  d = FF(d, a, b, c, x[k+1], 12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k+2], 17, 0x242070DB);  b = FF(b, c, d, a, x[k+3], 22, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k+4], 7, 0xF57C0FAF);  d = FF(d, a, b, c, x[k+5], 12, 0x4787C62A);
    c = FF(c, d, a, b, x[k+6], 17, 0xA8304613);  b = FF(b, c, d, a, x[k+7], 22, 0xFD469501);
    a = FF(a, b, c, d, x[k+8], 7, 0x698098D8);  d = FF(d, a, b, c, x[k+9], 12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k+10], 17, 0xFFFF5BB1);  b = FF(b, c, d, a, x[k+11], 22, 0x895CD7BE);
    a = FF(a, b, c, d, x[k+12], 7, 0x6B901122);  d = FF(d, a, b, c, x[k+13], 12, 0xFD987193);
    c = FF(c, d, a, b, x[k+14], 17, 0xA679438E);  b = FF(b, c, d, a, x[k+15], 22, 0x49B40821);

    a = GG(a, b, c, d, x[k+1], 5, 0xF61E2562);  d = GG(d, a, b, c, x[k+6], 9, 0xC040B340);
    c = GG(c, d, a, b, x[k+11], 14, 0x265E5A51);  b = GG(b, c, d, a, x[k+0], 20, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k+5], 5, 0xD62F105D);  d = GG(d, a, b, c, x[k+10], 9, 0x02441453);
    c = GG(c, d, a, b, x[k+15], 14, 0xD8A1E681);  b = GG(b, c, d, a, x[k+4], 20, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k+9], 5, 0x21E1CDE6);  d = GG(d, a, b, c, x[k+14], 9, 0xC33707D6);
    c = GG(c, d, a, b, x[k+3], 14, 0xF4D50D87);  b = GG(b, c, d, a, x[k+8], 20, 0x455A14ED);
    a = GG(a, b, c, d, x[k+13], 5, 0xA9E3E905);  d = GG(d, a, b, c, x[k+2], 9, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k+7], 14, 0x676F02D9);  b = GG(b, c, d, a, x[k+12], 20, 0x8D2A4C8A);

    a = HH(a, b, c, d, x[k+5], 4, 0xFFFA3942);  d = HH(d, a, b, c, x[k+8], 11, 0x8771F681);
    c = HH(c, d, a, b, x[k+11], 16, 0x6D9D6122);  b = HH(b, c, d, a, x[k+14], 23, 0xFDE5380C);
    a = HH(a, b, c, d, x[k+1], 4, 0xA4BEEA44);  d = HH(d, a, b, c, x[k+4], 11, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k+7], 16, 0xF6BB4B60);  b = HH(b, c, d, a, x[k+10], 23, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k+13], 4, 0x289B7EC6);  d = HH(d, a, b, c, x[k+0], 11, 0xEAA127FA);
    c = HH(c, d, a, b, x[k+3], 16, 0xD4EF3085);  b = HH(b, c, d, a, x[k+6], 23, 0x04881D05);
    a = HH(a, b, c, d, x[k+9], 4, 0xD9D4D039);  d = HH(d, a, b, c, x[k+12], 11, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k+15], 16, 0x1FA27CF8);  b = HH(b, c, d, a, x[k+2], 23, 0xC4AC5665);

    a = II(a, b, c, d, x[k+0], 6, 0xF4292244);  d = II(d, a, b, c, x[k+7], 10, 0x432AFF97);
    c = II(c, d, a, b, x[k+14], 15, 0xAB9423A7);  b = II(b, c, d, a, x[k+5], 21, 0xFC93A039);
    a = II(a, b, c, d, x[k+12], 6, 0x655B59C3);  d = II(d, a, b, c, x[k+3], 10, 0x8F0CCC92);
    c = II(c, d, a, b, x[k+10], 15, 0xFFEFF47D);  b = II(b, c, d, a, x[k+1], 21, 0x85845DD1);
    a = II(a, b, c, d, x[k+8], 6, 0x6FA87E4F);  d = II(d, a, b, c, x[k+15], 10, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k+6], 15, 0xA3014314);  b = II(b, c, d, a, x[k+13], 21, 0x4E0811A1);
    a = II(a, b, c, d, x[k+4], 6, 0xF7537E82);  d = II(d, a, b, c, x[k+11], 10, 0xBD3AF235);
    c = II(c, d, a, b, x[k+2], 15, 0x2AD7D2BB);  b = II(b, c, d, a, x[k+9], 21, 0xEB86D391);

    a = addUnsigned(a, AA); b = addUnsigned(b, BB); c = addUnsigned(c, CC); d = addUnsigned(d, DD);
  }

  return (toHex(a) + toHex(b) + toHex(c) + toHex(d)).toLowerCase();
}

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