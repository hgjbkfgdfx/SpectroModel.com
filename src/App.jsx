import React from "react";
import { HashRouter } from "react-router-dom";
import AutoRoutes from "./AutoRoutes.jsx";

export default function App() {
  return (
    <HashRouter>
      <div style={{ padding: 20, fontSize: 18 }}>
        ✅ App Mounted (if you see this, React is working)
      </div>
      <AutoRoutes />
    </HashRouter>
  );
}
