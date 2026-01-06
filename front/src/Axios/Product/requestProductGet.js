import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestProductGet = async (page) => {
  
  let token = sessionStorage.getItem('token'); // Login Token
  let returnData;

  await axios({   
    url: `${config.backEndServerAddress}api/products?page=${page}`,
    method: 'GET',
    headers: { Authorization: `JWT ${token}` },
  })
    .then((res) => {
      returnData = res.data.data;
      console.log(1)
    })
    .catch((err) => {
      CheckToken(err);
      console.log(2)
    });

  return returnData;
};

export default requestProductGet;
