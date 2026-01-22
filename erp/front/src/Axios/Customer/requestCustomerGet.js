import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestCustomerGet = async () => {
  let token = sessionStorage.getItem('token'); // Login Token
  let cmId = window.sessionStorage.getItem('customerId'); //Customer Number

  let returnData;

  if (cmId !== null) {
    await axios({
      url: `${config.backEndServerAddress}api/customer/${cmId}/`,
      method: 'GET',
      headers: { Authorization: `JWT ${token}` },
    })
      .then((res) => {
        returnData = res.data.data;
      })
      .catch((err) => {
        CheckToken(err);
      });
  }

  return returnData;
};

export default requestCustomerGet;
