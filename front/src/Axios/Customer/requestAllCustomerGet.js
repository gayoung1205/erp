import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestAllCustomerGet = async (page) => {
  let token = sessionStorage.getItem('token'); // Login Token
  let returnData;

  await axios({
    url: `${config.backEndServerAddress}api/customers?page=${page}`,
    method: 'GET',
    headers: { Authorization: `JWT ${token}` },
  })
    .then((res) => {
      returnData = res.data.data;
    })
    .catch((err) => {
      CheckToken(err);
    });

  return returnData;
};

export default requestAllCustomerGet;
