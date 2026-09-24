/* ---------- Storage helpers ---------- */
const DEFAULTS = { balance: 5000, name: "You", upiId: "you@edu" };
const MAX_HISTORY = 50; // Keeps well above the requested 15 transactions.
const HISTORY_SEEDED_KEY = "edupay_history_seeded_v1";

function getProfile() {
  return JSON.parse(localStorage.getItem("edupay_profile") || "null") || {
    name: DEFAULTS.name, upiId: DEFAULTS.upiId,
  };
}
function saveProfile(p) {
  localStorage.setItem("edupay_profile", JSON.stringify(p));
}
function getBalance() {
  const v = localStorage.getItem("edupay_balance");
  return v === null ? DEFAULTS.balance : Number(v);
}
function setBalance(v) {
  localStorage.setItem("edupay_balance", String(v));
  renderBalance();
}
function getHistory() {
  try {
    const raw = localStorage.getItem("edupay_history");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Could not read transaction history", e);
    return [];
  }
}
function saveHistory(history) {
  try {
    localStorage.setItem("edupay_history", JSON.stringify(history.slice(0, MAX_HISTORY)));
    return true;
  } catch (e) {
    console.warn("Could not save transaction history", e);
    return false;
  }
}
function addHistory(entry) {
  const h = getHistory();
  h.unshift(entry);
  saveHistory(h);
}
function clearHistory() {
  localStorage.removeItem("edupay_history");
  // Prevent the demo seed data from coming back after the user intentionally clears history.
  localStorage.setItem(HISTORY_SEEDED_KEY, "1");
}

// First-run demo data: gives the History screen 15 real, clickable transactions.
// All of them are stored in localStorage, so they remain after refresh/reopen on laptop or mobile.
function seedDemoHistoryIfNeeded() {
  const existing = getHistory();
  const seeded = localStorage.getItem(HISTORY_SEEDED_KEY) === "1";
  if (existing.length > 0 || seeded) return;

  const merchants = [
    ["Google India Private Limited", "google@citi"],
    ["Campus Canteen", "canteen@edu"],
    ["Amazon Pay", "amazon@pay"],
    ["Reliance Jio", "jio@upi"],
    ["College Fees", "college@edu"],
    ["Electricity Bill", "electricity@bill"],
    ["Swiggy", "swiggy@upi"],
    ["Book Store", "books@edu"],
    ["Travel Desk", "travel@edu"],
    ["Hostel Mess", "mess@edu"],
    ["PhonePe Wallet", "wallet@upi"],
    ["Movie Tickets", "movies@upi"],
    ["Medical Store", "medical@upi"],
    ["Food Court", "food@edu"],
    ["Recharge", "recharge@upi"]
  ];
  const amounts = [500, 250, 799, 299, 1500, 640, 425, 180, 350, 1200, 500, 320, 275, 210, 199];
  const now = Date.now();
  const demo = merchants.map(([name, upiId], i) => ({
    type: "sent",
    name,
    upiId,
    amount: amounts[i],
    time: new Date(now - (i + 1) * 86400000).toISOString(),
    txnId: "DEMOSEED" + String(i + 1).padStart(3, "0")
  }));
  saveHistory(demo);
  localStorage.setItem(HISTORY_SEEDED_KEY, "1");
}

/* ---------- Navigation ---------- */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
  if (id === "screen-home") { renderBalance(); renderHistoryPreview(); }
  if (id === "screen-history") renderHistoryFull();
  if (id === "screen-search") renderSearchResults("");
  if (id === "screen-profile") loadProfileForm();
  if (id === "screen-scan") resetScanScreen();
  if (id !== "screen-scan") stopCamera();

  // Bottom nav visibility + active tab
  const bottomNav = document.querySelector(".bottom-nav");
  const showNav = !!(target && target.classList.contains("with-bottomnav"));
  bottomNav.classList.toggle("visible", showNav);
  document.querySelectorAll(".bn-item").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-tab") === id);
  });
}
document.querySelectorAll("[data-nav]").forEach((el) => {
  el.addEventListener("click", () => showScreen(el.getAttribute("data-nav")));
});
document.querySelectorAll(".bn-item, .bn-scan").forEach((el) => {
  el.addEventListener("click", () => showScreen(el.getAttribute("data-tab")));
});

