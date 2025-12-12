// frontend/src/components/ProjectCard.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type MinimalProject = {
    id: string;
    name: string;
    description?: string | null;
    status?: string | null;
    taskCount?: number | null;
    completedTasks?: number | null;
    slug?: string | null;
};

type Props = { project?: MinimalProject };

// Safe compute with fallback
function computeCompletion(project?: MinimalProject) {
    if (!project) return 0;
    const total = project.taskCount ?? 0;
    const done = project.completedTasks ?? 0;
    return total === 0 ? 0 : Math.round((done / total) * 100);
}

function statusVariant(status?: string | null) {
    const s = (status || "").toLowerCase();
    if (s.includes("done") || s.includes("completed")) return "completed";
    if (s.includes("in") || s.includes("progress")) return "inprogress";
    if (s.includes("hold") || s.includes("on-hold")) return "onhold";
    return "active";
}

export default function ProjectCard({ project }: Props) {
    if (!project) {
        console.warn("⚠ ProjectCard received undefined project");
        return null;
    }

    const completion = computeCompletion(project);
    const [animatedPct, setAnimatedPct] = useState(0);
    const variant = statusVariant(project.status);
    const toPath = project.slug ? `/projects/${project.slug}` : `/projects/${project.id}`;

    const pct = Math.max(0, Math.min(100, animatedPct));
    const pctStr = `${pct}`;

    useEffect(() => {
        const t = setTimeout(() => setAnimatedPct(completion), 100);
        return () => clearTimeout(t);
    }, [completion]);

    const progressBarColor =
        completion >= 66
            ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
            : completion >= 33
                ? "bg-gradient-to-r from-yellow-400 to-amber-600"
                : "bg-gradient-to-r from-sky-400 to-sky-600";

    return (
        <article className="relative bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-200">

            {/* Clickable card wrapper */}
            <Link
                to={toPath}
                className="absolute inset-0 rounded-2xl z-0 focus:outline-none focus:ring-4 focus:ring-sky-300"
                aria-label={`Open ${project.name}`}
            />

            <div className="relative z-10 p-5 flex flex-col gap-4 h-full">

                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold text-slate-900">{project.name}</h2>

                    <span
                        className={`inline-flex items-center text-sm font-semibold px-3 py-1 rounded-full border ${{
                                active: "bg-emerald-100 text-emerald-800 border-emerald-200",
                                inprogress: "bg-sky-100 text-sky-800 border-sky-200",
                                completed: "bg-slate-100 text-slate-800 border-slate-200",
                                onhold: "bg-amber-100 text-amber-900 border-amber-200",
                            }[variant]
                            }`}
                    >
                        {project.status ?? "Active"}
                    </span>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 line-clamp-3 min-h-[3rem]">
                    {project.description || <span className="italic text-slate-400">No description</span>}
                </p>

                {/* Progress Bar */}
                <div className="mt-auto">
                    <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex-1">
                            <div
                                className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden"
                                role="progressbar"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={pct}
                                aria-valuetext={`${pctStr}% complete`}
                            >
                                <div
                                    className={`h-2.5 rounded-full transition-all duration-700 ease-out ${progressBarColor}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>

                        <div className="w-14 text-right text-sm font-medium text-slate-900">
                            {pctStr}%
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{project.taskCount ?? 0}</span> Tasks
                        <span className="font-semibold text-slate-700">{project.completedTasks ?? 0}</span> Done
                    </div>
                </div>
            </div>
        </article>
    );
}
