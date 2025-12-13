// frontend/src/components/ProjectCard.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/* =======================
   Types
======================= */

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
    dueDate?: string | null;
    tasks: Task[];
};

type Props = { project: Project };

/* =======================
   Helpers
======================= */

function getDueStatus(dueDate?: string | null) {
    if (!dueDate) return "normal";

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

export default function ProjectCard({ project }: Props) {
    const taskCount = project.tasks.length;
    const completedTasks = project.tasks.filter(
        (t) => t.status === "DONE"
    ).length;

    const completion =
        taskCount === 0 ? 0 : Math.round((completedTasks / taskCount) * 100);

    /* Animated progress */
    const [animatedPct, setAnimatedPct] = useState(0);

    useEffect(() => {
        const t = setTimeout(() => setAnimatedPct(completion), 80);
        return () => clearTimeout(t);
    }, [completion]);

    const pct = Math.min(100, Math.max(0, animatedPct));

    /* Progress color */
    const progressColor =
        completion >= 66
            ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
            : completion >= 33
                ? "bg-gradient-to-r from-yellow-400 to-amber-600"
                : "bg-gradient-to-r from-sky-400 to-sky-600";

    /* Due-date logic */
    const dueStatus = getDueStatus(project.dueDate);

    const borderVariant =
        dueStatus === "overdue"
            ? "border-red-300"
            : dueStatus === "soon"
                ? "border-amber-300"
                : "border-slate-200";

    const dueBadge =
        dueStatus === "overdue"
            ? "bg-red-100 text-red-700 border-red-200"
            : dueStatus === "soon"
                ? "bg-amber-100 text-amber-700 border-amber-200"
                : "bg-slate-100 text-slate-600 border-slate-200";

    return (
        <Link
            to={`/projects/${project.id}`}
            className="block focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-2xl"
        >
            <article
                className={`bg-white rounded-2xl border ${borderVariant}
                    shadow-sm hover:shadow-lg transition-all duration-200
                    p-5 flex flex-col gap-4 h-full`}
            >
                {/* HEADER */}
                <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {project.name}
                    </h2>

                    <span className="px-3 py-1 rounded-full text-sm font-semibold
                           bg-sky-100 text-sky-800 border border-sky-200">
                        {project.status}
                    </span>
                </div>

                {/* DESCRIPTION */}
                <p className="text-sm text-slate-600 line-clamp-3 min-h-[3rem]">
                    {project.description || (
                        <span className="italic text-slate-400">
                            No description
                        </span>
                    )}
                </p>

                {/* DUE DATE */}
                {project.dueDate && (
                    <span
                        className={`inline-block w-fit px-2 py-0.5 rounded-full
                        text-xs border ${dueBadge}`}
                    >
                        Due: {new Date(project.dueDate).toLocaleDateString()}
                    </span>
                )}

                {/* PROGRESS */}
                <div className="mt-auto">
                    <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex-1">
                            <div
                                className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden"
                                role="progressbar"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={pct}
                            >
                                <div
                                    className={`h-2.5 rounded-full transition-all duration-700 ${progressColor}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>

                        <div className="w-14 text-right text-sm font-medium text-slate-900">
                            {pct}%
                        </div>
                    </div>

                    {/* STATS */}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">
                            {taskCount}
                        </span>
                        <span>Tasks</span>
                        <span className="font-semibold text-slate-700">
                            {completedTasks}
                        </span>
                        <span>Done</span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
