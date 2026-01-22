import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestCalendarUpdate = async (id, data) => {
  let token = sessionStorage.getItem('token'); // Login Token

  await axios({
    url: `${config.backEndServerAddress}api/calendar/${id}/`,
    method: 'PUT',
    headers: { Authorization: `JWT ${token}` },
    data: data,
  }).catch((err) => {
    CheckToken(err);
  });
};

export default requestCalendarUpdate;