/* ---------- Demo-only tiles (Recharge/Bills row) ---------- */
document.querySelectorAll("[data-demo-tile]").forEach((el) => {
  el.addEventListener("click", () => {
    showToast(`"${el.getAttribute("data-demo-tile")}" is a visual demo tile. Try Scan & Pay or Receive Money to see a full working flow!`);
  });
});

/* ---------- Toast ---------- */
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

/* ---------- Search ---------- */
function renderSearchResults(query) {
  const q = query.trim().toLowerCase();
  const h = getHistory().filter((item) => !q || item.name.toLowerCase().includes(q));
  const el = document.getElementById("search-results");
  el.innerHTML = h.length
    ? h.map(historyRowHtml).join("")
    : `<div class="empty-state">${q ? "No matching transactions" : "Start typing to search your transaction history"}</div>`;
}
document.getElementById("search-input").addEventListener("input", (e) => {
  renderSearchResults(e.target.value);
});

/* ---------- Rendering ---------- */
function fmt(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}
function renderBalance() {
  document.getElementById("balance-amount").textContent = fmt(getBalance());
}
function historyRowHtml(item) {
  const icon = item.type === "sent" ? "↗" : "↙";
  const sign = item.type === "sent" ? "-" : "+";
  const cls = item.type === "sent" ? "sent" : "received";
  const txnKey = escapeHtml(item.txnId || `${item.time}-${item.name}`);
  return `<button class="history-item" type="button" data-txn-id="${txnKey}" aria-label="Open transaction details for ${escapeHtml(item.name)}">
    <span class="hi-left">
      <span class="hi-icon">${icon}</span>
      <span>
        <span class="hi-name">${escapeHtml(item.name)}</span>
        <span class="hi-sub">${new Date(item.time).toLocaleString()}</span>
      </span>
    </span>
    <span class="hi-amount ${cls}">${sign}${fmt(item.amount)}</span>
  </button>`;
}
function bindHistoryClicks(container) {
  container.querySelectorAll(".history-item[data-txn-id]").forEach((row) => {
    row.addEventListener("click", () => {
      const key = row.getAttribute("data-txn-id");
      const entry = getHistory().find((item) => (item.txnId || `${item.time}-${item.name}`) === key);
      if (entry) openTransactionDetails(entry);
    });
  });
}
function renderHistoryPreview() {
  const h = getHistory().slice(0, 5);
  const el = document.getElementById("history-preview");
  el.innerHTML = h.length ? h.map(historyRowHtml).join("") : '<div class="empty-state">No transactions yet — try Scan &amp; Pay</div>';
  bindHistoryClicks(el);
}
function historyRelativeTime(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(ms / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }).replace(/^0/, "");
}

function historyMonthKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function historyMonthLabel(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function historyReferenceRowHtml(item) {
  const name = escapeHtml(item.name || "Unknown");
  const amount = fmt(item.amount);
  const type = item.type === "received" ? "Received from" : (Number(item.amount) === 1 ? "Payment to" : "Paid to");
  const key = escapeHtml(item.txnId || `${item.time}-${item.name}`);
  return `<button class="history-reference-row" type="button" data-txn-id="${key}" aria-label="Open transaction for ${name}">
    <span class="reference-icon" aria-hidden="true"></span>
    <span class="reference-main">
      <span class="reference-type">${type}</span>
      <span class="reference-name">${name}</span>
      <span class="reference-date">${historyRelativeTime(item.time)}</span>
    </span>
    <span class="reference-right">
      <span class="reference-amount">${amount}</span>
      <span class="debited-row">${item.type === "received" ? "Credited to" : "Debited from"}<span class="bank-mini" aria-hidden="true"></span></span>
    </span>
  </button>`;
}

function renderHistoryFull(query = "") {
  const q = query.trim().toLowerCase();
  const h = getHistory().filter(item => !q || (item.name || "").toLowerCase().includes(q) || (item.upiId || "").toLowerCase().includes(q));
  const el = document.getElementById("history-list");
  if (!h.length) {
    el.innerHTML = `<div class="empty-state">${q ? "No matching transactions" : "No transactions yet"}</div>`;
    return;
  }

  const groups = new Map();
  h.sort((a, b) => new Date(b.time) - new Date(a.time)).forEach(item => {
    const key = historyMonthKey(item.time);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });

  el.innerHTML = [...groups.entries()].map(([key, items]) => {
    const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return `<section class="history-month-group">
      <div class="history-month"><span class="history-month-title">${historyMonthLabel(items[0].time)}</span><span class="history-month-total">+ ${fmt(total)} <b>›</b></span></div>
      <div>${items.map(historyReferenceRowHtml).join("")}</div>
    </section>`;
  }).join("");
  bindHistoryClicks(el);
}
function openTransactionDetails(entry) {
  pendingTxn = { name: entry.name, upiId: entry.upiId || "-", amount: Number(entry.amount) };
  const entryDate = new Date(entry.time);
  document.getElementById("success-time").textContent = entryDate.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  document.getElementById("success-short-time").textContent = entryDate.toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short", year: "numeric" });
  document.getElementById("success-name").textContent = entry.name || "-";
  document.getElementById("success-upi").textContent = entry.upiId || "-";
  document.getElementById("success-amount").textContent = fmt(entry.amount);
  document.getElementById("success-detail-amount").textContent = fmt(entry.amount);
  document.getElementById("success-txn").textContent = entry.txnId || "-";
  document.getElementById("success-utr").textContent = entry.txnId ? entry.txnId.replace("DEMO", "4268") + "116" : "-";
  document.getElementById("success-banking-name").textContent = (entry.name || "-").toUpperCase();
  document.getElementById("success-avatar").textContent = (entry.name?.[0] || "U").toUpperCase();
  document.getElementById("payment-details-body").classList.remove("collapsed");
  document.getElementById("payment-details-toggle").textContent = "⌃";
  showScreen("screen-success");
}
function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

/* ---------- Profile screen ---------- */
function loadProfileForm() {
  const p = getProfile();
  document.getElementById("profile-name").value = p.name;
  document.getElementById("profile-upi").value = p.upiId;
  document.getElementById("profile-balance").value = getBalance();
}
document.getElementById("save-profile-btn").addEventListener("click", () => {
  const name = document.getElementById("profile-name").value.trim() || DEFAULTS.name;
  const upiId = document.getElementById("profile-upi").value.trim() || DEFAULTS.upiId;
  const bal = document.getElementById("profile-balance").value;
  saveProfile({ name, upiId });
  if (bal !== "") setBalance(Number(bal));
  showScreen("screen-home");
});
document.getElementById("profile-btn").addEventListener("click", () => showScreen("screen-profile"));

/* ---------- Merchant / Receive (QR generation) ---------- */
document.getElementById("generate-qr-btn").addEventListener("click", () => {
  const amount = document.getElementById("merchant-amount").value;
  const p = getProfile();
  const payload = { app: "edupay-demo", name: p.name, upiId: p.upiId };
  if (amount) payload.amount = Number(amount);
  const qrDiv = document.getElementById("qrcode");
  qrDiv.innerHTML = "";
  // eslint-disable-next-line no-undef
  new QRCode(qrDiv, {
    text: JSON.stringify(payload),
    width: 220,
    height: 220,
    colorDark: "#0f172a",
    colorLight: "#ffffff",
  });
  document.getElementById("qr-caption").textContent = amount
    ? `Requesting ${fmt(amount)} to ${p.upiId}`
    : `Receive to ${p.upiId} (any amount)`;
  document.getElementById("qr-display").style.display = "block";
});

/* ---------- Scan (camera + jsQR) ---------- */
let stream = null;
let scanning = false;
let rafId = null;
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

function resetScanScreen() {
  document.getElementById("start-scan-btn").style.display = "block";
  document.getElementById("scan-frame").style.display = "none";
  document.getElementById("scan-status").textContent = "Point the camera at an EduPay QR code";
}

document.getElementById("start-scan-btn").addEventListener("click", async () => {
  const statusEl = document.getElementById("scan-status");
  statusEl.textContent = "Requesting camera...";
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
    video.srcObject = stream;
    await video.play();
    scanning = true;
    document.getElementById("start-scan-btn").style.display = "none";
    document.getElementById("scan-frame").style.display = "block";
    statusEl.textContent = "Scanning...";
    tick();
  } catch (err) {
    statusEl.textContent = "Camera unavailable: " + err.message;
  }
});

