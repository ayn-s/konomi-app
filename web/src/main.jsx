import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// 見た目(読み込む順番も元のまま)
import "./styles/base.css";
import "./styles/background.css";
import "./styles/header.css";
import "./styles/hero.css";
import "./styles/machine.css";
import "./styles/scan.css";
import "./styles/history.css";
import "./styles/motion.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
