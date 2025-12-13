// frontend/src/components/ProjectList.tsx
import React from "react";
import { useQuery, gql } from "@apollo/client";
import ProjectCard from "./ProjectCard";
import Layout from "./Layout";
import { Link } from "react-router-dom";

const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      description
      status
      tasks {
        id
        title
        status
      }
    }
  }
`;

type Task = {
  id: string;
  title: string;
  status: string;
};

type Project = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  tasks: Task[];
};

type ProjectsData = {
  projects: Project[];
};

export default function ProjectList() {
  const { data, loading, error } = useQuery<ProjectsData>(GET_PROJECTS);

  const projects = data?.projects ?? [];

  return (
    <Layout title="Projects">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>

        <Link
          to="/projects/create"
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-sm"
        >
          + New Project
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading projects…</div>
      ) : error ? (
        <div className="py-12 text-center text-red-600">{error.message}</div>
      ) : projects.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          No projects found.
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
