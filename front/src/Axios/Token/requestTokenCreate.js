import axios from 'axios';
import config from '../../config.js';

const requestTokenCreate = async (data) => {
  let returnData;
  
  await axios({
    url: `${config.backEndServerAddress}api-token-auth/`,
    method: 'POST',
    data: data,
  })
    .then((res) => {
      returnData = res.data.token;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });

  return returnData;
};

export default requestTokenCreate;
