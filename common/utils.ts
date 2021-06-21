export const transformPriceNum = (num: string) => {
  if (num.includes("万")) {
    return parseFloat(num) * 10000;
  } else {
    return parseFloat(num);
  }
};