import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestAccountingCalcGet = async (startDate, endDate) => {
  let token = sessionStorage.getItem('token'); // Login Token
  let returnData;

  await axios({
    url: `${config.backEndServerAddress}api/accountingCalc?start_date=${startDate}&end_date=${endDate}`,
    method: 'GET',
    headers: { Authorization: `JWT ${token}` },
  })
    .then((res) => {
      returnData = res.data.data;
    })
    .catch((err) => CheckToken(err));
  return returnData;
};

export default requestAccountingCalcGet;
