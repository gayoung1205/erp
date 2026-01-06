import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestTechSupportSearch = async (text) => {
  let token = sessionStorage.getItem('token'); // Login Token
  let returnData;

  await axios({
    url: `${config.backEndServerAddress}api/techSupports?search=${text}`,
    method: 'GET',
    headers: { Authorization: `JWT ${token}` },
  })
    .then((res) => {
      let { results } = res.data.data;

      returnData = results;
    })
    .catch((err) => CheckToken(err));

  return returnData;
};

export default requestTechSupportSearch;
