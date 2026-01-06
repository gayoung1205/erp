import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestReleaseAllUpdate = (data) => {
  let token = sessionStorage.getItem('token'); // Login Token

  axios({
    url: `${config.backEndServerAddress}api/release`,
    method: 'PUT',
    headers: { Authorization: `JWT ${token}` },
    data: data,
  }).catch((err) => {
    CheckToken(err);
  });
};

export default requestReleaseAllUpdate;
