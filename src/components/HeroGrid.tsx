import { useState, useEffect } from 'react';
import { ArrowRight, Workflow } from 'lucide-react';
import { SiGithub, SiX } from '@icons-pack/react-simple-icons';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import GitHubCalendar from './GitHubCalendar';
import ProjectList from '@/components/home/ProjectList';
import { iconMap } from '@/lib/icons';
import { homeData, resolveHeroStatValue, type HomeHero, type HomeProject, type SerializedPost } from '@/lib/home';

interface FxTwitterAuthor {
  name: string;
  screen_name: string;
  url: string;
  avatar_url?: string | null;
}

interface FxTwitterStatus {
  type: 'status';
  id: string;
  url: string;
  text: string;
  created_timestamp: number;
  likes: number;
  reposts: number;
  replies: number;
  views?: number | null;
  author: FxTwitterAuthor;
  replying_to?: {
    screen_name: string;
    status: string;
  } | null;
  reposted_by?: {
    screen_name: string;
  } | null;
  media?: {
    photos?: Array<unknown>;
    videos?: Array<unknown>;
  };
}

interface FxTwitterTimelineResponse {
  code: number;
  results?: FxTwitterStatus[];
  cursor?: {
    bottom?: string | null;
  };
}

function formatRelativeTime(timestamp: number) {
  const diffInSeconds = Math.max(0, Math.floor(Date.now() / 1000) - timestamp);

  if (diffInSeconds < 60) {
    return '刚刚';
  }

  if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)} 分钟前`;
  }

  if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)} 小时前`;
  }

  if (diffInSeconds < 86400 * 7) {
    return `${Math.floor(diffInSeconds / 86400)} 天前`;
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(timestamp * 1000));
}

function compactCount(value?: number | null) {
  if (!value) {
    return '0';
  }

  if (value >= 10000) {
    return `${(value / 10000).toFixed(value >= 100000 ? 0 : 1)}w`;
  }

  return String(value);
}

