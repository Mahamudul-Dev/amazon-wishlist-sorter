document.getElementById("sendCookies").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "getCookies" }, async (response) => {
    const cookieHeader = response.cookies
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    await fetch("http://localhost:5050/api/cookie/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cookie: cookieHeader }),
    });
    alert("Cookies sent to server!");
  });
});
