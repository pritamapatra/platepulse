export type MenuRow = {
  id: string;
  name: string;
  pricePaise: number;
  active: boolean;
  createdAt: Date;
};

export function sellableItems<T extends MenuRow>(items: readonly T[]): T[] {
  return items
    .filter((item) => item.active)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}
