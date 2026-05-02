import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Workflow } from 'lucide-react';
import { SiGithub, SiX } from '@icons-pack/react-simple-icons';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import GitHubCalendar from './GitHubCalendar';
import ProjectList from '@/components/home/ProjectList';
import { iconMap } from '@/lib/icons';
import { homeData, resolveHeroStatValue, type HomeHero, type HomeProject, type SerializedPost } from '@/lib/home';

function TwitterTimeline({ username }: { username: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () => {
      if ((window as any).twttr?.widgets && containerRef.current) {
        containerRef.current.innerHTML = `<a class="twitter-timeline" data-height="260" data-chrome="noheader nofooter noborders transparent" data-tweet-limit="3" href="https://twitter.com/${username}">Loading tweets...</a>`;
        (window as any).twttr.widgets.load(containerRef.current);
      }
    };

    if ((window as any).twttr?.widgets) {
      load();
    } else {
      const existing = document.querySelector('script[src*="platform.twitter.com"]');
      if (existing) {
        const timer = setInterval(() => {
          if ((window as any).twttr?.widgets) {
            clearInterval(timer);
            load();
          }
        }, 200);
        return () => clearInterval(timer);
      } else {
        const s = document.createElement('script');
        s.src = 'https://platform.twitter.com/widgets.js';
        s.async = true;
        s.onload = load;
        document.head.appendChild(s);
      }
    }
  }, [username]);

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[15px] font-semibold text-foreground">X / Twitter</div>
          <p className="mt-1 text-xs text-muted-foreground">引用账号最近动态，保留和主视觉一致的留白与圆角。</p>
        </div>
        <a
          href={`https://twitter.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          @{username} <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
      <div ref={containerRef} className="flex min-h-65 items-center justify-center overflow-hidden rounded-[1.5rem] border border-black/5 bg-white/60 dark:border-white/10 dark:bg-white/6">
        <span className="text-sm text-muted-foreground">Loading tweets...</span>
      </div>
    </div>
  );
}

const cardCls = 'gap-0 py-6 sm:py-4 rounded-[2rem] border border-white/70 bg-white/78 shadow-xl ring-1 ring-black/4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/58 dark:ring-white/10 dark:shadow-[0_24px_60px_rgba(2,6,23,0.45)]';
const toggleButtonCls = 'h-12 w-12 rounded-full border border-white/70 bg-white/84 text-muted-foreground transition-all cursor-pointer hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/8 dark:text-slate-300';

export default function HeroGrid({
  posts: _posts,
  featuredProjects,
  projects,
  totalProjectCount,
  username,
  postCount,
  hero,
}: {
  posts: SerializedPost[];
  featuredProjects: HomeProject[];
  projects: HomeProject[];
  totalProjectCount: number;
  username: string;
  postCount: number;
  hero: HomeHero;
}) {
  const [tab, setTab] = useState<'github' | 'twitter'>('github');
  const [visibleTab, setVisibleTab] = useState<'github' | 'twitter'>('github');
  const [transitionStage, setTransitionStage] = useState<'idle' | 'out' | 'in'>('idle');
  const [direction, setDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    if (tab === visibleTab) {
      return;
    }

    setTransitionStage('out');

    const exitTimer = window.setTimeout(() => {
      setVisibleTab(tab);
      setTransitionStage('in');
    }, 220);

    const enterTimer = window.setTimeout(() => {
      setTransitionStage('idle');
    }, 460);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(enterTimer);
    };
  }, [tab, visibleTab]);

  const handleTabChange = (nextTab: 'github' | 'twitter') => {
    if (nextTab === tab) {
      return;
    }

    setDirection(nextTab === 'twitter' ? 'up' : 'down');
    setTab(nextTab);
  };

  const transitionClass = transitionStage === 'out'
    ? direction === 'up'
      ? 'animate-[hero-slide-out-up_220ms_cubic-bezier(0.22,1,0.36,1)_forwards]'
      : 'animate-[hero-slide-out-down_220ms_cubic-bezier(0.22,1,0.36,1)_forwards]'
    : transitionStage === 'in'
      ? direction === 'up'
        ? 'animate-[hero-slide-in-up_240ms_cubic-bezier(0.22,1,0.36,1)_forwards]'
        : 'animate-[hero-slide-in-down_240ms_cubic-bezier(0.22,1,0.36,1)_forwards]'
      : '';

  const AvailabilityIcon = iconMap[hero.availability.icon];

  return (
    <div className="relative z-10 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.85fr)_minmax(22rem,1fr)] xl:items-start xl:gap-8">
      <div className="order-2 grid min-w-0 w-full h-full gap-4 xl:order-1 xl:grid-cols-[minmax(0,1fr)_92px] xl:items-center">
        <div className="flex min-w-0 max-w-full flex-col gap-4 xl:pr-1">
          <div className="flex items-center justify-center xl:hidden">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/84 p-2 shadow-[0_14px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/54 dark:shadow-[0_18px_36px_rgba(2,6,23,0.4)]">
              <button
                onClick={() => handleTabChange('github')}
                className={cn(toggleButtonCls, tab === 'github' ? 'bg-foreground text-background shadow-[0_18px_40px_rgba(15,23,42,0.18)]' : 'hover:text-foreground')}
                title="GitHub 活跃度"
              >
                <SiGithub className="mx-auto h-5 w-5" />
              </button>
              <button
                onClick={() => handleTabChange('twitter')}
                className={cn(toggleButtonCls, tab === 'twitter' ? 'bg-foreground text-background shadow-[0_18px_40px_rgba(15,23,42,0.18)]' : 'hover:text-foreground')}
                title="X / Twitter"
              >
                <SiX className="mx-auto h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="h-full min-w-0 max-w-full">
            <div className={cn('min-w-0 max-w-full will-change-transform', transitionClass)}>
              {visibleTab === 'github' ? (
                <div className="min-w-0 max-w-full space-y-4">
                  <Card className={cardCls}>
                    <CardContent>
                      <GitHubCalendar username={username} year={new Date().getFullYear()} />
                    </CardContent>
                  </Card>

                  <Card className={cardCls}>
                    <CardHeader className="pb-0">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground/85">
                        <Workflow className="h-4 w-4" />
                        {homeData.sections.featuredProjects.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-4">
                      <ProjectList projects={featuredProjects} compact />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className={cardCls}>
                  <CardContent>
                    <TwitterTimeline username={username} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        <div className="hidden xl:flex self-center items-center justify-center">
          <div className="relative flex flex-col items-center gap-3 rounded-full border border-white/70 bg-white/82 p-2 shadow-[0_20px_50px_rgba(15,23,42,0.08)] ring-1 ring-black/4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/54 dark:ring-white/10 dark:shadow-[0_24px_60px_rgba(2,6,23,0.45)]">
            <span
              className={cn(
                'absolute -left-1.5 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#6b6cff] shadow-[0_0_0_8px_rgba(107,108,255,0.12)] transition-all duration-300',
                tab === 'github' ? 'top-8' : 'top-23'
              )}
            />
            <button
              onClick={() => handleTabChange('github')}
              title="GitHub 活跃度"
              className={cn(toggleButtonCls, tab === 'github' ? 'bg-foreground text-background shadow-[0_18px_40px_rgba(15,23,42,0.18)]' : 'hover:text-foreground')}
            >
              <SiGithub className="mx-auto h-5 w-5" />
            </button>
            <button
              onClick={() => handleTabChange('twitter')}
              title="X / Twitter"
              className={cn(toggleButtonCls, tab === 'twitter' ? 'bg-foreground text-background shadow-[0_18px_40px_rgba(15,23,42,0.18)]' : 'hover:text-foreground')}
            >
              <SiX className="mx-auto h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="order-1 flex min-h-136 min-w-0 w-full flex-col px-1 py-2 sm:px-2 xl:order-2 xl:px-4 xl:py-6">
        <div className="mb-8 flex justify-start xl:justify-end">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/84 px-4 py-2 text-xs font-medium text-muted-foreground shadow-[0_10px_28px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/8 dark:shadow-[0_14px_30px_rgba(2,6,23,0.35)]">
            <AvailabilityIcon className="h-3.5 w-3.5 text-amber-400" />
            {hero.availability.label}
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </span>
        </div>

        <div className="mb-7 w-full xl:max-w-136">
          <h1 className="mb-4 text-[2.55rem] font-bold leading-[0.95] tracking-[-0.045em] text-foreground sm:text-[3rem] xl:text-[3.25rem]">
            {hero.titlePrefix} <span className="text-[#6b6cff]">{hero.titleHighlight}</span>.
          </h1>
          {hero.description.map((paragraph, index) => (
            <p key={paragraph} className={cn('text-[1.02rem] leading-8 text-slate-500 dark:text-slate-300', index > 0 && 'mt-2')}>
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mb-7 flex flex-wrap items-center gap-5 text-sm text-slate-500 dark:text-slate-300">
          {hero.facts.map((fact) => {
            const FactIcon = iconMap[fact.icon];

            return (
              <span key={fact.label} className="flex items-center gap-1">
                <FactIcon className="h-3.5 w-3.5" />
                {fact.label}
              </span>
            );
          })}
        </div>

        <Separator className="mb-7 bg-black/6 dark:bg-white/10" />

        <div className="mb-8 grid grid-cols-3 overflow-hidden rounded-[1.5rem] border border-black/5 bg-black/2 text-center dark:border-white/10 dark:bg-white/6">
          {hero.stats.map((stat, index) => (
            <div key={stat.label} className={cn('px-4 py-5', index === 1 && 'border-x border-black/6')}>
              <div className="text-3xl font-bold tracking-[-0.04em]">{resolveHeroStatValue(stat, { postCount, projectCount: totalProjectCount })}</div>
              <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-auto grid w-full grid-cols-1 gap-3 sm:grid-cols-3 xl:max-w-136">
          {hero.actions.map((action) => {
            const ActionIcon = action.icon ? iconMap[action.icon] : null;

            return (
              <a
                key={action.label}
                href={action.href}
                target={action.external ? '_blank' : undefined}
                rel={action.external ? 'noopener noreferrer' : undefined}
                className={cn(
                  'inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition-all hover:-translate-y-0.5',
                  action.variant === 'primary'
                    ? 'bg-foreground text-background shadow-[0_20px_40px_rgba(15,23,42,0.18)] hover:bg-foreground/92'
                    : 'border border-black/8 bg-white/72 hover:bg-white dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/12'
                )}
              >
                {ActionIcon && <ActionIcon className="h-3.5 w-3.5" />}
                {action.label}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