function TwitterTimeline({ username }: { username: string }) {
  const normalizedUsername = username.replace(/^@+/, '').trim();
  const [timelineState, setTimelineState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [items, setItems] = useState<FxTwitterStatus[]>([]);

  useEffect(() => {
    if (!normalizedUsername) {
      setTimelineState('error');
      setItems([]);
      return;
    }

    const controller = new AbortController();

    setTimelineState('loading');
    setItems([]);

    const loadTimeline = async () => {
      try {
        const nextItems: FxTwitterStatus[] = [];
        let cursor: string | null | undefined;
        let pageCount = 0;

        while (nextItems.length < 3 && pageCount < 5) {
          const query = new URLSearchParams({ count: '20' });

          if (cursor) {
            query.set('cursor', cursor);
          }

          const response = await fetch(`https://api.fxtwitter.com/2/profile/${encodeURIComponent(normalizedUsername)}/statuses?${query.toString()}`, {
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`FxTwitter request failed with ${response.status}`);
          }

          const payload = await response.json() as FxTwitterTimelineResponse;
          const pageItems = (payload.results ?? [])
            .filter((item) => item.type === 'status')
            .filter((item) => item.author.screen_name.toLowerCase() === normalizedUsername.toLowerCase())
            .filter((item) => !item.reposted_by)
            .filter((item) => !item.replying_to)
            .sort((left, right) => right.created_timestamp - left.created_timestamp);

          for (const item of pageItems) {
            if (!nextItems.some((existingItem) => existingItem.id === item.id)) {
              nextItems.push(item);
            }
            if (nextItems.length === 3) {
              break;
            }
          }

          cursor = payload.cursor?.bottom;
          pageCount += 1;

          if (!cursor || (payload.results?.length ?? 0) === 0) {
            break;
          }
        }

        nextItems.sort((left, right) => right.created_timestamp - left.created_timestamp);

        if (controller.signal.aborted) {
          return;
        }

        setItems(nextItems.slice(0, 3));
        setTimelineState(nextItems.length > 0 ? 'ready' : 'error');
      } catch {
        if (!controller.signal.aborted) {
          setTimelineState('error');
          setItems([]);
        }
      }
    };

    void loadTimeline();

    return () => {
      controller.abort();
    };
  }, [normalizedUsername]);

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[15px] font-semibold text-foreground">X / Twitter</div>
        </div>
        <a
          href={`https://x.com/${normalizedUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex mt-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          @{normalizedUsername} <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
      <div className="relative min-h-65 overflow-hidden rounded-[1.5rem] border border-black/5 bg-white/60 dark:border-white/10 dark:bg-white/6">
        <div className="flex min-h-65 flex-col gap-4 p-5 sm:p-6">
          {timelineState === 'loading' && (
            <div className="flex min-h-53 flex-col justify-center gap-3 rounded-[1.35rem] border border-dashed border-black/8 bg-white/70 px-5 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/8">
              <div className="h-2.5 w-24 animate-pulse rounded-full bg-black/8 dark:bg-white/12" />
              <div className="h-2.5 w-full animate-pulse rounded-full bg-black/6 dark:bg-white/10" />
              <div className="h-2.5 w-[82%] animate-pulse rounded-full bg-black/6 dark:bg-white/10" />
              <span>正在从 FxTwitter 拉取最新动态...</span>
            </div>
          )}

          {timelineState === 'ready' && items.length > 0 && (
            <div className="space-y-3">
              {items.map((item, index) => {
                const hasMedia = (item.media?.photos?.length ?? 0) > 0 || (item.media?.videos?.length ?? 0) > 0;

                return (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-[1.35rem] border border-black/6 bg-white/78 p-4 transition-all hover:-translate-y-0.5 hover:border-black/10 hover:bg-white dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/10"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {index === 0 && item.author.avatar_url && (
                          <img
                            src={item.author.avatar_url}
                            alt={item.author.name}
                            className="h-6 w-6 rounded-full border border-black/6 dark:border-white/10"
                          />
                        )}
                        <span className="font-medium text-foreground/85">{item.author.name}</span>
                        <span>@{item.author.screen_name}</span>
                      </div>
                      <span>{formatRelativeTime(item.created_timestamp)}</span>
                    </div>

                    <p className="line-clamp-4 whitespace-pre-line text-sm leading-7 text-foreground/88 dark:text-slate-100/88">
                      {item.text}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{compactCount(item.likes)} 赞</span>
                      <span>{compactCount(item.reposts)} 转发</span>
                      <span>{compactCount(item.replies)} 回复</span>
                      {item.views ? <span>{compactCount(item.views)} 浏览</span> : null}
                      {hasMedia ? <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/8">含媒体</span> : null}
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {timelineState === 'error' && (
            <div className="flex min-h-53 flex-col justify-between gap-6 rounded-[1.35rem] border border-black/6 bg-white/70 p-5 dark:border-white/10 dark:bg-white/8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-black/6 bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground dark:border-white/10 dark:bg-white/8">
                  FxTwitter Unavailable
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">实时动态暂时不可用。</h3>
                  <p className="text-sm leading-7 text-muted-foreground">
                    第三方 API 没返回可用结果，或者当前网络链路把请求掐掉了。面板保留账号入口，避免首页直接空掉。
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-muted-foreground">如果你后面嫌这个方案不稳，下一步就该改成服务端缓存，不要继续硬顶前端直连。</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href={`https://x.com/${normalizedUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/80 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/12"
            >
              打开 @{normalizedUsername}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const cardCls = 'gap-0 py-6 sm:py-4 rounded-[2rem] border border-white/70 bg-white/78 shadow-xl ring-1 ring-black/4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/58 dark:ring-white/10 dark:shadow-[0_24px_60px_rgba(2,6,23,0.45)]';
const toggleButtonCls = 'h-12 w-12 rounded-full border border-white/70 bg-white/84 text-muted-foreground transition-all cursor-pointer hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/8 dark:text-slate-300';

export default function HeroGrid({
  posts: _posts,
  featuredProjects,
  totalProjectCount,
  githubUsername,
  twitterUsername,
  postCount,
  hero,
}: {
  posts: SerializedPost[];
  featuredProjects: HomeProject[];
  totalProjectCount: number;
  githubUsername: string;
  twitterUsername: string;
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
                      <GitHubCalendar username={githubUsername} year={new Date().getFullYear()} />
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
                    <TwitterTimeline username={twitterUsername} />
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
