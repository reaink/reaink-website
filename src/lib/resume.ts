import rawResumeData from '@/data/resume.json';
import type { IconName } from '@/lib/icons';

export interface ResumeSeo {
  title: string;
  description: string;
  pdfFileName: string;
  updatedAt: string;
}

export interface ResumeBasics {
  name: string;
  title: string;
  summary: string;
  location: string;
  experience: string;
  focus: string[];
}

export interface ResumeStat {
  label: string;
  value: string;
  hint: string;
}

export interface ResumeContact {
  label: string;
  value: string;
  href?: string;
  icon: IconName;
}

export interface ResumeSkillGroup {
  title: string;
  icon: IconName;
  items: string[];
}

export interface ResumeExperienceItem {
  company: string;
  team: string;
  period: string;
  summary: string;
  highlights: string[];
  stack: string[];
}

export interface ResumeProjectLink {
  label: string;
  href: string;
}

export interface ResumeProject {
  name: string;
  period: string;
  summary: string;
  bullets: string[];
  tags: string[];
  links: ResumeProjectLink[];
}

export interface ResumeEducationItem {
  school: string;
  period: string;
}

export interface ResumeData {
  seo: ResumeSeo;
  basics: ResumeBasics;
  stats: ResumeStat[];
  contacts: ResumeContact[];
  skillGroups: ResumeSkillGroup[];
  experienceItems: ResumeExperienceItem[];
  projects: ResumeProject[];
  education: ResumeEducationItem[];
  extras: string[];
}

export const resumeData = rawResumeData as ResumeData;