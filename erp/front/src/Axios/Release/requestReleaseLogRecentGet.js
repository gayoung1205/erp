import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestReleaseLogRecentGet = async () => {
    let token = sessionStorage.getItem('token');
    let releaseData;

    await axios({
        url: `${config.backEndServerAddress}api/release/log/recent`,
        method: 'GET',
        headers: { Authorization: `JWT ${token}` },
    })
        .then((res) => {
            let { data } = res.data;
            releaseData = data;
        })
        .catch((err) => {
            CheckToken(err);
        });

    return releaseData;
};

export default requestReleaseLogRecentGet;