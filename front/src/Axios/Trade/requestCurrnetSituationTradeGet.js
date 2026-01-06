import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestCurrentSituationTradeGet = async (page, type) => {
  let token = sessionStorage.getItem('token'); // Login Token
  let returnData;
  let url = `trades?page=${page}`;

  if (type) {
    switch (type) {
      case 'delivery':
        // 납품현황
        url += `&category=7`;
        break;

      case 'myas':
        url = `myas`;
        break;

      default:
        // as현황
        url += `&category=0`;
        break;
    }
  }

  await axios({
    url: `${config.backEndServerAddress}api/${url}`,
    method: 'GET',
    headers: { Authorization: `JWT ${token}` },
  })
    .then((res) => {
      returnData = res.data.data;
    })
    .catch((err) => CheckToken(err));

  return returnData;
};

export default requestCurrentSituationTradeGet;
