import { default as numeraljs } from "numeral";

const numeral = numeraljs;

// Register locale for Indonesia
numeral.register('locale', 'id', {
  delimiters: {
    thousands: '.',
    decimal: ','
  },
  abbreviations: {
    thousand: 'rb',
    million: 'jt',
    billion: 'm',
    trillion: 't'
  },
  ordinal: numeral.locales.en.ordinal,
  currency: {
    symbol: 'Rp'
  }
});

numeral.locale('id');

numeral.defaultFormat('$0,0');

export default numeral;
