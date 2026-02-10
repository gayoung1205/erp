import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestInactiveProductGet = async () => {
    let token = sessionStorage.getItem('token');
    let productData;

    await axios({
        url: `${config.backEndServerAddress}api/products?isActive=false`,
        method: 'GET',
        headers: { Authorization: `JWT ${token}` },
    })
        .then((res) => {
            let { results } = res.data.data;
            productData = results;
        })
        .catch((err) => {
            CheckToken(err);
        });

    return productData;
};

export default requestInactiveProductGet;