import React, { useEffect } from 'react';
import { Row, Card } from 'react-bootstrap';
import { isEmptyObject } from 'jquery';
import Grid from '@toast-ui/react-grid';
import 'tui-grid/dist/tui-grid.css';
import calcTaxCategory from '../../../App/components/calcTaxCategory';
import handlePriceGrade from '../../../App/components/handlePriceGrade';
import handleTaxCategory from '../../../App/components/handleTaxCategory';
import CustomButton from '../../../App/components/CustomButton';
import CustomNumberEditor from '../../../App/components/CustomNumberEditor';
import requestAllHistoryDelete from '../../../Axios/History/requestAllHistoryDelete';
import requestHistoryDelete from '../../../Axios/History/requestHistoryDelete';
import AllDeleteButton from '../../../App/components/Button/allDeleteButton';
import DeleteButton from '../../../App/components/Button/deleteButton';
import ReleaseButton from '../../../App/components/Button/releaseButton';
import UpdateButton from '../../../App/components/Button/updateButton';
import setComma from '../../../App/components/setComma';

const DeliveryUpdate = (props) => {
  const gridRef = React.createRef(); // Grid Function 쓰기 위해서

  // 처음 실행될 때 Trade Data Get
  useEffect(() => {
    if (!isEmptyObject(props.appendRowData)) {
      // History Grid Row 추가
      if (Array.isArray(props.appendRowData) === true) {
        for (const i in props.appendRowData) {
          gridRef.current.getInstance().appendRow(props.appendRowData[i], { extendPrevRowSpan: false });
        }
      } else {
        gridRef.current.getInstance().appendRow(props.appendRowData, { extendPrevRowSpan: false });
      }
    }
  }, [props.appendRowData]);

  // Delivery Update
  const deliveryUpdate = () => {
    gridRef.current.getInstance().finishEditing();

    let gridData = gridRef.current.getInstance().getData();

    let historyData = { history: [], release: [] };

    // History Tax_category Type을 String -> Int
    for (const i in gridData) {
      gridData[i].tax_category = handleTaxCategory('int', gridData[i].tax_category);
      if (gridData[i].type === 'release') {
        historyData.release.push(gridData[i]);
      } else {
        historyData.history.push(gridData[i]);
      }
    }

    props.deliveryUpdate(historyData);
  };

  // History Row Delete
  const requestHistoryRowDelete = (e) => {
    if (e.columnName === 'action') {
      // History Row Data
      let rowData = gridRef.current.getInstance().getRow(e.rowKey);

      if (rowData.id !== null) {
        if (rowData.type !== undefined) {
          gridRef.current.getInstance().removeRow(e.rowKey);
        } else {
          requestHistoryDelete(rowData.id).then(() => gridRef.current.getInstance().removeRow(e.rowKey));
        }
      } else {
        gridRef.current.getInstance().removeRow(e.rowKey);
      }
    }
  };

  // 내역 전체 삭제
  const allHistoryDelete = () => {
    gridRef.current.getInstance().clear();
    requestAllHistoryDelete(props.tradeId);
  };

  // 출고 삽입
  const insertRelease = (data) => {
    let priceGrade = handlePriceGrade(props.priceGrade);

    let taxSet = calcTaxCategory(data.tax_category, data[priceGrade], data.amount);

    gridRef.current.getInstance().appendRow(
      {
        id: data.id,
        product_id: data.product_id,
        trade_id: props.tradeId,
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
    <Card>
      <Card.Header>
        <Card.Title as="h5">내역</Card.Title>
        <Row style={{ float: 'right' }}>
          <ReleaseButton insertRelease={(data) => insertRelease(data)} />
          <UpdateButton update={() => deliveryUpdate()} />
          <AllDeleteButton allHistoryDelete={() => allHistoryDelete()} />
          <DeleteButton tradeId={props.tradeId} delete={() => props.deliveryDelete()} />
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
          onClick={(e) => requestHistoryRowDelete(e)}
          summary={{
            height: 40,
            position: 'top', // 'top' or 'bottom'
            columnContent: {
              useAutoSummary: true,
              total_price: {
                template: function (val) {
                  return `TOTAL: ${val.sum}`;
                },
              },
            },
          }}
        />
      </Card.Body>
    </Card>
  );
};

export default DeliveryUpdate;
