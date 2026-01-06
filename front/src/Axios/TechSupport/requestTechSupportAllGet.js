import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestTechSupportAllGet = async () => {
  let token = sessionStorage.getItem('token'); // Login Token
  let returnData;

  await axios({
    url: `${config.backEndServerAddress}api/techSupports`,
    method: 'GET',
    headers: { Authorization: `JWT ${token}` },
  })
    .then((res) => (returnData = res.data.data))
    .catch((err) => {
      CheckToken(err);
    });

  return returnData;
};

export default requestTechSupportAllGet;
