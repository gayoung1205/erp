import { message } from 'antd';

const handleTaxCategory = (target, val) => {
  if (target === 'int') {
    switch (val) {
      case '부가세 없음':
        return 0;
      case '부가세 적용':
        return 1;
      case '상품에 포함':
        return 2;
      default:
        message.warning('부가세 형식이 없습니다.');
        break;
    }
  } else {
    switch (val) {
      case 0:
        return '부가세 없음';
      case 1:
        return '부가세 적용';
      case 2:
        return '상품에 포함';
      default:
        message.warning('부가세 형식이 없습니다.');
        break;
    }
  }
};

export default handleTaxCategory;
