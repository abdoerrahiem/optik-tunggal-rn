export type ProductModel = {
  id?: number
  image?: any
  diameter?: any
  name?: string
  sku?: string
  merk?: string
  jeniswarna?: string
  longdesc?: string
  description?: string
  tested?: string
  certificate?: string
  detailproduk?: string
  
  discount?: number
  types?: ProductType[]
  qty?: number
  rating?: number
  reviews?: ReviewModel[]
  sales_count?: number

  categories?: CategoryModel[]
  brands?: BrandModel[]
  brandcl?: BrandCLModel[]
  warnas?: ColorModel[]
  spheries?: SpheriesModel[]
  genders?: GenderModel[]
  modelkacamatas?: ModelKacamata[]
  
  favorite?: boolean

  // API Responses
  prd_id?: string
  prd_ds?: string
  prd_no?: string
  product_info?: string
  package?: number

  prd_foto?: string
  images?: ProductPhoto[]

  prd_favorit?: '0' | '1'

  faktor_refill?: string
  unit_refill?: string

  harga?: number
  harga_promo?: number
  vto_active?: any
  hargapaketsatuan?: number

  diskon?: string

  [key: string]: any
}

// export type UserExistModel = {
//   id?: string;
//   nama_lengkap?: string;
//   namadepan?: string;
//   namabelakang?: string;
//   hp?: string;
//   jl?: string;
// };

export type ProductType = {
  name: string
  price: number
  contents?: string[]
  enabled?: boolean
  type?: CartItemType
}

export type ProductRetail = {
  name?: string
  link?: string
}

export type ProductPhoto = {
  id?: string
  kd_brg?: string
  nama_brg?: string
  prd_foto?: string
  prdname?: string
  tgl?: string
}

export type CategoryModel = {
  id?: string
  name?: string
  ds?: string
  image?: any
  foto?: string

  keywords?: string
}

export type GenderModel = {
  id?: string
  name?: string
  ds?: string
  image?: any
  foto?: string
}

export type ModelKacamata = {
  id?: string
  name?: string
  ds?: string
}

export type BrandModel = {
  id?: any
  name?: any
  fotobrand?: string
  codebrand?: any
  imgbrand?: any
  imgbrandbg?: any
}

export type BrandCLModel = {
  id?: any
  name?: any
  fotobrand?: string
  codebrand?: any
  imgbrand?: any
  imgbrandbg?: any
}

export type ColorModel = {
  id?: string
  kd_warna?: string
  nm_warna?: string
}

export type SpheriesModel = {
  id?: any
  kd_sph?: any
  ket?: any
}

export type BaseCurveModel = {
  id?: any
  code?: any
  name?: any
}

export type ReviewModel = {
  rating?: number
  content?: string
  name?: string
  date?: string
  product?: ProductModel
  replies?: ReviewModel[]

  id?: string
  nama?: string
  tgl?: string
  jam?: string
  star?: number
  stat?: number
  remark?: string
}

export type CartModel = {
  cartid?: number
  id?: number
  product_id?: number
  product?: ProductModel
  productname?: string
  pid?: string
  pid2?: string
  atributColor?: string
  atributColor2?: string
  atributColor3?: string
  atributSpheries?: string
  atributSpheries2?: string
  atributSpheries3?: string
  atributBcurve?: string
  atributBcurve2?: string
  atributBcurve3?: string
  jenisproduk?: string
  matakiri?: any
  matakanan?: any
  price_original?: number
  price?: number
  qty?: number
  note?: string
  prd_id?: string
  harga?: number
  hargapaket?: number
  paket?: any
  buyer?: '1' | '0'
  type?: CartItemType
  diff?: boolean
}

export type CartItemType = 'buyer'
