import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestToDoDelete = (props) => {
  let token = sessionStorage.getItem('token'); // Login Token

  axios({
    url: `${config.backEndServerAddress}api/toDo/${props}`,
    method: 'DELETE',
    headers: { Authorization: `JWT ${token}` },
  }).catch((err) => {
    CheckToken(err);
  });
};

export default requestToDoDelete;
