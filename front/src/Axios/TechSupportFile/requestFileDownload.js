import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';
import { saveAs } from 'file-saver';

const requestFileDownload = async (file, onDownloadProgress) => {
  let token = sessionStorage.getItem('token'); // Login Token

  await axios({
    url: `${config.backEndServerAddress}api/techSupport/download/`,
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    data: { file_id: file.id },
    responseType: 'blob',
    // responseType: 'arraybuffer',
    onDownloadProgress,
  })
    .then((res) => {
      // const url = window.URL.createObjectURL(new Blob([res.data]));
      // const link = document.createElement('a');
      // const contentDisposition = res.headers['content-disposition']; // 파일 이름
      // let fileName = 'unknown';
      // if (contentDisposition) {
      //   const [fileNameMatch] = contentDisposition.split(';').filter((str) => str.includes('filename'));
      //   if (fileNameMatch) [, fileName] = fileNameMatch.split(`=UTF-8''`);
      // }
      // link.href = url;
      // link.setAttribute('download', `${fileName}`);
      // link.style.cssText = 'display:none';
      // document.body.appendChild(link);
      // link.click();
      // link.remove();

      // let contentDisposition = res.headers['content-disposition'];
      // const fileName = contentDisposition.split("filename*=UTF-8''")[1];
      saveAs(res.data, file.filename);
    })
    .catch((err) => CheckToken(err));
};

export default requestFileDownload;
