import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestReleaseLogPermissionGet = async () => {
    let token = sessionStorage.getItem('token');
    let permissionData;

    await axios({
        url: `${config.backEndServerAddress}api/release/log/permission`,
        method: 'GET',
        headers: { Authorization: `JWT ${token}` },
    })
        .then((res) => {
            let { data } = res.data;
            permissionData = data;
        })
        .catch((err) => {
            CheckToken(err);
        });

    return permissionData;
};

export default requestReleaseLogPermissionGet;