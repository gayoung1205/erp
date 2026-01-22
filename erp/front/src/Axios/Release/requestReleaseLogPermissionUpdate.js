import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestReleaseLogPermissionUpdate = async (data) => {
    let token = sessionStorage.getItem('token');
    let result = false;

    await axios({
        url: `${config.backEndServerAddress}api/release/log/permission`,
        method: 'PUT',
        headers: { Authorization: `JWT ${token}` },
        data: data,
    })
        .then((res) => {
            result = true;
        })
        .catch((err) => {
            CheckToken(err);
        });

    return result;
};

export default requestReleaseLogPermissionUpdate;