// 직원 생성
// 유저 모델 생성 후에 엔지니어 모델 생성

import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestEngineerCreate = async (data) => {
  let token = sessionStorage.getItem('token'); // Login Token
  let returnData;

  await axios({
    url: `${config.backEndServerAddress}api/engineers`,
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    data: data,
  })
    .then((res) => (returnData = res.data.data))
    .catch((err) => CheckToken(err));

  return returnData;
};

export default requestEngineerCreate;
