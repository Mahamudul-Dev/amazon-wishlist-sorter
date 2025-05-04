import db from "../db/db.js";

export const setCookie = (req, res) => {
  const { cookie } = req.body;

  db.serialize(() => {
    // Clear all previous cookies
    db.run("DELETE FROM cookie_meta", (deleteErr) => {
      if (deleteErr) {
        return res.status(500).json({ error: deleteErr.message });
      }

      // Insert new cookie
      db.run(
        "INSERT INTO cookie_meta (cookie, is_valid, refresh_time) VALUES (?, 1, ?)",
        [cookie, Date.now()],
        (insertErr) => {
          if (insertErr) {
            return res.status(500).json({ error: insertErr.message });
          }
          res.json({ success: true });
        }
      );
    });
  });
};



export const updateRefreshTime = (req, res) => {
  const newRefreshTime = Date.parse(req.body.refresh_time);

  if (isNaN(newRefreshTime)) {
    return res.status(400).json({ error: "Invalid refresh_time format" });
  }

  db.run(
    "UPDATE cookie_meta SET refresh_time = ? WHERE is_valid = 1",
    [newRefreshTime],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "No valid cookie found to update." });
      }

      res.json({ success: true, refresh_time: newRefreshTime });
    }
  );
};
