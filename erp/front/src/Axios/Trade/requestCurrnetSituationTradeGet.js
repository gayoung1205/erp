import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestCurrentSituationTradeGet = async (page, type, fetchAll = false, statusFilters = null, startDate = null, endDate = null, ordering = null) => {
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
      case 'construction':
        url += `&category=9`;
        break;
      default:
        url += `&category=0`;
        break;
    }
  }

  if (statusFilters && !statusFilters.includes('all') && type !== 'myas') {
    statusFilters.forEach((s) => {
      url += `&status=${s}`;
    });
  }

  if (statusFilters && type === 'myas') {
    if (statusFilters.includes('all')) {
      url += `&status=0&status=2`;
    } else {
      statusFilters.forEach((s) => {
        url += `&status=${s}`;
      });
    }
  }

  if (startDate) {
    url += `&start_date=${startDate}`;
  }
  if (endDate) {
    url += `&end_date=${endDate}`;
  }

  if (ordering) {
    url += `&ordering=${ordering}`;
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
        nextUrl = `trades?page=${i}&category=${
            type === 'delivery' ? 7 : type === 'construction' ? 9 : 0
        }`;
      }

      if (statusFilters && !statusFilters.includes('all')) {
        statusFilters.forEach((s) => {
          nextUrl += `&status=${s}`;
        });
      }

      if (startDate) nextUrl += `&start_date=${startDate}`;
      if (endDate) nextUrl += `&end_date=${endDate}`;
      if (ordering) nextUrl += `&ordering=${ordering}`;

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