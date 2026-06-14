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
