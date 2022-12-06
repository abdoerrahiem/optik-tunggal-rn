export type FAQModel = {
  id?: number;

  name?: string;
  description?: string;
  descriptions?: string[];

  remark?: string;
  nama?: string;
};

export type ContactUsModel = {
  StoreID?: string;
  StoreName?: string;
  StoreLocationUnit?: string;
  StoreAddress?: string[];
  StoreImage?: string,
  StorePhone?: string;
  StoreNotes?: string;
  StoreLongitude?: string;
  StoreLatitude?: string;
  koordinat?: string;
  waphone?: string;
};

export type CityStoreModel = {
  CityID?: string;
  CityName?: string;

};

export type ArticleModel = {
  ArticleID?: string;
  ArticleName?: string[];
  html?: string;
  ArticleImage?: string;
  ArticleImageThumb?: string,
  ArticlePublishDate?: string;
  ArticleView?: string;
};

export type BannerModel = {
  banner_artID?: string;
  banner_tipe?: string;
  banner_id?: string;
  banner_ds?: string[];
  banner_foto?: string;
  banner_ul?: string;
  banner_title?: string;
  banner_subtitle?: string;
  banner_desc?: string;
  banner_remark?: string;
};

export type ContactLensModel = {
  ContactLensID?: string;
  ContactLensName?: string[];
  html?: string;
  ContactLensImage?: string;
  ContactLensImageThumb?: string,
  ContactLensPublishDate?: string;
  ContactLensView?: string;
};

