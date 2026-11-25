import { createRoot } from "react-dom/client";
import App from "./game/SilverMoon";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("missing #root");
createRoot(root).render(<App />);
