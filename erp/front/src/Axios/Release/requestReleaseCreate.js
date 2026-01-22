import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestReleaseCreate = async (data) => {
  let token = sessionStorage.getItem('token'); // Login Token
  let returnData;

  await axios({
    url: `${config.backEndServerAddress}api/release`,
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    data: data,
  })
    .then((res) => {
      let { data } = res.data;

      returnData = data;
    })
    .catch((err) => {
      CheckToken(err);
    });

  return returnData;
};

export default requestReleaseCreate;