function stopCamera() {
  scanning = false;
  if (rafId) cancelAnimationFrame(rafId);
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
}

function tick() {
  if (!scanning) return;
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // eslint-disable-next-line no-undef
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
    if (code && code.data) {
      handleScannedQr(code.data);
      return;
    }
  }
  rafId = requestAnimationFrame(tick);
}

function handleScannedQr(text) {
  stopCamera();
  if (navigator.vibrate) navigator.vibrate(100);
  let payload;
  try {
    payload = JSON.parse(text);
  } catch (e) {
    payload = null;
  }
  if (payload && payload.app === "edupay-demo") {
    openConfirm({ name: payload.name || "Merchant", upiId: payload.upiId || "unknown@edu", amount: payload.amount || "" });
  } else {
    // Non-EduPay QR — still demonstrate the flow using the raw text as the "payee"
    openConfirm({ name: "Scanned QR", upiId: text.slice(0, 40), amount: "" });
  }
}

/* ---------- Manual send ---------- */
document.getElementById("send-continue-btn").addEventListener("click", () => {
  const name = document.getElementById("send-name").value.trim();
  const upiId = document.getElementById("send-upi").value.trim();
  const amount = document.getElementById("send-amount").value;
  if (!name || !upiId || !amount) {
    alert("Please fill in payee name, UPI ID and amount");
    return;
  }
  openConfirm({ name, upiId, amount });
});

/* ---------- Confirm screen ---------- */
let pendingTxn = null;
function openConfirm({ name, upiId, amount }) {
  pendingTxn = { name, upiId, amount };
  document.getElementById("confirm-avatar").textContent = (name[0] || "?").toUpperCase();
  document.getElementById("confirm-name").textContent = name;
  document.getElementById("confirm-upi").textContent = upiId;
  document.getElementById("confirm-amount").value = amount || "";
  showScreen("screen-confirm");
}
document.getElementById("confirm-pay-btn").addEventListener("click", () => {
  const amount = Number(document.getElementById("confirm-amount").value);
  if (!amount || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }
  if (amount > getBalance()) {
    alert("Insufficient demo balance. Reset it from Profile settings.");
    return;
  }
  pendingTxn.amount = amount;
  showScreen("screen-pin");
  resetPinPad();
});

/* ---------- PIN pad ---------- */
let pinEntered = "";
function resetPinPad() {
  pinEntered = "";
  renderPinDots();
}
function renderPinDots() {
  const dots = document.querySelectorAll("#pin-dots span");
  dots.forEach((d, i) => d.classList.toggle("filled", i < pinEntered.length));
}
document.querySelectorAll(".pin-key").forEach((btn) => {
  if (btn.id === "pin-clear" || btn.id === "pin-submit") return;
  btn.addEventListener("click", () => {
    if (pinEntered.length < 4) {
      pinEntered += btn.textContent;
      renderPinDots();
    }
  });
});
document.getElementById("pin-clear").addEventListener("click", () => {
  pinEntered = pinEntered.slice(0, -1);
  renderPinDots();
});
document.getElementById("pin-submit").addEventListener("click", () => {
  if (pinEntered.length !== 4) {
    alert("Enter all 4 digits (any digits work in this demo)");
    return;
  }
  completePayment();
});

