import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestFileDelete = async (id) => {
  let token = sessionStorage.getItem('token'); // Login Token

  await axios({
    url: `${config.backEndServerAddress}api/techSupportFile/${id}/`,
    method: 'DELETE',
    headers: { Authorization: `JWT ${token}` },
  }).catch((err) => CheckToken(err));
};

export default requestFileDelete;
