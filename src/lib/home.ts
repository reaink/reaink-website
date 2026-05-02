import rawHomeData from '@/data/home.json';
import type { IconName } from '@/lib/icons';

export interface HomeSection {
  title: string;
  icon: IconName;
  href?: string;
  linkLabel?: string;
  external?: boolean;
}

export interface HomeProject {
  name: string;
  desc: string;
  tags: string[];
  stars: string;
  forks: string;
  color: string;
  initial: string;
  url: string;
  logo?: string;
  repository: string;
}

export interface HomeGitHubOwner {
  login: string;
  type: 'user' | 'org';
}

export interface HomeGitHubConfig {
  username: string;
  projectCountFallback: number;
  owners: HomeGitHubOwner[];
  featuredRepositories: string[];
  projectRepositories: string[];
}

export interface HomeSocialConfig {
  twitterUsername: string;
}

export interface HomeCategoryRule {
  match: string;
  icon: IconName;
  iconClass: string;
}

export interface HomeHeroFact {
  icon: IconName;
  label: string;
}

export interface HomeHeroStat {
  source: 'postCount' | 'projectCount' | 'custom';
  label: string;
  value?: string;
}

export interface HomeHeroAction {
  label: string;
  href: string;
  variant: 'primary' | 'secondary';
  external?: boolean;
  icon?: IconName;
}

export interface HomeHero {
  availability: {
    label: string;
    icon: IconName;
  };
  titlePrefix: string;
  titleHighlight: string;
  description: string[];
  facts: HomeHeroFact[];
  stats: HomeHeroStat[];
  actions: HomeHeroAction[];
}

export interface HomeBrand {
  name: string;
  logo: {
    icon: IconName;
    imageSrc?: string;
    alt?: string;
  };
}

export interface HomeData {
  brand: HomeBrand;
  hero: HomeHero;
  sections: {
    featuredProjects: HomeSection;
    projects: HomeSection;
    posts: HomeSection;
  };
  github: HomeGitHubConfig;
  social: HomeSocialConfig;
  projects: HomeProject[];
  postCategoryIcons: HomeCategoryRule[];
}

export interface SerializedPost {
  id: string;
  title: string;
  date?: string;
  categories: string[];
  tags: string[];
  readingMinutes: number;
}

export const homeData = rawHomeData as HomeData;

export function readingTime(body: string) {
  return Math.max(1, Math.round(body.replace(/\s/g, '').length / 400));
}

export function serializePosts<T extends { id: string; data: { title: string; date?: Date; categories: string[]; tags: string[] }; body?: string }>(posts: T[]): SerializedPost[] {
  return posts.map((post) => ({
    id: post.id,
    title: post.data.title,
    date: post.data.date?.toISOString(),
    categories: post.data.categories,
    tags: post.data.tags,
    readingMinutes: readingTime(post.body ?? ''),
  }));
}

export function resolveHeroStatValue(stat: HomeHeroStat, counts: { postCount: number; projectCount: number }) {
  if (stat.source === 'postCount') {
    return String(counts.postCount);
  }

  if (stat.source === 'projectCount') {
    return String(counts.projectCount);
  }

  return stat.value ?? '';
}

export function getPostCategoryVisual(categories: string[]) {
  const matchedRule = homeData.postCategoryIcons.find((rule) => categories.some((category) => category.includes(rule.match)));

  return matchedRule ?? {
    match: 'default',
    icon: 'fileText' as const,
    iconClass: 'bg-slate-100 text-slate-600',
  };
}

export function selectProjectsByRepositories(projects: HomeProject[], repositories: string[]) {
  const repositorySet = new Set(repositories.map((repository) => repository.toLowerCase()));

  return projects.filter((project) => repositorySet.has(project.repository.toLowerCase()));
}