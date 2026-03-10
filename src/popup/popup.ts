const dot = document.getElementById("dot")!;
const statusText = document.getElementById("statusText")!;
const openBtn = document.getElementById("openPanel")!;

// Check if API key is configured
chrome.storage.local.get("settings").then((result) => {
  const settings = result.settings || {};
  if (settings.openrouterApiKey) {
    dot.className = "dot dot-green";
    statusText.textContent = "Ready — API key configured";
  } else {
    dot.className = "dot dot-red";
    statusText.textContent = "Setup needed — no API key";
  }
});

openBtn.addEventListener("click", async () => {
  // Open side panel
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await chrome.sidePanel.open({ tabId: tab.id });
  }
  window.close();
});
