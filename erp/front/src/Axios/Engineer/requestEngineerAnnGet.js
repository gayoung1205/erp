import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestEngineerAnnGet = async () => {
  let token = sessionStorage.getItem('token'); // Login Token
  let returnData;

  await axios({
    url: `${config.backEndServerAddress}api/engineers?is_ann=1`,
    method: 'GET',
    headers: { Authorization: `JWT ${token}` },
  })
    .then((res) => {
      returnData = res.data.data;
    })
    .catch((err) => {
      CheckToken(err);
    });

  return returnData;
};

export default requestEngineerAnnGet;
