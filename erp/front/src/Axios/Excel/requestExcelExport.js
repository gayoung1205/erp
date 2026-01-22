import Axios from 'axios';
import config from '../../config';
import CheckToken from '../../App/components/checkToken';

const requestExcelExport = async (type, customerId, date, onDownloadProgress) => {
  const token = sessionStorage.getItem('token');
  let sendDate = {};
  if (date) {
    if (new Date(date.startDate).getTime() <= new Date(date.endDate).getTime()) {
      sendDate['start_date'] = date.startDate;
      sendDate['end_date'] = date.endDate;
    } else {
      sendDate['start_date'] = date.endDate;
      sendDate['end_date'] = date.startDate;
    }
  }

  await Axios({
    url: `${config.backEndServerAddress}api/export/excel/`,
    method: 'POST',
    headers: { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' },
    data: { type: type, customer_id: customerId, date: sendDate },
    responseType: 'blob',
    onDownloadProgress,
  })
    .then((res) => {
      const fileName = decodeURI(res.headers['content-disposition'], 'UTF-8').split("filename*=UTF-8''")[1];
      const url = window.URL.createObjectURL(new Blob([res.data], { type: res.headers['content-type'] }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    })
    .catch((err) => CheckToken(err));
};

export default requestExcelExport;
