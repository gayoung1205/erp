import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestTradeUpdate = async (id, reqData) => {
  let token = sessionStorage.getItem('token'); // Login Token

  await axios({
    url: `${config.backEndServerAddress}api/trade/${id}/`,
    method: 'PUT',
    headers: { Authorization: `JWT ${token}` },
    data: reqData,
  }).catch((err) => CheckToken(err));
};

export default requestTradeUpdate;
