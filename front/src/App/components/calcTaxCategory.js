// tax_category에 따라서 supply, surtax, total_price 변경
const calcTaxCategory = (tax_category, price, stock) => {
  let taxSet = { supply: 0, surtax: 0, total_price: 0 };
  switch (tax_category) {
    case 1:
    case '부가세 적용':
      taxSet.supply = price;
      taxSet.surtax = Math.round(price * 0.1);
      taxSet.total_price = stock * Math.round(price * 1.1);
      break;
    case 2:
    case '상품에 포함':
      taxSet.supply = Math.round(price * (10 / 11));
      taxSet.surtax = Math.round(price * (1 / 11));
      taxSet.total_price = stock * price;
      break;
    default:
      taxSet.supply = price;
      taxSet.surtax = 0;
      taxSet.total_price = stock * price;
      break;
  }
  return taxSet;
};

export default calcTaxCategory;
