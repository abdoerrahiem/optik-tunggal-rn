import colors from "./colors";

const shadow = {
  shadowColor: colors.black,
  shadowOpacity: 0.1,
  shadowRadius: 5,
};

const shadows = {
  0: {
    ...shadow,
    elevation: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 0,
  },
  1: {
    ...shadow,
    elevation: 1,
  },
  2: {
    ...shadow,
    elevation: 2,
  },
  3: {
    ...shadow,
    elevation: 3,
  },
  4: {
    ...shadow,
    elevation: 4,
  },
  5: {
    ...shadow,
    elevation: 5,
  },
};

export default shadows;
