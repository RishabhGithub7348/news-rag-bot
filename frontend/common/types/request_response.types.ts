export type T_MSResponse<T> = {
  success: boolean;
  data?: T;
  errors: string[];
};
