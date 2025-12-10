import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProjectList from "./components/ProjectList";
import { ProjectDetail } from "./components/ProjectDetail";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<ProjectList />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
