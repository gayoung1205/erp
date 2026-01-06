import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestFileCreate = async (id, files, onUploadProgress) => {
  let token = sessionStorage.getItem('token'); // Login Token

  const formData = new FormData();

  for (let i = 0; i < files.length; i++) formData.append(i, files[i]);
  formData.append('techSupport_id', id);

  await axios({
    url: `${config.backEndServerAddress}api/techSupportFiles`,
    method: 'POST',
    headers: { Authorization: `JWT ${token}`, 'Content-Type': 'multipart/form-data' },
    data: formData,
    onUploadProgress,
  }).catch((err) => CheckToken(err));
};

export default requestFileCreate;
