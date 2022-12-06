export * from './User';
export * from './Product';
export * from './Transaction';
export * from './Promotion';
export * from './Region';
export * from './About';
export * from './Others';
// export * from './TypesShare';

export type Modelable<T> = {
  models?: T[];
  modelsLoaded?: boolean;
  model?: null | T;
  modelLoaded?: boolean;
};

export type ModelablePaginate<T> = {
  models?: T[];
  modelsLoaded?: boolean;
  page: number;
  perPage: number;
  isPageEnd?: boolean;
};
