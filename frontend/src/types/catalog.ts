export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  parentId: string | null;
}

export interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  depth: number;
  children: CategoryTreeNode[];
}
