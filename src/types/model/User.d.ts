export type UserModel = null | {
  api_token?: string;
  id?: string;

  name?: string;
  email?: string;
  avatar_url?: string;
  verified?: number;
  password?: string;
  type_member?: string;
  address?: string;
  namadepan?: string;
  namatengah?: string;
  namabelakang?: string;
  hp?: string;
  prop?: string;
  kab?: string;
  kec?: string;
  kel?: string;
  kodepos?: string;
  rt?: string;
  rw?: string;
  jl?: string;

  foto?: string;
  buyer?: string;
  gender?: string;
  tgllahir?: string;

  [key: string]: any;
};

export type AddressModel = {
  id?: string;
  title?: string;
  name?: string;
  phone?: string;
  address?: string;
  latlng?: string;
  
  vch_nama?: string;
  nama?: string;
  alamat?: string;
  email?: string;
  hp?: string;
  prop?: string;
  kab?: string;
  kec?: string;
  kel?: string;
  rt?: string;
  rw?: string;
  kodepos?: string;
  lat?: string;
  lng?: string;
};

export type UserExist = {
  kd_customer?: string;
  nm_customer?: string;
};
