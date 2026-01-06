import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestCategoryCreate = async (data) => {
  let token = sessionStorage.getItem('token'); // Login Token

  await axios({
    url: `${config.backEndServerAddress}api/categories`,
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    data: data,
  }).catch((err) => CheckToken(err));
};

export default requestCategoryCreate;
