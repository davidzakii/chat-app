export interface ApiSuccessResponse<T> {
  isPass: boolean;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  isPass: false;
  message: string;
  status: number;
  errDetails?: string;
}
