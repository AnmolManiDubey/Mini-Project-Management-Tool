import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useParams, Link } from "react-router-dom";
import type { Project } from "../types/project";
import type { Task, TaskStatus, TaskComment } from "../types/task";
import { useState } from "react";

const GET_PROJECT_DETAIL = gql`
  query GetProjectDetail($id: ID!) {
    project(id: $id) {
      id
      name
      description
      status
      taskCount
      completedTasks
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
        description
        status
        assigneeEmail
        dueDate
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
        content
        authorEmail
        createdAt
        task {
          id
        }
      }
    }
  }
`;

interface ProjectDetailData {
  project: Project & { tasks: Task[] };
}

interface ProjectDetailVars {
  id: string;
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();

  const { data, loading, error, refetch } = useQuery<
    ProjectDetailData,
    ProjectDetailVars
  >(GET_PROJECT_DETAIL, {
    variables: { id: id as string },
  });

  const [createTask] = useMutation(CREATE_TASK);
  const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS);
  const [addTaskComment] = useMutation(ADD_TASK_COMMENT);

  // Local state for new task form
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  // Local state for per-task comment form
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  if (!id) {
    return <div style={{ padding: "2rem" }}>No project id provided.</div>;
  }

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading project...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", color: "red" }}>
        Error loading project: {error.message}
      </div>
    );
  }

  if (!data || !data.project) {
    return <div style={{ padding: "2rem" }}>Project not found.</div>;
  }

  const project = data.project;

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
    await updateTaskStatus({
      variables: { taskId, status },
    });
    refetch();
  };

  const handleAddComment = async (task: Task) => {
    const content = commentText[task.id];
    if (!content) return;

    await addTaskComment({
      variables: {
        taskId: task.id,
        content,
        authorEmail: task.assigneeEmail, // simple assumption for demo
      },
    });

    setCommentText((prev) => ({ ...prev, [task.id]: "" }));
    refetch();
  };

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
      <Link to="/" style={{ fontSize: "0.9rem" }}>
        ← Back to projects
      </Link>

      <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0.5rem" }}>
        {project.name}
      </h1>
      {project.description && (
        <p style={{ color: "#4b5563", marginBottom: "0.5rem" }}>
          {project.description}
        </p>
      )}
      <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "1.5rem" }}>
        Status: {project.status} · Tasks: {project.taskCount} · Done:{" "}
        {project.completedTasks}
      </p>

      {/* New Task Form */}
      <section
        style={{
          marginBottom: "2rem",
          padding: "1rem",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          backgroundColor: "#ffffff",
        }}
      >
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
          Add New Task
        </h2>
        <form
          onSubmit={handleCreateTask}
          style={{ display: "grid", gap: "0.5rem" }}
        >
          <input
            type="text"
            placeholder="Task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: 4, border: "1px solid #e5e7eb" }}
          />
          <input
            type="email"
            placeholder="Assignee email"
            value={newTaskAssignee}
            onChange={(e) => setNewTaskAssignee(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: 4, border: "1px solid #e5e7eb" }}
          />
          <textarea
            placeholder="Description (optional)"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            style={{
              padding: "0.5rem",
              borderRadius: 4,
              border: "1px solid #e5e7eb",
              minHeight: 60,
            }}
          />
          <button
            type="submit"
            style={{
              alignSelf: "flex-start",
              padding: "0.5rem 1rem",
              borderRadius: 4,
              border: "none",
              backgroundColor: "#4f46e5",
              color: "white",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Create Task
          </button>
        </form>
      </section>

      {/* Task List */}
      <section>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Tasks</h2>
        {project.tasks.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No tasks yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {project.tasks.map((task: Task) => (
              <div
                key={task.id}
                style={{
                  padding: "1rem",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0 }}>{task.title}</h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.85rem",
                        color: "#6b7280",
                      }}
                    >
                      Assignee: {task.assigneeEmail}
                    </p>
                  </div>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(task.id, e.target.value as TaskStatus)
                    }
                    style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: 4,
                      border: "1px solid #d1d5db",
                    }}
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>

                {task.description && (
                  <p
                    style={{
                      marginTop: "0.25rem",
                      fontSize: "0.9rem",
                      color: "#4b5563",
                    }}
                  >
                    {task.description}
                  </p>
                )}

                {/* Comments */}
                <div style={{ marginTop: "0.75rem" }}>
                  <h4 style={{ fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                    Comments
                  </h4>
                  {task.comments.length === 0 ? (
                    <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                      No comments yet.
                    </p>
                  ) : (
                    <ul style={{ paddingLeft: "1rem", margin: 0 }}>
                      {task.comments.map((comment: TaskComment) => (
                        <li
                          key={comment.id}
                          style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}
                        >
                          <strong>{comment.authorEmail}:</strong>{" "}
                          {comment.content}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div style={{ marginTop: "0.5rem" }}>
                    <textarea
                      placeholder="Add a comment..."
                      value={commentText[task.id] || ""}
                      onChange={(e) =>
                        setCommentText((prev) => ({
                          ...prev,
                          [task.id]: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        minHeight: 50,
                        padding: "0.4rem",
                        borderRadius: 4,
                        border: "1px solid #e5e7eb",
                        fontSize: "0.85rem",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddComment(task)}
                      style={{
                        marginTop: "0.4rem",
                        padding: "0.35rem 0.8rem",
                        borderRadius: 4,
                        border: "none",
                        backgroundColor: "#10b981",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      Add Comment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
