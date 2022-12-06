import { colors } from "../styles";
import { TransactionPaymentStatus, TransactionStatus } from '../../types/model';

export const getStatusText = (status?: TransactionStatus): string => {
  switch (status) {
    case 'nklunas':
      return 'CLOSING';
    case 'nplunas':
      return 'CLOSING';
    case 'npfullpay':
      return 'LUNAS';
    case 'npprogress':
      return 'PROGRESS';
    case 'belumbayar':
      return 'BELUM BAYAR';
    case 'expire':
      return 'EXPIRE';
    case 'sudahbayar':
      return 'PEMBAYARAN BERHASIL';
  }

  return '';
};

export const getStatusColor = (status?: TransactionStatus): string => {
  switch (status) {
    case 'nklunas':
      return colors.palettes.green;
    case 'nplunas':
      return colors.palettes.green;
    case 'npfullpay':
      return colors.palettes.blue;
    case 'npprogress':
      return colors.palettes.yellow;
    case 'belumbayar':
      return colors.palettes.red;
    case 'expire':
      return colors.palettes.red;
    case 'sudahbayar':
      return colors.palettes.green;
      // return colors.palettes.red;
  }

  return colors.gray[900];
};

export const getPaymentStatusText = (status?: TransactionPaymentStatus): string => {
  switch (status) {
    case 'pending':
      return 'Menunggu';
    case 'unpaid':
      return 'Belum Dibayar';
    case 'paid':
      return 'Sudah Dibayar';
    case 'reject':
      return 'Pembayaran Ditolak';
  }

  return '';
};

export const showPhone = (phone?: string, leading: string = '0') => {
  let result = phone;

  if (!phone) {
    return '';
  } else if (phone.toString().substring(0, 1) === '0') {
    result = phone.toString().substring(1);
  } else if (phone.toString().substring(0, 2) === '62') {
    result = phone.toString().substring(2);
  } else if (phone.toString().substring(0, 3) === '+62') {
    result = phone.toString().substring(3);
  }

  return leading + result;
};
