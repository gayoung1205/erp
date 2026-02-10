import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';
import { message } from 'antd';

const requestSearchProductCodeGet = async (props) => {
  let token = sessionStorage.getItem('token');
  let productData;
  const encodedText = encodeURIComponent(props);

  await axios({
    url: `${config.backEndServerAddress}api/products?name=${encodedText}&code=${encodedText}`,
    method: 'GET',
    headers: { Authorization: `JWT ${token}` },
  })
      .then((res) => {
        if (!res.data || !res.data.data || !res.data.data.results || res.data.data.results.length === 0) {
          message.warning('일치하는 제품이 없습니다.');
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