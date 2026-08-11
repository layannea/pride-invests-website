module.exports = function (cfg) {
  cfg.addFilter("lines", (v) => String(v == null ? "" : v).split(/\r?\n/).map((s) => s.trim()).filter(Boolean));
  cfg.addPassthroughCopy({ "src/css": "css", "src/js": "js", "src/media": "media",
    "src/cms/config.yml": "cms/config.yml", "src/robots.txt": "robots.txt", "src/sitemap.xml": "sitemap.xml" });
  return { dir: { input: "src", output: "_site", includes: "_includes", data: "_data" } };
};
 