import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestCategoryGet = async (category) => {
  let token = sessionStorage.getItem('token'); // Login Token
  let returnData;

  await axios({
    url: `${config.backEndServerAddress}api/categories?category=${category}`,
    method: 'GET',
    headers: { Authorization: `JWT ${token}` },
  })
    .then((res) => {
      let { data } = res.data;

      returnData = data;
    })
    .catch((err) => {
      CheckToken(err);
    });

  return returnData;
};

export default requestCategoryGet;
