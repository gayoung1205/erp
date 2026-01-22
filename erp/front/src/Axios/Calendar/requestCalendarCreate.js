import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestCalendarCreate = async (data) => {
  let token = sessionStorage.getItem('token'); // Login Token
  let returnData;

  await axios({
    url: `${config.backEndServerAddress}api/calendars`,
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    data: data,
  })
    .then((res) => {
      returnData = res.data.data;
    })
    .catch((err) => CheckToken(err));

  return returnData;
};

export default requestCalendarCreate;
