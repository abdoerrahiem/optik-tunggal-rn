export type ValueOf<T> = T[keyof T];

export type ErrorState<F> = {
  fields?: Array<keyof F>;
  message?: string;
};
