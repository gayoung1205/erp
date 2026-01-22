import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestToDoCreate = async (data) => {
  let token = sessionStorage.getItem('token'); // Login Token
  let responseData;

  await axios({
    url: `${config.backEndServerAddress}api/toDo`,
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    data: data,
  })
    .then((res) => {
      let { data } = res.data;

      responseData = data;
    })
    .catch((err) => {
      CheckToken(err);
    });

  return responseData;
};

export default requestToDoCreate;
