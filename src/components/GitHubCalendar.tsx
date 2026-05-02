import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { GitHubCalendar as ReactGitHubCalendar } from 'react-github-calendar';

interface GitHubCalendarProps {
  username: string;
  year?: number;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, index) => currentYear - index);

const calendarTheme = {
  light: ['#eef2f7', '#d8fdd1', '#adf5a8', '#63e26d', '#2ecb4c'],
  dark: ['#1f2937', '#194f2a', '#1d7935', '#26a641', '#7cff90'],
};

export default function GitHubCalendar({ username, year = currentYear }: GitHubCalendarProps) {
  const [selectedYear, setSelectedYear] = useState(year);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [calendarScale, setCalendarScale] = useState(1);
  const [calendarHeight, setCalendarHeight] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== 'undefined' ? window.matchMedia('(max-width: 640px)').matches : false;
  const safePadding = isMobile ? 12 : 8;

  useEffect(() => {
    const root = document.documentElement;

    const updateColorScheme = () => {
      setColorScheme(root.classList.contains('dark') ? 'dark' : 'light');
    };

    updateColorScheme();

    const observer = new MutationObserver(updateColorScheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content || typeof ResizeObserver === 'undefined') {
      return;
    }

    const updateScale = () => {
      const scrollContainer = content.querySelector<HTMLElement>('.react-activity-calendar__scroll-container');
      const nextWidth = Math.max(content.scrollWidth, scrollContainer?.scrollWidth ?? 0);
      const nextHeight = content.scrollHeight;
      const containerWidth = container.clientWidth;
      const availableWidth = Math.max(containerWidth - safePadding, 0);

      if (!nextWidth || !availableWidth) {
        return;
      }

      const nextScale = Math.min(1, availableWidth / nextWidth);
      setCalendarScale((prev) => (Math.abs(prev - nextScale) < 0.01 ? prev : nextScale));
      setCalendarHeight((prev) => {
        const scaledHeight = Math.ceil(nextHeight * nextScale);
        return prev === scaledHeight ? prev : scaledHeight;
      });
    };

    const rafId = window.requestAnimationFrame(updateScale);
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    observer.observe(content);

    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [selectedYear, username, isMobile]);

  return (
    <div className="w-full min-w-0">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[15px] font-semibold text-foreground">GitHub 活跃度</div>
        </div>
        <label className="relative shrink-0">
          <span className="sr-only">选择年份</span>
          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            className="h-10 appearance-none rounded-full border border-black/6 bg-white/80 pl-4 pr-9 text-sm font-medium text-muted-foreground shadow-sm outline-none transition focus:border-primary/40 dark:border-white/10 dark:bg-white/8 dark:text-slate-200"
          >
            {years.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </label>
      </div>

      <div
        ref={containerRef}
        className="github-heatmap w-full overflow-hidden pb-1"
        style={calendarHeight ? { height: `${calendarHeight}px` } : undefined}
      >
        <div
          ref={contentRef}
          className="origin-top-left"
          style={{ transform: `scale(${calendarScale})` }}
        >
          <ReactGitHubCalendar
            username={username}
            year={selectedYear}
            blockSize={isMobile ? 9 : 12}
            blockMargin={isMobile ? 3 : 3}
            blockRadius={4}
            fontSize={isMobile ? 10 : 12}
            showWeekdayLabels={!isMobile}
            colorScheme={colorScheme}
            theme={calendarTheme}
            labels={{
              totalCount: '{{count}} contributions in {{year}}',
            }}
            errorMessage="GitHub contribution data is temporarily unavailable."
          />
        </div>
      </div>
    </div>
  );
}