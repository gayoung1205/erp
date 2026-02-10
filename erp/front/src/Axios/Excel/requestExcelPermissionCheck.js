import axios from 'axios';
import config from '../../config';
import CheckToken from '../../App/components/checkToken';

/**
 * 현재 로그인한 사용자의 엑셀 다운로드 권한 확인
 */
const requestExcelPermissionCheck = async () => {
    const token = sessionStorage.getItem('token');
    const permission = sessionStorage.getItem('permission');

    if (permission === '2' || permission === '3') {
        return {
            can_export_customer: true,
            can_export_trade: true,
            can_export_product: true,
            can_export_release: true,
            can_export_release_log: true,
            can_export_accounting: true,
            can_export_receivable: true,
        };
    }

    let returnData = {
        can_export_customer: false,
        can_export_trade: false,
        can_export_product: false,
        can_export_release: false,
        can_export_release_log: false,
        can_export_accounting: false,
        can_export_receivable: false,
    };

    await axios({
        url: `${config.backEndServerAddress}api/release/log/permission`,
        method: 'GET',
        headers: { Authorization: `JWT ${token}` },
    })
        .then((res) => {
            const permissions = res.data.data;
            const myPerm = permissions.find(p => p.department === parseInt(permission));
            if (myPerm) {
                returnData = {
                    can_export_customer: myPerm.can_export_customer || false,
                    can_export_trade: myPerm.can_export_trade || false,
                    can_export_product: myPerm.can_export_product || false,
                    can_export_release: myPerm.can_export_release || false,
                    can_export_release_log: myPerm.can_export_release_log || false,
                    can_export_accounting: myPerm.can_export_accounting || false,
                    can_export_receivable: myPerm.can_export_receivable || false,
                };
            }
        })
        .catch((err) => {
            CheckToken(err);
        });

    return returnData;
};

export default requestExcelPermissionCheck;