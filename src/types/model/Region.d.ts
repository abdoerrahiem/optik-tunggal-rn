export type RegionModel = {
  id?: string;
  nama?: string;
}

export type ShippingModel = {
  id?: string;
  ekspedisi_name?: string;
  origin?: string;
  destination?: string;
  keterangan?: string;
  shipcost?: number;
  estimasi?: string;
  kodepos?: any;
  image?: string;
}

export type ProvinceModel = RegionModel & {
  // 
};

export type CityModel = RegionModel & {
  // 
};

export type DistrictModel = RegionModel & {
  // 
};

export type VillageModel = RegionModel & {
  nama_alamat?: string;
  kodepos?: string;
};
