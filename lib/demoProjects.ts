export type DemoProject = {
  id: number;
  name: string;
  updatedAt: string;
  cover: string;
  statusText?: string;
};

export const formatProjectTime = (iso: string) => {
  const d = new Date(iso);
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  return `${mm}/${dd} ${hh}:${mi}`;
};

type ProjectCategory = "房产" | "教育" | "餐饮";

const AD_IMAGE_POOL: Record<ProjectCategory, string[]> = {
  房产: [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80",
  ],
  教育: [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80",
  ],
  餐饮: [
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80",
  ],
};

const CATEGORY_THEMES: Array<{ category: ProjectCategory; title: string; subtitle: string }> = [
  { category: "房产", title: "房产 Agent 获客", subtitle: "带看脚本 · 预约留资" },
  { category: "教育", title: "教育课程招生", subtitle: "卖点拆解 · 强 CTA" },
  { category: "餐饮", title: "餐饮门店促销", subtitle: "同城引流 · 到店优惠" },
];

const toIsoAt = (baseIso: string, minutesDelta: number) => {
  const base = new Date(baseIso).getTime();
  return new Date(base - minutesDelta * 60_000).toISOString();
};

export const demoProjects: DemoProject[] = Array.from({ length: 39 }, (_, idx) => {
  const id = idx + 1;
  const theme = CATEGORY_THEMES[idx % CATEGORY_THEMES.length];
  const coverPool = AD_IMAGE_POOL[theme.category];
  const cover = coverPool[idx % coverPool.length];
  const name = `${theme.title} · 方案${String(id).padStart(2, "0")}`;
  const updatedAt = toIsoAt("2025-12-18T09:12:00.000Z", idx * 27);

  if (id === 1) {
    return {
      id,
      name,
      statusText: "产品生成中（33%，预计50分钟）",
      updatedAt,
      cover,
    };
  }

  if (id % 11 === 0) {
    const pct = 12 + (id % 5) * 16;
    return {
      id,
      name,
      statusText: `图像生成中（${pct}%，预计${35 + (id % 4) * 10}分钟）`,
      updatedAt,
      cover,
    };
  }

  return {
    id,
    name,
    updatedAt,
    cover,
  };
});
