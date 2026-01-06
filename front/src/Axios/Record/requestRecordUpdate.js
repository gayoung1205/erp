import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestRecordUpdate = async (data, type, id) => {
  let token = sessionStorage.getItem('token'); // Login Token
  let url;

  // type으로 임시저장, 제출, 승인, 반려을 선별하고 val값으로 true로 변경
  switch (type) {
    case 'is_approved':
      data.is_approved = true;
      url = `${config.backEndServerAddress}api/record/${id}?approve=1`;
      break;
    case 'is_reject':
      data.is_reject = true;
      url = `${config.backEndServerAddress}api/record/${id}?reject=1`;
      break;
    default:
      url = `${config.backEndServerAddress}api/record/${id}`;
      break;
  }

  await axios({
    url: url,
    method: 'PUT',
    headers: { Authorization: `JWT ${token}` },
    data: data,
  }).catch((err) => {
    CheckToken(err);
  });
};

export default requestRecordUpdate;
