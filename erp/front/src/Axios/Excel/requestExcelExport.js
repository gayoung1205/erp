import Axios from 'axios';
import config from '../../config';
import { message } from 'antd';

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

    return new Promise((resolve, reject) => {
        Axios({
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
                resolve();
            })
            .catch((err) => {
                if (err.response && err.response.status === 403) {
                    message.error('엑셀 다운로드 권한이 없습니다.');
                } else if (err.response && err.response.status === 401) {
                    message.error('로그인이 만료되었습니다.');
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('username');
                    sessionStorage.removeItem('permission');
                    window.location.reload();
                }
                reject(err);
            });
    });
};

export default requestExcelExport;