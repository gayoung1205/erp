import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestSearchTableGet = async (props) => {
  let token = sessionStorage.getItem('token');
  let returnData;

  let table, searchText;
  switch (props.tables) {
    case '제품':
      table = 'products';
      break;
    case 'AS 및 거래':
      table = 'trades';
      break;
    default:
      table = 'customers';
      break;
  }

  if (typeof props.tags === 'string') {
    searchText = props.tags;
  } else {
    for (const i in props.tags) {
      if (i === '0') {
        searchText = props.tags[i];
      } else {
        searchText += ',' + props.tags[i];
      }
    }
  }

  let baseUrl = `${config.backEndServerAddress}api/${table}?search=${encodeURIComponent(searchText)}`;

  if (table === 'products' && props.productCategory && props.productCategory !== '전체') {
    baseUrl += `&category=${encodeURIComponent(props.productCategory)}`;
  }

  await axios({
    url: baseUrl + '&page=1',
    method: 'GET',
    headers: { Authorization: `JWT ${token}` },
  })
  .then(async (res) => {
    const { results, max_page } = res.data.data;
    let allResults = [...results];

    if (max_page > 1) {
      for (let page = 2; page <= max_page; page++) {
        await axios({
          url: baseUrl + `&page=${page}`,
          method: 'GET',
          headers: { Authorization: `JWT ${token}` },
        })
        .then((pageRes) => {
          allResults = [...allResults, ...pageRes.data.data.results];
        })
        .catch((err) => CheckToken(err));
      }
    }

    returnData = allResults;
  })
  .catch((err) => CheckToken(err));

  return returnData;
};

export default requestSearchTableGet;