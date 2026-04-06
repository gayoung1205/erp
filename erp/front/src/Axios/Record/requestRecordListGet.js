import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestRecordListGet = async (category, accept, page, dateRange, viewType, userId) => {
  let token = sessionStorage.getItem('token');
  let returnData, url;

  switch (accept) {
    case 1:
      url = `${config.backEndServerAddress}api/record?category=${category}&accept=1&page=${page || 1}`;
      break;
    case 'all':
      url = `${config.backEndServerAddress}api/record?all=1`;
      break;
    default:
      url = `${config.backEndServerAddress}api/record?category=${category}&page=${page || 1}`;
      if (viewType) {
        url += `&view_type=${viewType}`;
      }
      if (userId) {
        url += `&user_id=${userId}`;
      }
      break;
  }

  if (dateRange) {
    if (dateRange.startDate) url += `&start_date=${dateRange.startDate}`;
    if (dateRange.endDate) url += `&end_date=${dateRange.endDate}`;
  }

  await axios({
    url: url,
    method: 'GET',
    headers: { Authorization: `JWT ${token}` },
  })
  .then((res) => {
    returnData = res.data;
  })
  .catch((err) => {
    CheckToken(err);
  });

  return returnData;
};

export default requestRecordListGet;