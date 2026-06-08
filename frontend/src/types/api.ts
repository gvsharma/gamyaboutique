export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  timestamp?: string;
  path?: string;
  errors?: ApiFieldError[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
