import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProjectList from "./components/ProjectList";
import { ProjectDetail } from "./components/ProjectDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProjectList />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;