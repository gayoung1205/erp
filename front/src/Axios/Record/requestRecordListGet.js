import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestRecordListGet = async (category, accept, page) => {
  let token = sessionStorage.getItem('token'); // Login Token
  let returnData, url;

  switch (accept) {
    case 1:
      url = `${config.backEndServerAddress}api/record?category=${category}&accept=1&page=${page}`;
      break;
    case 'all':
      url = `${config.backEndServerAddress}api/record?all=1`;
      break;
    default:
      url = `${config.backEndServerAddress}api/record?category=${category}`;
      break;
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
