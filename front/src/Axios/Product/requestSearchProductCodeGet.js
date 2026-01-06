import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';
import { message } from 'antd';

const requestSearchProductCodeGet = async (props) => {
  let token = sessionStorage.getItem('token'); // Login Token
  let productData;

  await axios({
    url: `${config.backEndServerAddress}api/products?code=${props}`,
    method: 'GET',
    headers: { Authorization: `JWT ${token}` },
  })
    .then((res) => {
      if (res.data === '') {
        message.warning('일치하는 코드가 없습니다.');
      } else {
        let { results } = res.data.data;

        productData = results[0];
      }
    })
    .catch((err) => {
      CheckToken(err);
    });

  return productData;
};

export default requestSearchProductCodeGet;
