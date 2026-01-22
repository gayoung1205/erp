import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';
import { message } from 'antd';

const requestReleasePackage = async (packageId) => {
    let token = sessionStorage.getItem('token');
    let result = null;

    await axios({
        url: `${config.backEndServerAddress}api/release/package`,
        method: 'POST',
        headers: { Authorization: `JWT ${token}` },
        data: { package_id: packageId },
    })
        .then((res) => {
            message.success(res.data.message);
            result = res.data.data;
        })
        .catch((err) => {
            if (err.response && err.response.data) {
                message.error(err.response.data.message);
            }
            CheckToken(err);
        });

    return result;
};

export default requestReleasePackage;