// frontend/src/components/ProjectList.tsx
import * as React from "react";
import { useQuery, gql } from "@apollo/client"; 
import ProjectCard from "./ProjectCard";
import { Link } from "react-router-dom";
import Layout from "./Layout";
const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      description
      status
      taskCount
      completedTasks
      slug
    }
  }
`;

type Project = {
  id: string;
  name: string;
  description?: string | null;
  status?: string | null;
  taskCount?: number | null;
  completedTasks?: number | null;
  slug?: string | null;
};

type ProjectsData = {
  // Explicitly allow null/undefined items, which you are correctly filtering later
  projects?: (Project | null | undefined)[] | null;
};

// Removed useEffect and useState imports as they are unused in ProjectList.tsx
export default function ProjectList() {
  const { data, loading, error } = useQuery<ProjectsData>(GET_PROJECTS, {
    fetchPolicy: "cache-and-network",
  });

  // Data Filtering (Safeguard against runtime error: Cannot read properties of undefined)
  const projects: Project[] =
    data?.projects?.filter((p): p is Project => p !== null && p !== undefined) ?? [];

  return (
    <Layout title="Projects">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>

        <Link
          to="/projects/create"
          className="inline-flex items-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg shadow-sm"
        >
          + New Project
        </Link>
      </div>

      {loading && !data ? (
        <div className="py-12 text-center text-slate-500">Loading projects…</div>
      ) : error ? (
        <div className="py-12 text-center text-red-600">Error loading projects: {error.message}</div>
      ) : projects.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          No projects found. Click{" "}
          <Link to="/projects/create" className="text-sky-600 underline">
            New Project
          </Link>{" "}
          to create one.
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </section>
      )}
    </Layout>
  );
}