// data export excel component

import React from 'react';
import ReactExport from 'react-export-excel';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const exportTradeData = (props) => {
  for (const i in props.data) {
    if (props.data[i].register_date) {
      props.data[i].r_date = props.data[i].register_date.slice(0, 10);
    }
    if (props.data[i].visit_date) {
      props.data[i].v_date = props.data[i].visit_date.slice(0, 10);
    }
    if (props.data[i].complete_date) {
      props.data[i].c_date = props.data[i].complete_date.slice(0, 10);
    }
  }
  return (
    <ExcelFile element={<button>Download Data</button>}>
      <ExcelSheet data={props.data} name="Employees">
        <ExcelColumn label="등록일" value="r_date" />
        <ExcelColumn label="구분1" value="category_name1" />
        <ExcelColumn label="AS(납품)상태" value="category_name2" />
        <ExcelColumn label="출장/내방" value="category_name3" />
        <ExcelColumn label="거래내역/접수내용" value="content" />
        <ExcelColumn label="고장증상" value="symptom" />
        <ExcelColumn label="완료내역" value="completed_content" />
        <ExcelColumn label="메모" value="memo" />
        <ExcelColumn label="방문일" value="v_date" />
        <ExcelColumn label="완료일" value="c_date" />
        <ExcelColumn label="담당자" value="engineer_name" />
        <ExcelColumn label="거래금액" value="transaction" />
        <ExcelColumn label="수금금액" value="collect" />
        <ExcelColumn label="지불금액" value="payment" />
        <ExcelColumn label="총미수금" value="total_receivable" />
        <ExcelColumn label="당일미수금" value="receivable" />
        <ExcelColumn label="결제금액" value="payment_2" />
        <ExcelColumn label="공급가액" value="supply_price" />
        <ExcelColumn label="부가세" value="tax_price" />
        <ExcelColumn label="현금결제" value="cash" />
        <ExcelColumn label="카드결제" value="card" />
        <ExcelColumn label="은행입금" value="bank" />
      </ExcelSheet>
    </ExcelFile>
  );
};

export default exportTradeData;
