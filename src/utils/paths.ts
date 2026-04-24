const base = import.meta.env.BASE_URL;

export function withBase(path: string): string {
  const clean = path.replace(/^\/+/, "");
  if (base === "/") return `/${clean}`;
  return `${base.replace(/\/+$/, "")}/${clean}`;
}
