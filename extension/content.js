chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapeWishlist") {
    // Scrape wishlist data from the page
    const items = [];

    // Example scraping logic (would need to be adapted to Amazon's actual DOM structure)
    document.querySelectorAll(".g-item-sortable").forEach((itemEl, index) => {
      const item = {
        id: itemEl.getAttribute("data-itemid") || `item-${index}`,
        title:
          itemEl.querySelector("h2.a-size-base")?.textContent?.trim() ||
          "Unknown",
        price:
          itemEl.querySelector(".a-price .a-offscreen")?.textContent?.trim() ||
          "Not available",
        originalPrice:
          itemEl
            .querySelector(".a-text-price .a-offscreen")
            ?.textContent?.trim() || "",
        imageUrl: itemEl.querySelector("img")?.src || "",
        stockStatus:
          itemEl.querySelector(".a-color-price")?.textContent?.trim() ||
          "In stock",
        addedDate:
          itemEl.querySelector(".item-added-date")?.textContent?.trim() ||
          "Unknown",
        deliveryEstimate:
          itemEl.querySelector(".item-availability")?.textContent?.trim() ||
          "Unknown",
      };
      items.push(item);
    });

    sendResponse({ success: true, items });
  }
});
