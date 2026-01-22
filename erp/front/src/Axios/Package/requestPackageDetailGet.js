import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestPackageDetailGet = async (packageId) => {
    let token = sessionStorage.getItem('token');
    let packageData;

    await axios({
        url: `${config.backEndServerAddress}api/package/${packageId}/`,
        method: 'GET',
        headers: { Authorization: `JWT ${token}` },
    })
        .then((res) => {
            let { data } = res.data;
            packageData = data;
        })
        .catch((err) => {
            CheckToken(err);
        });

    return packageData;
};

export default requestPackageDetailGet;