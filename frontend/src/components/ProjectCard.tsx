// frontend/src/components/ProjectCard.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

type Props = { project: Project };

export default function ProjectCard({ project }: Props) {
    const taskCount = project.tasks.length;
    const completedTasks = project.tasks.filter(
        (t) => t.status === "DONE"
    ).length;

    const completion =
        taskCount === 0 ? 0 : Math.round((completedTasks / taskCount) * 100);

    const [animatedPct, setAnimatedPct] = useState(0);

    useEffect(() => {
        const t = setTimeout(() => setAnimatedPct(completion), 80);
        return () => clearTimeout(t);
    }, [completion]);

    const pct = Math.min(100, Math.max(0, animatedPct));

    const progressColor =
        completion >= 66
            ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
            : completion >= 33
                ? "bg-gradient-to-r from-yellow-400 to-amber-600"
                : "bg-gradient-to-r from-sky-400 to-sky-600";

    return (
        <Link
            to={`/projects/${project.id}`}
            className="block focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-2xl"
        >
            <article className="bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-200 p-5 flex flex-col gap-4 h-full">
                {/* HEADER */}
                <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {project.name}
                    </h2>

                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                        {project.status}
                    </span>
                </div>

                {/* DESCRIPTION */}
                <p className="text-sm text-slate-600 line-clamp-3 min-h-[3rem]">
                    {project.description || (
                        <span className="italic text-slate-400">No description</span>
                    )}
                </p>

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
                        <span className="font-semibold text-slate-700">{taskCount}</span>
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
