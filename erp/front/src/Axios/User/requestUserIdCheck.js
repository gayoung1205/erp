import axios from 'axios';
import CheckToken from '../../App/components/checkToken.js';
import config from '../../config.js';

const requestUserIdCheck = async (id) => {
  let token = sessionStorage.getItem('token'); // Login Token
  let returnData;

  await axios({
    url: `${config.backEndServerAddress}api/userIdCheck/?id=${id}`,
    method: 'GET',
    headers: { Authorization: `JWT ${token}` },
  })
    .then((res) => {
      returnData = res.data.data;
    })
    .catch((err) => CheckToken(err));

  return returnData;
};

export default requestUserIdCheck;
