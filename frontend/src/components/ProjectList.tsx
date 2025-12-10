import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import type { Project } from "../types/project";
import { Link } from "react-router-dom";
import { useState } from "react";

const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      description
      status
      taskCount
      completedTasks
    }
  }
`;

const CREATE_PROJECT = gql`
  mutation CreateProject(
    $name: String!
    $description: String
    $status: String
    $dueDate: Date
  ) {
    createProject(
      name: $name
      description: $description
      status: $status
      dueDate: $dueDate
    ) {
      project {
        id
        name
        description
        status
        taskCount
        completedTasks
      }
    }
  }
`;

interface ProjectsQueryData {
  projects: Project[];
}

type StatusFilter = "ALL" | "ACTIVE" | "COMPLETED" | "ON_HOLD";

export function ProjectList() {
  const { data, loading, error } = useQuery<ProjectsQueryData>(GET_PROJECTS);
  const [createProject] = useMutation(CREATE_PROJECT, {
    refetchQueries: ["GetProjects"],
  });

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  // New project form state
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectStatus, setNewProjectStatus] =
    useState<Extract<StatusFilter, "ACTIVE" | "COMPLETED" | "ON_HOLD">>(
      "ACTIVE"
    );
  const [newProjectDueDate, setNewProjectDueDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <div className="page">Loading projects...</div>;
  }

  if (error) {
    return (
      <div className="page" style={{ color: "red" }}>
        Error loading projects: {error.message}
      </div>
    );
  }

  if (!data || data.projects.length === 0) {
    // Show empty state but still allow project creation
    return (
      <div className="page">
        <div className="projects-layout">
          <section className="projects-main">
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">
              No projects found yet. Create your first project on the right to
              get started.
            </p>
            <p className="muted-text" style={{ marginTop: "1rem" }}>
              Once you create a project, it will appear here with basic stats
              like status, task count, and completion rate.
            </p>
          </section>

          <section className="projects-sidebar card">
            <h2 className="section-title">Create New Project</h2>
            <NewProjectForm
              newProjectName={newProjectName}
              setNewProjectName={setNewProjectName}
              newProjectDescription={newProjectDescription}
              setNewProjectDescription={setNewProjectDescription}
              newProjectStatus={newProjectStatus}
              setNewProjectStatus={setNewProjectStatus}
              newProjectDueDate={newProjectDueDate}
              setNewProjectDueDate={setNewProjectDueDate}
              formError={formError}
              setFormError={setFormError}
              submitting={submitting}
              setSubmitting={setSubmitting}
              createProject={createProject}
            />
          </section>
        </div>
      </div>
    );
  }

  const filteredProjects =
    statusFilter === "ALL"
      ? data.projects
      : data.projects.filter((p) => p.status === statusFilter);

  const totalProjects = data.projects.length;
  const activeProjects = data.projects.filter(
    (p) => p.status === "ACTIVE"
  ).length;
  const completedProjects = data.projects.filter(
    (p) => p.status === "COMPLETED"
  ).length;

  return (
    <div className="page">
      <div className="projects-layout">
        {/* Left side: list + filters */}
        <section className="projects-main">
          {/* Page header & context */}
          <div className="toolbar">
            <div>
              <h1 className="page-title">Projects</h1>
              <p className="page-subtitle">
                Overview of all projects in your organization. Filter by status
                and click a project to manage tasks and comments.
              </p>
            </div>

            {/* Filter pills */}
            <div className="filter-group">
              <button
                type="button"
                className={`filter-chip ${
                  statusFilter === "ALL" ? "active" : ""
                }`}
                onClick={() => setStatusFilter("ALL")}
              >
                All ({totalProjects})
              </button>
              <button
                type="button"
                className={`filter-chip ${
                  statusFilter === "ACTIVE" ? "active" : ""
                }`}
                onClick={() => setStatusFilter("ACTIVE")}
              >
                Active ({activeProjects})
              </button>
              <button
                type="button"
                className={`filter-chip ${
                  statusFilter === "COMPLETED" ? "active" : ""
                }`}
                onClick={() => setStatusFilter("COMPLETED")}
              >
                Completed ({completedProjects})
              </button>
              <button
                type="button"
                className={`filter-chip ${
                  statusFilter === "ON_HOLD" ? "active" : ""
                }`}
                onClick={() => setStatusFilter("ON_HOLD")}
              >
                On hold
              </button>
            </div>
          </div>

          {/* Projects grid */}
          <div className="project-grid">
            {filteredProjects.length === 0 ? (
              <p className="muted-text">
                No projects match this filter. Try a different status.
              </p>
            ) : (
              filteredProjects.map((project) => {
                const completionRate =
                  project.taskCount === 0
                    ? 0
                    : Math.round(
                        (project.completedTasks / project.taskCount) * 100
                      );

                const statusClass =
                  project.status === "ACTIVE"
                    ? "status-pill status-active"
                    : project.status === "COMPLETED"
                    ? "status-pill status-completed"
                    : "status-pill status-on-hold";

                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div className="project-card">
                      <div className="project-card-header">
                        <h2 className="project-card-title">
                          {project.name}
                        </h2>
                        <span className={statusClass}>
                          {project.status}
                        </span>
                      </div>

                      {project.description && (
                        <p className="project-card-description">
                          {project.description}
                        </p>
                      )}

                      <div className="project-card-footer">
                        <span>Tasks: {project.taskCount}</span>
                        <span>Done: {project.completedTasks}</span>
                        <span>{completionRate}% complete</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {/* Right side: new project form */}
        <section className="projects-sidebar card">
          <h2 className="section-title">Create New Project</h2>
          <NewProjectForm
            newProjectName={newProjectName}
            setNewProjectName={setNewProjectName}
            newProjectDescription={newProjectDescription}
            setNewProjectDescription={setNewProjectDescription}
            newProjectStatus={newProjectStatus}
            setNewProjectStatus={setNewProjectStatus}
            newProjectDueDate={newProjectDueDate}
            setNewProjectDueDate={setNewProjectDueDate}
            formError={formError}
            setFormError={setFormError}
            submitting={submitting}
            setSubmitting={setSubmitting}
            createProject={createProject}
          />
        </section>
      </div>
    </div>
  );
}

interface NewProjectFormProps {
  newProjectName: string;
  setNewProjectName: (v: string) => void;
  newProjectDescription: string;
  setNewProjectDescription: (v: string) => void;
  newProjectStatus: "ACTIVE" | "COMPLETED" | "ON_HOLD";
  setNewProjectStatus: (v: "ACTIVE" | "COMPLETED" | "ON_HOLD") => void;
  newProjectDueDate: string;
  setNewProjectDueDate: (v: string) => void;
  formError: string | null;
  setFormError: (v: string | null) => void;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
  createProject: ReturnType<typeof useMutation>[0];
}

function NewProjectForm({
  newProjectName,
  setNewProjectName,
  newProjectDescription,
  setNewProjectDescription,
  newProjectStatus,
  setNewProjectStatus,
  newProjectDueDate,
  setNewProjectDueDate,
  formError,
  setFormError,
  submitting,
  setSubmitting,
  createProject,
}: NewProjectFormProps) {
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newProjectName.trim()) {
      setFormError("Project name is required.");
      return;
    }

    try {
      setSubmitting(true);
      await createProject({
        variables: {
          name: newProjectName.trim(),
          description: newProjectDescription.trim() || null,
          status: newProjectStatus,
          dueDate: newProjectDueDate || null,
        },
      });

      setNewProjectName("");
      setNewProjectDescription("");
      setNewProjectStatus("ACTIVE");
      setNewProjectDueDate("");
      setFormError(null);
    } catch (err) {
      // Basic error surface; could be improved with toast
      setFormError("Failed to create project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form-grid" onSubmit={handleCreateProject} noValidate>
      <div>
        <label className="label">Project name</label>
        <input
          type="text"
          className="input"
          placeholder="Customer success portal"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />
      </div>

      <div className="form-full">
        <label className="label">Description</label>
        <textarea
          className="textarea"
          placeholder="Short description of what this project is about."
          value={newProjectDescription}
          onChange={(e) => setNewProjectDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor="project-status">
          Status
        </label>
        <select
          id="project-status"
          className="select"
          value={newProjectStatus}
          onChange={(e) =>
            setNewProjectStatus(e.target.value as "ACTIVE" | "COMPLETED" | "ON_HOLD")
          }
        >
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="ON_HOLD">On hold</option>
        </select>
      </div>

      <div>
        <label className="label" htmlFor="project-due-date">
          Due date (optional)
        </label>
        <input
          id="project-due-date"
          type="date"
          className="input"
          value={newProjectDueDate}
          onChange={(e) => setNewProjectDueDate(e.target.value)}
        />
      </div>

      {formError && <div className="form-error">{formError}</div>}

      <button type="submit" className="button-primary" disabled={submitting}>
        {submitting ? "Creating..." : "Create Project"}
      </button>
    </form>
  );
}

// default export so App.tsx `import ProjectList from ...` still works
export default ProjectList;
