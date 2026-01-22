import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';
import { message } from 'antd';

const requestPackageCreate = async (data) => {
    let token = sessionStorage.getItem('token');
    let result = false;

    await axios({
        url: `${config.backEndServerAddress}api/packages`,
        method: 'POST',
        headers: { Authorization: `JWT ${token}` },
        data: data,
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

export default requestPackageCreate;