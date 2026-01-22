import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestRecordCreate = async (data) => {
  let token = sessionStorage.getItem('token');

  await axios({
    url: `${config.backEndServerAddress}api/record`,
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    data: data,
  }).catch((err) => CheckToken(err));
};

export default requestRecordCreate;