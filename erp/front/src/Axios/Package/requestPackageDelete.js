import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';
import { message } from 'antd';

const requestPackageDelete = async (packageId) => {
    let token = sessionStorage.getItem('token');
    let result = false;

    await axios({
        url: `${config.backEndServerAddress}api/package/${packageId}/`,
        method: 'DELETE',
        headers: { Authorization: `JWT ${token}` },
    })
        .then((res) => {
            message.success('패키지가 삭제되었습니다.');
            result = true;
        })
        .catch((err) => {
            CheckToken(err);
        });

    return result;
};

export default requestPackageDelete;