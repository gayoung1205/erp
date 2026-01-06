import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestCategoryUpdate = async (id, text) => {
  let token = sessionStorage.getItem('token'); // Login Token

  await axios({
    url: `${config.backEndServerAddress}api/category/${id}/`,
    method: 'PUT',
    headers: { Authorization: `JWT ${token}` },
    data: { id: id, name: text },
  }).catch((err) => {
    CheckToken(err);
  });
};

export default requestCategoryUpdate;
