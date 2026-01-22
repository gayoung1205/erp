import React from 'react';
import $ from 'jquery';

window.jQuery = $;
window.$ = $;
global.jQuery = $;

const DashboardDefault = React.lazy(() => import('./Demo/Dashboard/Default'));

const UIBasicButton = React.lazy(() => import('./Demo/UIElements/Basic/Button'));
const UIBasicBadges = React.lazy(() => import('./Demo/UIElements/Basic/Badges'));
const UIBasicBreadcrumbPagination = React.lazy(() => import('./Demo/UIElements/Basic/BreadcrumbPagination'));

const UIBasicCollapse = React.lazy(() => import('./Demo/UIElements/Basic/Collapse'));
const UIBasicTabsPills = React.lazy(() => import('./Demo/UIElements/Basic/TabsPills'));
const UIBasicBasicTypography = React.lazy(() => import('./Demo/UIElements/Basic/Typography'));

const FormsElements = React.lazy(() => import('./Demo/Forms/FormsElements'));

const BootstrapTable = React.lazy(() => import('./Demo/Tables/BootstrapTable'));

const Nvd3Chart = React.lazy(() => import('./Demo/Charts/Nvd3Chart/index'));

const GoogleMap = React.lazy(() => import('./Demo/Maps/GoogleMap/index'));

const OtherSamplePage = React.lazy(() => import('./Demo/Other/SamplePage'));
const OtherDocs = React.lazy(() => import('./Demo/Other/Docs'));

// 추가 routes
const CustomerTable = React.lazy(() => import('./Pages/Customer/customerTable.js'));
const CustomerRegistration = React.lazy(() => import('./Pages/Customer/registration.js'));

const ProductTable = React.lazy(() => import('./Pages/Product/productTable.js'));
const ProductRegistration = React.lazy(() => import('./Pages/Product/registration.js'));

const PendingStockTable = React.lazy(() => import('./Pages/PendingStock/pendingStockTable.js'));

const TradeTable = React.lazy(() => import('./Pages/Trade/tradeTable.js'));
const AccountingTable = React.lazy(() => import('./Pages/Trade/accountingTable.js'));
const ReceivableTable = React.lazy(() => import('./Pages/Trade/receivableTable.js'));
const CurrentSituationTable = React.lazy(() => import('./Pages/Trade/currentSituationTable.js'));

const AsRegistration = React.lazy(() => import('./Pages/Trade/As/asRegistration.js'));
const AsUpdate = React.lazy(() => import('./Pages/Trade/As/asUpdate.js'));

const DeliveryRegistration = React.lazy(() => import('./Pages/Trade/Delivery/deliveryRegistration.js'));
const DeliveryUpdate = React.lazy(() => import('./Pages/Trade/Delivery/deliveryUpdate.js'));

const CollectionPaymentRegistration = React.lazy(() => import('./Pages/Trade/CollectionPayment/collectionPaymentRegistration.js'));

const BuySaleRegistration = React.lazy(() => import('./Pages/Trade/BuySale/buySaleRegistration.js'));
const BuySaleUpdate = React.lazy(() => import('./Pages/Trade/BuySale/buySaleUpdate.js'));

const MemoRegistration = React.lazy(() => import('./Pages/Trade/Memo/memoRegistration.js'));

const IncomeOutcomeRegistration = React.lazy(() => import('./Pages/Trade/IncomeOutcome/incomeOutcomeRegistration.js'));

const DocumentTable = React.lazy(() => import('./Pages/Document/documentTable.js'));
const DocumentStorage = React.lazy(() => import('./Pages/Document/documentStorage.js'));

const TechSupportTable = React.lazy(() => import('./Pages/TechSupport/techSupportTable.js'));
const TechSupportCreate = React.lazy(() => import('./Pages/TechSupport/techSupportCreate.js'));
const TechSupportUpdate = React.lazy(() => import('./Pages/TechSupport/techSupportUpdate.js'));
const TechSupportView = React.lazy(() => import('./Pages/TechSupport/techSupportView.js'));

const EmployeeList = React.lazy(() => import('./Pages/Employee/employeeList.js'));
const EmployeeCreate = React.lazy(() => import('./Pages/Employee/employeeCreate.js'));
const EmployeeUpdate = React.lazy(() => import('./Pages/Employee/employeeUpdate.js'));

const ReleaseTable = React.lazy(() => import('./Pages/Release/releaseTable.js'));

const CalendarMain = React.lazy(() => import('./Pages/Calendar/calendarMain.js'));

const AttendanceMain = React.lazy(() => import('./Pages/Attendance/attendanceMain.js'));

const ToDoTable = React.lazy(() => import('./Pages/ToDo/toDoTable.js'));

const ReleaseLogPermission = React.lazy(() => import('./Pages/Release/releaseLogPermission.js'));

const ReleaseLogTable = React.lazy(() => import('./Pages/Release/releaseLogTable.js'));

const PackageList = React.lazy(() => import('./Pages/Package/packageList.js'));
const PackageCreate = React.lazy(() => import('./Pages/Package/packageCreate.js'));
const PackageUpdate = React.lazy(() => import('./Pages/Package/packageUpdate.js'));

