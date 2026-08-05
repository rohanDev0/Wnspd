import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Watch from "./Watch";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/watch/:id" element={<Watch />} />
    </Routes>
  );
}