import { gql, useMutation } from "@apollo/client";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

/* =======================
   GraphQL
======================= */

const CREATE_PROJECT = gql`
  mutation CreateProject(
    $name: String!
    $description: String
    $status: String!
  ) {
    createProject(
      name: $name
      description: $description
      status: $status
    ) {
      project {
        id
        name
        status
      }
    }
  }
`;

/* =======================
   Component
======================= */

export default function CreateProject() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("ACTIVE");

    const [createProject, { loading, error }] = useMutation(CREATE_PROJECT, {
        onCompleted: () => {
            // Redirect back to projects list
            navigate("/projects");
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        await createProject({
            variables: {
                name,
                description: description || null,
                status,
            },
        });
    };

    return (
        <div className="max-w-xl mx-auto p-6">
            {/* Back link */}
            <Link to="/projects" className="text-sky-600 underline text-sm">
                ← Back to projects
            </Link>

            <h1 className="text-2xl font-semibold mt-4">
                Create New Project
            </h1>

            <p className="text-slate-600 mt-1">
                Fill in the details below to create a new project.
            </p>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="mt-6 bg-white border rounded-xl p-5 space-y-4"
            >
                {/* Project name */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Project name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Website Redesign"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Description (optional)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What is this project about?"
                        className="w-full border rounded-lg px-3 py-2 text-sm min-h-[90px] focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Status
                    </label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="ON_HOLD">On Hold</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>

                {/* Error */}
                {error && (
                    <p className="text-sm text-red-600">
                        {error.message}
                    </p>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                    >
                        {loading ? "Creating..." : "Create Project"}
                    </button>

                    <Link
                        to="/projects"
                        className="px-5 py-2 rounded-lg text-sm border text-slate-700 hover:bg-slate-50"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
