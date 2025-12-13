// frontend/src/components/ProjectDetail.tsx
import { gql, useQuery, useMutation } from "@apollo/client";
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import type { Project } from "../types/project";
import type { Task, TaskStatus } from "../types/task";

/* =======================
   GraphQL
======================= */

const GET_PROJECT_DETAIL = gql`
  query GetProjectDetail($id: ID!) {
    project(id: $id) {
      id
      name
      description
      status
      tasks {
        id
        title
        description
        status
        assigneeEmail
        dueDate
        comments {
          id
          content
          authorEmail
          createdAt
        }
      }
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask(
    $projectId: ID!
    $title: String!
    $description: String
    $status: String
    $assigneeEmail: String!
    $dueDate: Date
  ) {
    createTask(
      projectId: $projectId
      title: $title
      description: $description
      status: $status
      assigneeEmail: $assigneeEmail
      dueDate: $dueDate
    ) {
      task {
        id
      }
    }
  }
`;

const UPDATE_TASK_STATUS = gql`
  mutation UpdateTaskStatus($taskId: ID!, $status: String!) {
    updateTaskStatus(taskId: $taskId, status: $status) {
      task {
        id
      }
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($taskId: ID!) {
    deleteTask(taskId: $taskId) {
      ok
    }
  }
`;

const DELETE_PROJECT = gql`
  mutation DeleteProject($projectId: ID!) {
    deleteProject(projectId: $projectId) {
      ok
    }
  }
`;

/* =======================
   Helpers
======================= */

function getDueStatus(dueDate?: string | null, status?: string) {
  if (!dueDate || status === "DONE") return "normal";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffDays =
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "overdue";
  if (diffDays <= 2) return "soon";
  return "normal";
}

/* =======================
   Component
======================= */

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div className="p-6 text-red-600">Invalid project ID.</div>;
  }

  const { data, loading, error, refetch } = useQuery(GET_PROJECT_DETAIL, {
    variables: { id },
  });

  const [createTask] = useMutation(CREATE_TASK);
  const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS);
  const [deleteTask] = useMutation(DELETE_TASK);
  const [deleteProject] = useMutation(DELETE_PROJECT);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState<string | null>(null);

  if (loading) return <div className="p-6">Loading project…</div>;
  if (error) return <div className="p-6 text-red-600">{error.message}</div>;
  if (!data?.project) return <div className="p-6">Project not found.</div>;

  const project: Project & { tasks: Task[] } = data.project;

  /* =======================
     Handlers
  ======================= */

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskAssignee) return;

    await createTask({
      variables: {
        projectId: project.id,
        title: newTaskTitle,
        description: newTaskDescription || null,
        assigneeEmail: newTaskAssignee,
        status: "TODO",
        dueDate: newTaskDueDate || null,
      },
    });

    setNewTaskTitle("");
    setNewTaskAssignee("");
    setNewTaskDescription("");
    setNewTaskDueDate(null);
    refetch();
  };

  /* =======================
     UI
  ======================= */

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/projects" className="text-sky-600 underline text-sm">
        ← Back to projects
      </Link>

      <div className="flex justify-between items-start mt-3">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          {project.description && (
            <p className="text-slate-600 mt-1">{project.description}</p>
          )}
        </div>

        <button
          onClick={async () => {
            if (!window.confirm("Delete this project?")) return;
            await deleteProject({ variables: { projectId: project.id } });
            window.location.href = "/projects";
          }}
          className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md"
        >
          🗑️ Delete project
        </button>
      </div>

      {/* =======================
          Create Task Form
      ======================= */}
      <section className="mt-6 p-4 border rounded-lg bg-white">
        <h2 className="font-semibold mb-3">Add New Task</h2>

        <form onSubmit={handleCreateTask} className="grid gap-3">
          <div>
            <label
              htmlFor="task-title"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Task title
            </label>
            <input
              id="task-title"
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full border rounded px-2 py-1"
              required
            />
          </div>

          <div>
            <label
              htmlFor="task-assignee"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Assignee email
            </label>
            <input
              id="task-assignee"
              type="email"
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value)}
              className="w-full border rounded px-2 py-1"
              required
            />
          </div>

          <div>
            <label
              htmlFor="task-due-date"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Due date (optional)
            </label>
            <input
              id="task-due-date"
              type="date"
              value={newTaskDueDate ?? ""}
              onChange={(e) => setNewTaskDueDate(e.target.value || null)}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label
              htmlFor="task-description"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Description (optional)
            </label>
            <textarea
              id="task-description"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <button className="self-start bg-indigo-600 text-white px-4 py-1 rounded">
            Create Task
          </button>
        </form>
      </section>

      {/* =======================
          Tasks List
      ======================= */}
      <section className="mt-6">
        <h2 className="font-semibold mb-3">Tasks</h2>

        {project.tasks.length === 0 ? (
          <p className="text-slate-500">No tasks yet.</p>
        ) : (
          <div className="grid gap-4">
            {project.tasks.map((task) => {
              const dueStatus = getDueStatus(task.dueDate, task.status);
              const dueBadge =
                dueStatus === "overdue"
                  ? "bg-red-100 text-red-700"
                  : dueStatus === "soon"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600";

              return (
                <div
                  key={task.id}
                  className="p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold">{task.title}</h3>
                      <p className="text-sm text-slate-500">
                        {task.assigneeEmail}
                      </p>
                      {task.dueDate && (
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${dueBadge}`}
                        >
                          Due:{" "}
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <select
                      value={task.status}
                      onChange={(e) =>
                        updateTaskStatus({
                          variables: {
                            taskId: task.id,
                            status: e.target.value as TaskStatus,
                          },
                        }).then(refetch)
                      }
                      className="border rounded-md px-2 py-1 text-sm bg-white"
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="DONE">DONE</option>
                    </select>
                  </div>

                  <div className="mt-4 pt-3 border-t flex justify-end">
                    <button
                      onClick={() => {
                        if (!window.confirm("Delete this task?")) return;
                        deleteTask({ variables: { taskId: task.id } }).then(
                          refetch
                        );
                      }}
                      className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md"
                    >
                      🗑️ Delete task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
