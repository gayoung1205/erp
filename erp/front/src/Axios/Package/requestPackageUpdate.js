import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';
import { message } from 'antd';

const requestPackageUpdate = async (packageId, data) => {
    let token = sessionStorage.getItem('token');
    let result = false;

    await axios({
        url: `${config.backEndServerAddress}api/package/${packageId}/`,
        method: 'PUT',
        headers: { Authorization: `JWT ${token}` },
        data: data,
    })
        .then((res) => {
            message.success('패키지가 수정되었습니다.');
            result = true;
        })
        .catch((err) => {
            if (err.response && err.response.data) {
                message.error(err.response.data.message);
            }
            CheckToken(err);
        });

    return result;
};

export default requestPackageUpdate;