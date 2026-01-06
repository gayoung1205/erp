import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestHistoryCreate = async (historyData) => {
  let token = sessionStorage.getItem('token'); // Login Token

  await axios({
    url: `${config.backEndServerAddress}api/histories`,
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    data: historyData,
  }).catch((err) => CheckToken(err));
};

export default requestHistoryCreate;
