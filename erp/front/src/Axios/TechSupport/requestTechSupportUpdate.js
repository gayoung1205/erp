import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestTechSupportUpdate = async (id, data) => {
  let token = sessionStorage.getItem('token'); // Login Token

  // const formData = new FormData();

  // for (const i in data) formData.append(i, data[i]);

  await axios({
    url: `${config.backEndServerAddress}api/techSupport/${id}/`,
    method: 'PUT',
    headers: { Authorization: `JWT ${token}` },
    data: data,
  }).catch((err) => {
    CheckToken(err);
  });
};

export default requestTechSupportUpdate;
