#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOME_JSON="${1:-$ROOT_DIR/src/data/home.json}"

if [[ ! -f "$HOME_JSON" ]]; then
  echo "home.json not found: $HOME_JSON" >&2
  exit 1
fi

HOME_JSON="$HOME_JSON" node --input-type=module <<'NODE'
import { readFile, writeFile } from 'node:fs/promises';

const homeJsonPath = process.env.HOME_JSON;

if (!homeJsonPath) {
  throw new Error('HOME_JSON is required');
}

const raw = await readFile(homeJsonPath, 'utf8');
const homeData = JSON.parse(raw);
const token = process.env.GITHUB_TOKEN;

const apiHeaders = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'reaink-website-home-updater',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function fetchJson(url) {
  const response = await fetch(url, { headers: apiHeaders });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText} for ${url}`);
  }

  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'reaink-website-home-updater',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText} for ${url}`);
  }

  return response.text();
}

function extractIconHref(html) {
  const patterns = [
    /<link[^>]+rel="[^"]*icon[^"]*"[^>]+href="([^"]+)"/i,
    /<link[^>]+href="([^"]+)"[^>]+rel="[^"]*icon[^"]*"/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      return match[1];
    }
  }

  return '';
}

async function fetchProjectLogo(homepage) {
  if (!homepage || !String(homepage).trim()) {
    return '';
  }

  const normalizedHomepage = String(homepage).trim();
  const html = await fetchText(normalizedHomepage);
  const iconHref = extractIconHref(html);

  if (iconHref) {
    return new URL(iconHref, normalizedHomepage).toString();
  }

  return new URL('/favicon.ico', normalizedHomepage).toString();
}

function formatCount(count) {
  return Number(count || 0).toLocaleString('en-US');
}

function getProjectColor(language) {
  switch (language) {
    case 'TypeScript':
      return 'bg-sky-500';
    case 'Lua':
      return 'bg-indigo-500';
    case 'Python':
      return 'bg-emerald-500';
    case 'Rust':
      return 'bg-orange-500';
    default:
      return 'bg-slate-700';
  }
}

function getProjectInitial(name) {
  const normalizedName = String(name)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-zA-Z])/g, '$1 $2');
  const parts = normalizedName.split(/[^a-zA-Z0-9]+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  const compact = String(name).replace(/[^a-zA-Z0-9]/g, '');

  if (!compact) {
    return 'GH';
  }

  return compact.slice(0, 2).toUpperCase();
}

async function fetchOwnerRepositories(owner) {
  const repositories = [];

  for (let page = 1; page <= 10; page += 1) {
    const url = owner.type === 'org'
      ? `https://api.github.com/orgs/${owner.login}/repos?per_page=100&page=${page}&sort=created&direction=desc`
      : `https://api.github.com/users/${owner.login}/repos?per_page=100&page=${page}&sort=created&direction=desc`;
    const batch = await fetchJson(url);

    repositories.push(...batch);

    if (batch.length < 100) {
      break;
    }
  }

  return repositories.filter((repository) => !repository.fork);
}

const selectedRepositories = Array.from(new Set([
  ...(homeData.github?.featuredRepositories ?? []),
  ...(homeData.github?.projectRepositories ?? []),
].map((repository) => String(repository).trim()).filter(Boolean)));

const repositories = await Promise.all(
  selectedRepositories.map((repository) => fetchJson(`https://api.github.com/repos/${repository}`))
);

const logos = await Promise.all(
  repositories.map((repository) => fetchProjectLogo(repository.homepage).catch(() => ''))
);

homeData.projects = repositories.map((repository, index) => ({
  repository: repository.full_name,
  name: repository.name,
  desc: repository.description ?? 'No description provided.',
  tags: Array.from(new Set([repository.language, ...(repository.topics ?? [])].filter(Boolean))).slice(0, 3),
  stars: formatCount(repository.stargazers_count),
  forks: formatCount(repository.forks_count),
  color: getProjectColor(repository.language),
  initial: getProjectInitial(repository.name),
  url: repository.html_url,
  ...(logos[index] ? { logo: logos[index] } : {}),
}));

const ownerRepositories = await Promise.all((homeData.github?.owners ?? []).map((owner) => fetchOwnerRepositories(owner)));
homeData.github.projectCountFallback = new Set(
  ownerRepositories.flat().map((repository) => String(repository.full_name).toLowerCase())
).size;

await writeFile(homeJsonPath, `${JSON.stringify(homeData, null, 2)}\n`, 'utf8');

console.log(`Updated ${homeJsonPath}`);
console.log(`Projects: ${homeData.projects.length}`);
console.log(`Project count fallback: ${homeData.github.projectCountFallback}`);
NODE