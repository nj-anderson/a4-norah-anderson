import React from "react";
import { createRoot } from "react-dom/client";

function App() {
    return (
        <h1>React is working!</h1>
    );
}

createRoot(document.getElementById("root")).render(
    <App />
);