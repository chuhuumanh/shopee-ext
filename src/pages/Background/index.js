let urls = []; // Array of URLs to be processed
let currentIndex = 0;
let currentTabId = null; // To store the current tab ID

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'start') {
    urls = message.urls;
    currentIndex = 0;
    openNextTab();
  }
});

function openNextTab() {
  if (currentIndex < urls.length) {
    if (currentTabId !== null) {
      chrome.tabs.remove(currentTabId, () => {
        createNewTab();
      });
    } else {
      createNewTab();
    }
  }
}

function createNewTab() {
  chrome.tabs.create({ url: urls[currentIndex] }, (tab) => {
    currentTabId = tab.id;
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'next') {
    currentIndex++;
    openNextTab();
  }
});
