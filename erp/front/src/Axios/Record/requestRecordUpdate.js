import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestRecordUpdate = async (data, type, id) => {
  let token = sessionStorage.getItem('token'); // Login Token
  let url;

  switch (type) {
    case 'is_approved':
      data.is_approved = true;
      url = `${config.backEndServerAddress}api/record/${id}/?approve=1`;
      break;
    case 'is_reject':
      data.is_reject = true;
      url = `${config.backEndServerAddress}api/record/${id}/?reject=1`;
      break;
    default:
      url = `${config.backEndServerAddress}api/record/${id}/`;
      break;
  }

  await axios({
    url: url,
    method: 'PUT',
    headers: { Authorization: `JWT ${token}` },
    data: data,
  }).catch((err) => {
    CheckToken(err);
  });
};

export default requestRecordUpdate;
