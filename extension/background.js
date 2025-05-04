chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "getCookies") {
    chrome.cookies.getAll({ domain: ".amazon.com" }, (cookies) => {
      sendResponse({ cookies });
    });
    return true; // Keeps the message channel open
  }
});
