export interface PromoVideo {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  posterUrl: string | null;
  displayOrder: number;
  active: boolean;
  updatedAt: string;
}

export interface UpsertPromoVideoPayload {
  title: string;
  description?: string;
  videoUrl: string;
  posterUrl?: string | null;
  displayOrder?: number;
  active?: boolean;
}
