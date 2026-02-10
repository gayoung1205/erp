import { message, Modal, Progress, DatePicker, Radio, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import requestExcelExport from '../../Axios/Excel/requestExcelExport';
import '../../assets/css/dynamic-progress-modal.css';
import moment from 'moment';

const { RangePicker } = DatePicker;

const DynamicProgress = (props) => {
    const [percent, setPercent] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);
    const [dateRange, setDateRange] = useState(null);
    const [downloadType, setDownloadType] = useState('range');

    useEffect(() => {
        if (props.visible && !isDownloading) {
            setShowDateModal(true);
        }
    }, [props.visible, isDownloading]);

    const startDownload = () => {
        setShowDateModal(false);
        setIsDownloading(true);

        let dateData = null;
        if (downloadType === 'range' && dateRange && dateRange.length === 2) {
            dateData = {
                startDate: dateRange[0].format('YYYY-MM-DD'),
                endDate: dateRange[1].format('YYYY-MM-DD'),
            };
        }

        requestExcelExport(props.type, props.customerId, dateData, (e) => {
            setPercent(Math.round((100 * e.loaded) / e.total));
        })
            .then(() => {
                finishDownload();
                message.success('다운로드 완료!');
            })
            .catch(() => {
                finishDownload();
                message.error('파일 다운로드 실패');
            });
    };

    const finishDownload = () => {
        setPercent(0);
        setIsDownloading(false);
        setDateRange(null);
        setDownloadType('range');
        props.downloadModalProcessing(false);
    };

    const handleCancel = () => {
        setShowDateModal(false);
        setDateRange(null);
        setDownloadType('range');
        props.downloadModalProcessing(false);
    };

    const quickRanges = {
        '오늘': [moment(), moment()],
        '이번 주': [moment().startOf('week'), moment().endOf('week')],
        '이번 달': [moment().startOf('month'), moment().endOf('month')],
        '지난 달': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
        '최근 3개월': [moment().subtract(3, 'month'), moment()],
        '올해': [moment().startOf('year'), moment()],
    };

    const getTypeName = () => {
        switch (props.type) {
            case 'customer': return '고객';
            case 'trade': return '거래내역';
            case 'product': return '제품';
            default: return '데이터';
        }
    };

    return (
        <>
            <Modal
                title={`${getTypeName()} 엑셀 다운로드`}
                visible={showDateModal}
                onOk={startDownload}
                onCancel={handleCancel}
                okText="다운로드"
                cancelText="취소"
                okButtonProps={{
                    disabled: downloadType === 'range' && (!dateRange || dateRange.length !== 2)
                }}
                centered
            >
                <Radio.Group
                    value={downloadType}
                    onChange={(e) => setDownloadType(e.target.value)}
                    style={{ marginBottom: '20px' }}
                >
                    <Space direction="vertical">
                        <Radio value="range">기간 선택</Radio>
                        <Radio value="all">전체 (오래 걸릴 수 있음)</Radio>
                    </Space>
                </Radio.Group>

                {downloadType === 'range' && (
                    <RangePicker
                        value={dateRange}
                        onChange={(dates) => setDateRange(dates)}
                        format="YYYY-MM-DD"
                        style={{ width: '100%' }}
                        ranges={quickRanges}
                        placeholder={['시작일', '종료일']}
                    />
                )}

                {downloadType === 'all' && (
                    <div style={{ padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
                        ⚠️ 전체 데이터는 시간이 오래 걸릴 수 있습니다.
                    </div>
                )}
            </Modal>

            <Modal
                className="dynamic-progress-modal"
                centered
                visible={isDownloading}
                closable={false}
                maskClosable={false}
                footer={null}
                zIndex={1031}
                width="auto"
            >
                <Progress type="circle" percent={percent} />
            </Modal>
        </>
    );
};

export default React.memo(DynamicProgress);