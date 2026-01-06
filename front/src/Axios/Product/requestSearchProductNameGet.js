import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';
import { message } from 'antd';

const requestSearchProductNameGet = async (searchText) => {
  let token = sessionStorage.getItem('token'); // Login Token
  let productData;

  await axios({
    url: `${config.backEndServerAddress}api/products?name=${searchText}&code=${searchText}`,
    method: 'GET',
    headers: { Authorization: `JWT ${token}` },
  })
    .then((res) => {
      if (res.data === '') {
        message.warning('검색 내용이 없습니다.');
      } else {
        let { results } = res.data.data;

        productData = results;
      }
    })
    .catch((err) => {
      CheckToken(err);
    });

  return productData;
};

export default requestSearchProductNameGet;