const routes = [
  { path: '/dashboard/default', exact: true, name: 'Default', component: DashboardDefault },
  { path: '/basic/button', exact: true, name: 'Basic Button', component: UIBasicButton },
  { path: '/basic/badges', exact: true, name: 'Basic Badges', component: UIBasicBadges },
  {
    path: '/basic/breadcrumb-paging',
    exact: true,
    name: 'Basic Breadcrumb Pagination',
    component: UIBasicBreadcrumbPagination,
  },
  { path: '/basic/collapse', exact: true, name: 'Basic Collapse', component: UIBasicCollapse },
  { path: '/basic/tabs-pills', exact: true, name: 'Basic Tabs & Pills', component: UIBasicTabsPills },
  { path: '/basic/typography', exact: true, name: 'Basic Typography', component: UIBasicBasicTypography },
  { path: '/forms/form-basic', exact: true, name: 'Forms Elements', component: FormsElements },
  { path: '/tables/bootstrap', exact: true, name: 'Bootstrap Table', component: BootstrapTable },
  { path: '/charts/nvd3', exact: true, name: 'Nvd3 Chart', component: Nvd3Chart },
  { path: '/maps/google-map', exact: true, name: 'Google Map', component: GoogleMap },
  { path: '/sample-page', exact: true, name: 'Sample Page', component: OtherSamplePage },
  { path: '/docs', exact: true, name: 'Documentation', component: OtherDocs },

  // 추가 path
  { path: '/Customer/registration', exact: true, name: 'Customer Registration', component: CustomerRegistration },
  { path: '/Customer/customerTable/:page', exact: true, name: 'Customer Table', component: CustomerTable },

  { path: '/Product/registration', exact: true, name: 'Product Registration', component: ProductRegistration },
  { path: '/Product/productTable/:page', exact: true, name: 'Product Table', component: ProductTable },

  { path: '/Product/pendingStockTable', exact: true, name: 'PendingStock Table', component: PendingStockTable },

  { path: '/Trade/tradeTable/:page', exact: true, name: 'Trade Table', component: TradeTable },
  { path: '/Trade/accountingTable/:page', exact: true, name: 'Accounting Table', component: AccountingTable },
  { path: '/Trade/receivableTable/:type', exact: true, name: 'Receivable Table', component: ReceivableTable },
  {
    path: '/Trade/currentSituationTable/:type/:page',
    exact: true,
    name: 'CurrentSituation Table',
    component: CurrentSituationTable,
  },

  { path: '/Trade/As/asRegistration', exact: true, name: 'AS Registration', component: AsRegistration },
  { path: '/Trade/As/asUpdate/:trade_id', exact: true, name: 'AS Update', component: AsUpdate },

  {
    path: '/Trade/Delivery/deliveryRegistration',
    exact: true,
    name: 'Delivery Registration',
    component: DeliveryRegistration,
  },
  { path: '/Trade/Delivery/deliveryUpdate/:trade_id', exact: true, name: 'Delivery Update', component: DeliveryUpdate },

  {
    path: '/Trade/CollectionPayment/collectionPaymentRegistration/:type',
    exact: true,
    name: 'CollectionPayment Registration',
    component: CollectionPaymentRegistration,
  },

  {
    path: '/Trade/BuySale/buySaleRegistration/:type',
    exact: true,
    name: 'BuySale Registration',
    component: BuySaleRegistration,
  },
  { path: '/Trade/BuySale/buySaleUpdate/:trade_id', exact: true, name: 'BuySale Update', component: BuySaleUpdate },

  { path: '/Trade/Memo/memoRegistration', exact: true, name: 'Memo Registration', component: MemoRegistration },

  {
    path: '/Trade/IncomeOutcome/incomeOutcomeRegistration/:type',
    exact: true,
    name: 'IncomeOutcome Registration',
    component: IncomeOutcomeRegistration,
  },

  { path: '/Document/documentTable', exact: true, name: 'Document Table', component: DocumentTable },
  { path: '/Document/documentStorage/:page', exact: true, name: 'Document Storage', component: DocumentStorage },

  { path: '/TechSupport/techSupportTable', exact: true, name: 'TechSupport Table', component: TechSupportTable },
  { path: '/TechSupport/techSupportCreate', exact: true, name: 'TechSupport Create', component: TechSupportCreate },
  {
    path: '/TechSupport/techSupportUpdate/:techSupport_id',
    exact: true,
    name: 'TechSupport Update',
    component: TechSupportUpdate,
  },
  {
    path: '/TechSupport/techSupportView/:techSupport_id',
    exact: true,
    name: 'TechSupport View',
    component: TechSupportView,
  },

  { path: '/Employee/employeeList', exact: true, name: 'Employee List', component: EmployeeList },
  { path: '/Employee/employeeCreate', exact: true, name: 'Employee Create', component: EmployeeCreate },
  { path: '/Employee/employeeUpdate/:employee_id', exact: true, name: 'Employee Update', component: EmployeeUpdate },

  { path: '/Release/releaseTable', exact: true, name: 'Release Table', component: ReleaseTable },

  { path: '/Release/releaseLogPermission', exact: true, name: 'Release Log Permission', component: ReleaseLogPermission },

  { path: '/Release/releaseLogTable', exact: true, name: 'Release Log Table', component: ReleaseLogTable },

  { path: '/Calendar/calendarMain', exact: true, name: 'CalendarMain', component: CalendarMain },

  { path: '/Attendance/attendanceMain', exact: true, name: 'AttendanceMain', component: AttendanceMain },

  { path: '/Todo/toDoTable', exact: true, name: 'ToDo Table', component: ToDoTable },

  { path: '/Package/packageList', exact: true, name: 'Package List', component: PackageList },
  { path: '/Package/packageCreate', exact: true, name: 'Package Create', component: PackageCreate },
  { path: '/Package/packageUpdate/:package_id', exact: true, name: 'Package Update', component: PackageUpdate },
];

export default routes;
