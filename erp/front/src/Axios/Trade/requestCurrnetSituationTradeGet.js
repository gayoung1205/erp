import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestCurrentSituationTradeGet = async (page, type, fetchAll = false, statusFilter = null) => {
  let token = sessionStorage.getItem('token');
  let returnData;
  let url = `trades?page=${page}`;

  if (type) {
    switch (type) {
      case 'delivery':
        url += `&category=7`;
        break;
      case 'myas':
        url = `myas?page=${page}`;
        break;
      default:
        url += `&category=0`;
        break;
    }
  }

  if (statusFilter !== null && type !== 'myas') {
    url += `&status=${statusFilter}`;
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

  if (fetchAll && returnData && returnData.max_page > 1) {
    let allResults = [...returnData.results];

    for (let i = 2; i <= returnData.max_page; i++) {
      let nextUrl;
      if (type === 'myas') {
        nextUrl = `myas?page=${i}`;
      } else {
        nextUrl = `trades?page=${i}&category=${type === 'delivery' ? 7 : 0}`;
        if (statusFilter !== null) {
          nextUrl += `&status=${statusFilter}`;
        }
      }

      await axios({
        url: `${config.backEndServerAddress}api/${nextUrl}`,
        method: 'GET',
        headers: { Authorization: `JWT ${token}` },
      })
      .then((res) => {
        allResults = [...allResults, ...res.data.data.results];
      })
      .catch((err) => CheckToken(err));
    }

    returnData.results = allResults;
  }

  return returnData;
};

export default requestCurrentSituationTradeGet;