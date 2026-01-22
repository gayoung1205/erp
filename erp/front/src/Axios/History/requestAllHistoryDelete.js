import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestAllHistoryDelete = (id) => {
  let token = sessionStorage.getItem('token'); // Login Token

  axios({
    url: `${config.backEndServerAddress}api/hisall/${id}/`,
    method: 'DELETE',
    headers: { Authorization: `JWT ${token}` },
  }).catch((err) => CheckToken(err));
};

export default requestAllHistoryDelete;
