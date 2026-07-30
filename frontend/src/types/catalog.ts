export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  parentId: string | null;
  imageUrl?: string | null;
}

export interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  depth: number;
  imageUrl?: string | null;
  children: CategoryTreeNode[];
}

export interface CollectionDto {
  id: string;
  name: string;
  slug: string;
  collectionType: "EVENT" | "TREND" | "SEASON" | "FEATURED";
  description: string | null;
  startsAt: string | null;
  endsAt: string | null;
  imageUrl: string | null;
  displayOrder: number;
}
