import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestAllTradeGet = async (page, division, customerId) => {
  let token = sessionStorage.getItem('token'); // Login Token
  let returnData;
  let url = '';

  if (division) {
    url += `&division=${division}`;
  }

  if (customerId) {
    url += `&id=${customerId}`;
  }

  await axios({
    url: `${config.backEndServerAddress}api/trades?page=${page}${url}`,
    method: 'GET',
    headers: { Authorization: `JWT ${token}` },
  })
    .then((res) => {
      returnData = res.data.data;
    })
    .catch((err) => CheckToken(err));

  return returnData;
};

export default requestAllTradeGet;
