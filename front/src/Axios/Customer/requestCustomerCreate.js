import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestCustomerCreate = async (data) => {
  let token = sessionStorage.getItem('token'); // Login Token

  axios({
    url: `${config.backEndServerAddress}api/customers`,
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    data: data,
  }).catch((err) => CheckToken(err));
};

export default requestCustomerCreate;
