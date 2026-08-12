module.exports = function (cfg) {
  cfg.addFilter("lines", (v) => String(v == null ? "" : v).split(/\r?\n/).map((s) => s.trim()).filter(Boolean));
  cfg.addFilter("findSlug", (arr, slug) => (arr || []).find((p) => p.fileSlug === slug));
  cfg.addFilter("bySlug", (arr, slug) => (arr || []).find((f) => f.slug === slug));
  cfg.addCollection("louayzehFamilies", (api) => {
    const lv = api.getFilteredByGlob("src/content/projects/louayzeh-village.md")[0];
    return (lv && lv.data.families) || [];
  });
  cfg.addFilter("pageLabel", (u) => {
    if (!u || u === "/") return "Homepage";
    return u.split("/").filter(Boolean).map((seg) =>
      seg === "faq" ? "FAQ" : seg.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    ).join(" · ");
  });
  cfg.addCollection("projectPages", (api) => api.getFilteredByGlob("src/content/projects/*.md"));
  cfg.addPassthroughCopy({ "src/css": "css", "src/js": "js", "src/media": "media",
    "src/cms/config.yml": "cms/config.yml", "src/robots.txt": "robots.txt", "src/sitemap.xml": "sitemap.xml" });
  return { dir: { input: "src", output: "_site", includes: "_includes", data: "_data" } };
};