/* ---------- Complete payment ---------- */
function completePayment() {
  const txnId = "DEMO" + Math.random().toString().slice(2, 12);
  const entry = {
    type: "sent",
    name: pendingTxn.name,
    upiId: pendingTxn.upiId,
    amount: pendingTxn.amount,
    time: new Date().toISOString(),
    txnId,
  };
  setBalance(getBalance() - pendingTxn.amount);
  addHistory(entry);

  openTransactionDetails(entry);
}
document.getElementById("success-done-btn").addEventListener("click", () => showScreen("screen-home"));
document.getElementById("transaction-back-btn").addEventListener("click", () => showScreen("screen-home"));
document.getElementById("transaction-more-btn").addEventListener("click", () => showToast("Transaction options are available in this demo."));
document.getElementById("payment-details-toggle").addEventListener("click", () => {
  const body = document.getElementById("payment-details-body");
  const btn = document.getElementById("payment-details-toggle");
  body.classList.toggle("collapsed");
  btn.textContent = body.classList.contains("collapsed") ? "⌄" : "⌃";
});
document.querySelectorAll(".copy-detail").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const target = document.getElementById(btn.dataset.copyTarget);
    if (!target) return;
    try { await navigator.clipboard.writeText(target.textContent); showToast("Copied to clipboard"); }
    catch (e) { showToast(target.textContent); }
  });
});
document.getElementById("send-again-btn").addEventListener("click", () => {
  if (!pendingTxn) return;
  openConfirm({ name: pendingTxn.name, upiId: pendingTxn.upiId, amount: pendingTxn.amount });
});
document.getElementById("view-history-btn").addEventListener("click", () => showScreen("screen-history"));
document.getElementById("split-expense-btn").addEventListener("click", () => showToast("Split Expense is a demo action."));
document.getElementById("share-receipt-btn").addEventListener("click", async () => {
  const text = `EduPay payment: ${document.getElementById("success-amount").textContent} to ${document.getElementById("success-name").textContent}`;
  if (navigator.share) { try { await navigator.share({ title: "EduPay Receipt", text }); } catch (e) {} }
  else showToast("Receipt sharing is available from your device share menu.");
});
document.getElementById("support-btn").addEventListener("click", () => showToast("EduPay Support is a classroom demo contact option."));

const historySearchInput = document.getElementById("history-search-input");
if (historySearchInput) historySearchInput.addEventListener("input", (e) => renderHistoryFull(e.target.value));
const historyFilterBtn = document.getElementById("history-filter-btn");
if (historyFilterBtn) historyFilterBtn.addEventListener("click", () => showToast("History filters are available in this demo."));
const statementsBtn = document.getElementById("statements-btn");
if (statementsBtn) statementsBtn.addEventListener("click", () => showToast("Statement download is a demo action."));
const historyHelp = document.querySelector(".history-help");
if (historyHelp) historyHelp.addEventListener("click", () => showToast("History shows your stored EduPay demo transactions."));

/* ---------- Clear history ---------- */
const clearHistoryBtn = document.getElementById("clear-history-btn");
if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener("click", () => {
    if (confirm("Clear all demo transaction history?")) {
      clearHistory();
      renderHistoryFull();
    }
  });
}

/* ---------- Service worker ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((e) => console.warn("SW failed", e));
  });
}

/* ---------- Init ---------- */
seedDemoHistoryIfNeeded();
showScreen("screen-home");
