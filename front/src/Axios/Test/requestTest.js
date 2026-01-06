import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestTest = () => {
  let token = sessionStorage.getItem('token'); // Login Token

  axios({
    url: `${config.backEndServerAddress}api/test`,
    method: 'GET',
    headers: { Authorization: `JWT ${token}` },
  }).catch((err) => {
    CheckToken(err);
  });
};

export default requestTest;
