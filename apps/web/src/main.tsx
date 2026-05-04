import React from "react";
import ReactDOM from "react-dom/client";

import "@workspace/ui/globals.css";
import "@/app/styles.css";

import { App } from "./app";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
