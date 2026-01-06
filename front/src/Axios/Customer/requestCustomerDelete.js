import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestCustomerDelete = async (id) => {
  let token = sessionStorage.getItem('token'); // Login Token

  await axios({
    url: `${config.backEndServerAddress}api/customer/${id}/`,
    method: 'DELETE',
    headers: { Authorization: `JWT ${token}` },
  }).catch((err) => CheckToken(err));
};

export default requestCustomerDelete;
