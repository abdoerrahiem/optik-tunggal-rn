export type PromotionModel = {
  // id?: number;
  title?: string;
  image?: string;
  content?: string;

  // API
  PromotionID?: string;
  PromotionImage?: string;
  PromotionName?: string;
  PromotionDescription?: string;
  description?: string;
  remark?: string;
};

export type BenefitsModel = {
  image?: string;
  html?: string;
};

export type PopupModel = {
  image?: string;
  bg?: string;
  title?: string;
  subtitle?: string;
  caption?: string;
  html?: string;
  disclaimer?: string;
  actions?: PopupActionType[];
};

export type PopupActionType = {
  image?: string;
  url?: string;
};
