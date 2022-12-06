export type LangType = 'en' | 'id';

export type UiRootState = {
  lang: LangType;
  theme: UiTheme;
};

export type UiLanguage = {
  lang: LangType;
  name: string;
};

export type UiTheme = 'light' | 'dark';
