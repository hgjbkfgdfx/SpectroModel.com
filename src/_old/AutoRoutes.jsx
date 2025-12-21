import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const modules = import.meta.glob("./**/*.jsx", { eager: true });

function isPagePath(p) {
  const s = p.toLowerCase();
  return (
    s.includes("/pages/") ||
    s.includes("/views/") ||
    s.includes("/routes/") ||
    s.includes("page") ||
    s.includes("dashboard") ||
    s.includes("home")
  );
}

function toRoutePath(file) {
  // strip leading "./"
  let clean = file.replace(/^\.\//, "").replace(/\.jsx$/, "");

  // remove common folder prefixes so routes are nicer
  clean = clean.replace(/^src\//, "");
  clean = clean.replace(/^components\//, "");
  clean = clean.replace(/^views\//, "");
  clean = clean.replace(/^pages\//, "");
  clean = clean.replace(/^routes\//, "");

  // Home becomes "/"
  if (clean.toLowerCase() === "home") return "/";

  // kebab-case segments
  return (
    "/" +
    clean
      .split("/")
      .filter(Boolean)
      .map((seg) =>
        seg
          .replace(/([a-z])([A-Z])/g, "$1-$2")
          .replace(/\s+/g, "-")
          .toLowerCase()
      )
      .join("/")
  );
}

export default function AutoRoutes() {
  const entries = Object.entries(modules).filter(([p, mod]) => mod?.default && isPagePath(p));

  if (entries.length === 0) {
    return (
      <div style={{ padding: 20 }}>
        ❌ No pages matched. Tell me where your page files are (pages/views/components).
      </div>
    );
  }

  return (
    <Routes>
      {entries.map(([file, mod]) => {
        const Component = mod.default;
        const path = toRoutePath(file);
        return <Route key={file} path={path} element={<Component />} />;
      })}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
