import React, { useEffect } from 'react';
import { Card, Button, Row } from 'react-bootstrap';
import { isEmptyObject } from 'jquery';
import Grid from '@toast-ui/react-grid';
import 'tui-grid/dist/tui-grid.css';
import { message } from 'antd';
import 'antd/dist/antd.css';
import setComma from '../../../App/components/setComma';
import calcTaxCategory from '../../../App/components/calcTaxCategory';
import CustomButton from '../../../App/components/CustomButton';
import CustomNumberEditor from '../../../App/components/CustomNumberEditor';
import ReleaseButton from '../../../App/components/Button/releaseButton';
import handlePriceGrade from '../../../App/components/handlePriceGrade';
import handleTaxCategory from '../../../App/components/handleTaxCategory';

const BuySaleCreateGrid = (props) => {
  const gridRef = React.createRef(); // Grid Function 쓰기 위해서

  useEffect(() => {
    if (!isEmptyObject(props.appendRowData)) {
      // History Grid Row 추가
      gridRef.current.getInstance().appendRow(props.appendRowData, { extendPrevRowSpan: false });
    }
  }, [props.appendRowData]);

  const requestCreate = () => {
    gridRef.current.getInstance().finishEditing();

    let gridData = gridRef.current.getInstance().getData();

    if (!gridData || gridData.length === 0) {
      message.warning('등록할 제품이 없습니다.');
      return;
    }

    let historyData = { history: [], release: [] };

    for (const i in gridData) {
      const item = gridData[i];

      if (!item.name || item.name === '') {
        message.warning('제품명이 누락된 항목이 있습니다.');
        return;
      }
      if (!item.amount || item.amount <= 0) {
        message.warning('수량이 올바르지 않은 항목이 있습니다.');
        return;
      }
      if (item.price === undefined || item.price === null) {
        message.warning('단가가 누락된 항목이 있습니다.');
        return;
      }
      if (!item.product_id) {
        message.warning('제품 정보가 누락된 항목이 있습니다. 제품을 다시 선택해주세요.');
        return;
      }

      item.tax_category = handleTaxCategory('int', item.tax_category);

      if (item.tax_category === undefined || item.tax_category === null) {
        item.tax_category = 0;
      }

      if (item.type === 'release') {
        historyData.release.push(item);
      } else {
        historyData.history.push(item);
      }
    }

    props.buySaleCreate(historyData);
  };

  // 출고 삽입
  const insertRelease = (data) => {
    let priceGrade = handlePriceGrade(props.priceGrade);

    let taxSet = calcTaxCategory(data.tax_category, data[priceGrade], data.amount);

    gridRef.current.getInstance().appendRow(
      {
        id: data.id,
        product_id: data.product_id,
        trade_category: props.category_1,
        product_category: data.product_category,
        name: data.name,
        amount: data.amount,
        price: data[priceGrade],
        supply: taxSet.supply,
        surtax: taxSet.surtax,
        total_price: taxSet.total_price,
        tax_category: handleTaxCategory('string', data.tax_category),
        type: 'release',
      },
      { extendPrevRowSpan: false }
    );
  };

  //내역테이블 columns
  const historyColumns = [
    { name: 'name', header: '제품명', sortable: true, align: 'center' },
    { name: 'product_category', header: '제품분류', sortable: true, align: 'center' },
    {
      name: 'amount',
      header: '수량',
      sortable: true,
      align: 'center',
      onAfterChange(e) {
        let rowData = gridRef.current.getInstance().getRow(e.rowKey);
        let total_price =
          rowData.tax_category === '부가세 적용'
            ? parseInt(rowData.amount) * (parseInt(rowData.supply) + parseInt(rowData.surtax))
            : parseInt(rowData.amount) * parseInt(rowData.price);
        gridRef.current.getInstance().setValue(e.rowKey, 'total_price', total_price);
      },
      editor: {
        type: CustomNumberEditor,
      },
      formatter({ value }) {
        return `${setComma(value)}`;
      },
    },
    {
      name: 'supply',
      header: '공급가',
      sortable: true,
      align: 'center',
      formatter({ value }) {
        return `${setComma(value)}`;
      },
    },
    {
      name: 'surtax',
      header: '부가세',
      sortable: true,
      align: 'center',
      formatter({ value }) {
        return `${setComma(value)}`;
      },
    },
    {
      name: 'price',
      header: '단가',
      sortable: true,
      align: 'center',
      onAfterChange(e) {
        let rowData = gridRef.current.getInstance().getRow(e.rowKey);
        let taxSet = calcTaxCategory(rowData.tax_category, rowData.price, rowData.amount);
        gridRef.current.getInstance().setValue(e.rowKey, 'supply', parseInt(taxSet.supply));
        gridRef.current.getInstance().setValue(e.rowKey, 'surtax', parseInt(taxSet.surtax));
        gridRef.current.getInstance().setValue(e.rowKey, 'total_price', parseInt(taxSet.total_price));
      },
      editor: {
        type: CustomNumberEditor,
      },
      formatter({ value }) {
        return `${setComma(value)}`;
      },
    },
    {
      name: 'total_price',
      header: '금액',
      sortable: true,
      align: 'center',
      formatter({ value }) {
        return `${setComma(value)}`;
      },
    },
    {
      name: 'tax_category',
      header: '부가세 형식',
      sortable: true,
      align: 'center',
      onAfterChange(e) {
        let rowData = gridRef.current.getInstance().getRow(e.rowKey);
        let taxSet = calcTaxCategory(rowData.tax_category, rowData.price, rowData.amount);
        gridRef.current.getInstance().setValue(e.rowKey, 'supply', parseInt(taxSet.supply));
        gridRef.current.getInstance().setValue(e.rowKey, 'surtax', parseInt(taxSet.surtax));
        gridRef.current.getInstance().setValue(e.rowKey, 'total_price', parseInt(taxSet.total_price));
      },
      editor: {
        type: 'select',
        options: {
          listItems: [
            { text: '부가세 없음', value: '부가세 없음' },
            { text: '부가세 적용', value: '부가세 적용' },
            { text: '상품에 포함', value: '상품에 포함' },
          ],
        },
      },
    },
    {
      name: 'action',
      header: '삭제',
      align: 'center',
      renderer: {
        type: CustomButton,
      },
    },
  ];

  return (
    <>
      <Card>
        <Card.Header>
          <Card.Title as="h5">내역</Card.Title>

          <Row style={{ float: 'right' }}>
            {props.category1 === 3 ? <ReleaseButton insertRelease={(data) => insertRelease(data)} /> : null}
            <Button
                variant="primary"
                style={{ float: 'right' }}
                onClick={() => requestCreate()}
                disabled={props.isSubmitting}
            >
              {props.isSubmitting ? '처리중...' : '완료'}
            </Button>
            <Button
              variant="primary"
              style={{ float: 'right' }}
              onClick={(e) => {
                gridRef.current.getInstance().clear();
              }}
            >
              전체삭제
            </Button>
          </Row>
        </Card.Header>
        <Card.Body>
          <Grid
            ref={gridRef}
            scrollX={true}
            scrollY={true}
            columns={historyColumns}
            rowHeight={25}
            bodyHeight="auto" //height 길이
            columnOptions={{ resizable: true }} //column width 조절 가능
            selectionUnit="row" //grid select unit, 그리드 선택단위, ('row', 'cell')
            onClick={(e) => {
              if (e.columnName === 'action') gridRef.current.getInstance().removeRow(e.rowKey);
            }}
            summary={{
              height: 40,
              position: 'top', // 'top' or 'bottom'
              columnContent: {
                total_price: {
                  template: function (val) {
                    return `TOTAL= ${setComma(val.sum)}`;
                  },
                },
              },
            }}
          />
        </Card.Body>
      </Card>
    </>
  );
};

export default BuySaleCreateGrid;
