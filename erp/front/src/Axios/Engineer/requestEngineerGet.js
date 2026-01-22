import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestEngineerGet = async (isVisible) => {
  let token = sessionStorage.getItem('token'); // Login Token
  let returnData;

  await axios({
    url: `${config.backEndServerAddress}api/engineers?isVisible=${isVisible}`,
    method: 'GET',
    headers: { Authorization: `JWT ${token}` },
  })
    .then((res) => {
      returnData = res.data.data.results;
    })
    .catch((err) => {
      CheckToken(err);
    });

  return returnData;
};

export default requestEngineerGet;
