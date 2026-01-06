import { saveAs } from 'file-saver';
import Axios from 'axios';
import config from '../../config';
import CheckToken from '../../App/components/checkToken';

// 거래명세서 출력
const requestExcelGet = (props) => {
  const token = sessionStorage.getItem('token');
  Axios({
    url: `${config.backEndServerAddress}api/excel`,
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    data: { trade_id: props.id },
    responseType: 'blob',
  })
    .then((res) => {
      let date = props.register_date;
      let filename = `${date.substring(0, 4)}${date.substring(5, 7)}${date.substring(8, 10)} ${props.customer_name} 거래명세서.xlsx`;

      saveAs(res.data, filename);
    })
    .catch((err) => CheckToken(err));
};

export default requestExcelGet;
