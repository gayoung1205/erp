import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestSearchTableGet = async (props) => {
  let token = sessionStorage.getItem('token'); // Login Token
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

  let url = `${config.backEndServerAddress}api/${table}?search=${encodeURIComponent(searchText)}`;

  if (table === 'products' && props.productCategory && props.productCategory !== '전체') {
    url += `&category=${encodeURIComponent(props.productCategory)}`;
  }

  await axios({
    url: url,
    method: 'GET',
    headers: { Authorization: `JWT ${token}` },
  })
      .then((res) => {
        let { results } = res.data.data;

        returnData = results;
      })
      .catch((err) => CheckToken(err));

  return returnData;
};

export default requestSearchTableGet;
