import { GitFork, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { HomeProject } from '@/lib/home';

interface ProjectListProps {
  projects: HomeProject[];
  compact?: boolean;
  limit?: number;
}

export default function ProjectList({ projects, compact = false, limit }: ProjectListProps) {
  const visibleProjects = typeof limit === 'number' ? projects.slice(0, limit) : projects;

  const renderProjectMark = (project: HomeProject, compactMode = false) => {
    const sizeClass = compactMode ? 'h-9 w-9 rounded-lg' : 'h-10 w-10 rounded-xl sm:h-9 sm:w-9 sm:rounded-lg';

    if (project.logo) {
      return (
        <div className={cn('shrink-0 overflow-hidden border border-black/6 bg-white p-1.5 dark:border-white/10 dark:bg-slate-900/80', sizeClass)}>
          <img src={project.logo} alt={`${project.name} logo`} className="h-full w-full object-contain" loading="lazy" referrerPolicy="no-referrer" />
        </div>
      );
    }

    return (
      <div className={cn('flex shrink-0 items-center justify-center text-xs font-bold text-white', sizeClass, project.color)}>
        {project.initial}
      </div>
    );
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {visibleProjects.map((project) => (
          <a
            key={project.name}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 rounded-[1.4rem] border border-transparent bg-black/1.5 px-3 py-3.5 transition-all hover:border-black/5 hover:bg-white/75 hover:shadow-[0_18px_36px_rgba(15,23,42,0.06)] dark:bg-white/4 dark:hover:border-white/10 dark:hover:bg-white/8 dark:hover:shadow-[0_18px_36px_rgba(2,6,23,0.35)] sm:items-center"
          >
            <div className="mt-0.5 sm:mt-0">{renderProjectMark(project, true)}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <span className="truncate text-sm font-semibold transition-colors group-hover:text-primary">{project.name}</span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {project.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="h-3 w-3" />
                    {project.forks}
                  </span>
                </div>
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{project.desc}</p>
            </div>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {visibleProjects.map((project) => (
        <a
          key={project.name}
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col rounded-[1.6rem] border border-black/5 bg-white/78 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-950/62 dark:shadow-[0_24px_56px_rgba(2,6,23,0.4)] dark:hover:shadow-[0_28px_64px_rgba(2,6,23,0.5)] sm:p-5"
        >
          <div className="mb-3 flex items-start gap-3">
            {renderProjectMark(project)}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium transition-colors group-hover:text-primary">{project.name}</div>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{project.desc}</p>
            </div>
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="h-4 px-1.5 py-0 text-[10px]">{tag}</Badge>
            ))}
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {project.stars}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-3 w-3" />
              {project.forks}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}