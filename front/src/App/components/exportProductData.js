// // data export excel component
//
// import React from 'react';
// import ReactExport from 'react-export-excel';
//
// const ExcelFile = ReactExport.ExcelFile;
// const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
// const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
//
// const exportProductData = (props) => {
//   for (const i in props.data) {
//     if (props.data[i].created_date) {
//       props.data[i].c_date = props.data[i].created_date.slice(0, 10);
//     }
//     if (props.data[i].updated_date) {
//       props.data[i].u_date = props.data[i].updated_date.slice(0, 10);
//     }
//   }
//   return (
//     <ExcelFile element={<button>Download Data</button>}>
//       <ExcelSheet data={props.data} name="Employees">
//         <ExcelColumn label="제품명" value="name" />
//         <ExcelColumn label="분류" value="category" />
//         <ExcelColumn label="주매입처" value="purchase" />
//         <ExcelColumn label="보관장소" value="container" />
//         <ExcelColumn label="제조사" value="supplier" />
//         <ExcelColumn label="재고" value="stock" />
//         <ExcelColumn label="매입금액" value="in_price" />
//         <ExcelColumn label="매출금액" value="out_price" />
//         <ExcelColumn label="소비자금액" value="sale_price" />
//         <ExcelColumn label="생성일" value="c_date" />
//         <ExcelColumn label="수정일" value="u_date" />
//       </ExcelSheet>
//     </ExcelFile>
//   );
// };
//
// export default exportProductData;

// data export excel component

import React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const exportProductData = (props) => {
  const handleExport = () => {
    const exportData = props.data.map(item => ({
      '제품명': item.name,
      '분류': item.category,
      '주매입처': item.purchase,
      '보관장소': item.container,
      '제조사': item.supplier,
      '재고': item.stock,
      '매입금액': item.in_price,
      '매출금액': item.out_price,
      '소비자금액': item.sale_price,
      '생성일': item.created_date ? item.created_date.slice(0, 10) : '',
      '수정일': item.updated_date ? item.updated_date.slice(0, 10) : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'data.xlsx');
  };

  return (
      <button onClick={handleExport}>Download Data</button>
  );
};

export default exportProductData;