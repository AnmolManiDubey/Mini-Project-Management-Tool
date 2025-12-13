// frontend/src/components/ProjectDetail.tsx
import { gql, useQuery, useMutation } from "@apollo/client";
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import type { Project } from "../types/project";
import type { Task, TaskStatus, TaskComment } from "../types/task";

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
        title
        status
      }
    }
  }
`;

const UPDATE_TASK_STATUS = gql`
  mutation UpdateTaskStatus($taskId: ID!, $status: String!) {
    updateTaskStatus(taskId: $taskId, status: $status) {
      task {
        id
        status
      }
    }
  }
`;

const ADD_TASK_COMMENT = gql`
  mutation AddTaskComment(
    $taskId: ID!
    $content: String!
    $authorEmail: String!
  ) {
    addTaskComment(
      taskId: $taskId
      content: $content
      authorEmail: $authorEmail
    ) {
      comment {
        id
      }
    }
  }
`;

/* =======================
   Types
======================= */

interface ProjectDetailData {
  project: Project & { tasks: Task[] };
}

interface ProjectDetailVars {
  id: string;
}

/* =======================
   Component
======================= */

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();

  /* Defensive routing guard */
  if (!id) {
    return <div className="p-6 text-red-600">Invalid project ID.</div>;
  }

  const { data, loading, error, refetch } = useQuery<
    ProjectDetailData,
    ProjectDetailVars
  >(GET_PROJECT_DETAIL, {
    variables: { id },
  });

  const [createTask] = useMutation(CREATE_TASK);
  const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS);
  const [addTaskComment] = useMutation(ADD_TASK_COMMENT);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  if (loading) return <div className="p-6">Loading project…</div>;
  if (error)
    return (
      <div className="p-6 text-red-600">
        Error loading project: {error.message}
      </div>
    );
  if (!data?.project)
    return <div className="p-6">Project not found.</div>;

  const project = data.project;

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
        dueDate: null,
      },
    });

    setNewTaskTitle("");
    setNewTaskAssignee("");
    setNewTaskDescription("");
    refetch();
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await updateTaskStatus({ variables: { taskId, status } });
    refetch();
  };

  const handleAddComment = async (task: Task) => {
    const content = commentText[task.id];
    if (!content) return;

    await addTaskComment({
      variables: {
        taskId: task.id,
        content,
        authorEmail: task.assigneeEmail,
      },
    });

    setCommentText((prev) => ({ ...prev, [task.id]: "" }));
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

      <h1 className="text-2xl font-semibold mt-3">{project.name}</h1>
      {project.description && (
        <p className="text-slate-600 mt-1">{project.description}</p>
      )}

      {/* Create Task */}
      <section className="mt-6 p-4 border rounded-lg bg-white">
        <h2 className="font-semibold mb-3">Add New Task</h2>
        <form onSubmit={handleCreateTask} className="grid gap-2">
          <input
            className="border rounded px-2 py-1"
            placeholder="Task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <input
            className="border rounded px-2 py-1"
            placeholder="Assignee email"
            value={newTaskAssignee}
            onChange={(e) => setNewTaskAssignee(e.target.value)}
          />
          <textarea
            className="border rounded px-2 py-1"
            placeholder="Description"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
          />
          <button className="self-start bg-indigo-600 text-white px-4 py-1 rounded">
            Create Task
          </button>
        </form>
      </section>

      {/* Tasks */}
      <section className="mt-6">
        <h2 className="font-semibold mb-3">Tasks</h2>
        {project.tasks.length === 0 ? (
          <p className="text-slate-500">No tasks yet.</p>
        ) : (
          <div className="grid gap-4">
            {project.tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border rounded-lg bg-white"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-slate-500">
                      {task.assigneeEmail}
                    </p>
                  </div>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(
                        task.id,
                        e.target.value as TaskStatus
                      )
                    }
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>

                {/* Comments */}
                <div className="mt-3">
                  <h4 className="text-sm font-medium">Comments</h4>
                  {task.comments.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      No comments yet.
                    </p>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {task.comments.map((c: TaskComment) => (
                        <li key={c.id} className="text-sm">
                          <strong>{c.authorEmail}:</strong> {c.content}
                        </li>
                      ))}
                    </ul>
                  )}

                  <textarea
                    className="mt-2 w-full border rounded px-2 py-1 text-sm"
                    placeholder="Add a comment…"
                    value={commentText[task.id] || ""}
                    onChange={(e) =>
                      setCommentText((p) => ({
                        ...p,
                        [task.id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    onClick={() => handleAddComment(task)}
                    className="mt-1 bg-emerald-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
