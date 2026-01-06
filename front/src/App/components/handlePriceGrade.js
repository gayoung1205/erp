const handlePriceGrade = (val) => {
  switch (val) {
    case '매입단가 적용':
      return 'in_price';
    case '소비자가 적용':
      return 'sale_price';
    default:
      return 'out_price';
  }
};

export default handlePriceGrade;
