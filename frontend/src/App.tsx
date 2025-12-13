// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProjectList from "./components/ProjectList";
import ProjectDetail from "./components/ProjectDetail";
import CreateProject from "./components/CreateProject";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />

        <Route path="/projects" element={<ProjectList />} />

        <Route path="/projects/create" element={<CreateProject />} />

        <Route path="/projects/:id" element={<ProjectDetail />} />

        <Route
          path="*"
          element={<div className="p-6 text-red-600">Page not found</div>}
        />
      </Routes>
    </BrowserRouter>
  );
}
