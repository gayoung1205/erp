export default {
  items: [
    {
      id: 'navigation01',
      title: '고객',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'basic01',
          title: '고객관리',
          type: 'collapse',
          icon: 'feather icon-users',
          children: [
            {
              id: 'badges01',
              title: '고객목록',
              type: 'item',
              url: '/Customer/customerTable/1',
            },
            {
              id: 'badges02',
              title: '고객등록',
              type: 'item',
              url: '/Customer/registration',
            },
          ],
        },
      ],
    },
    {
      id: 'navigation02',
      title: '제품',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'basic02',
          title: '제품관리',
          type: 'collapse',
          icon: 'feather icon-box',
          children: [
            {
              id: 'badges03',
              title: '제품목록',
              type: 'item',
              url: '/Product/productTable/1',
            },
            {
              id: 'badges04',
              title: '제품등록',
              type: 'item',
              url: '/Product/registration',
            },
            {
              id: 'badges04-1',
              title: '입고대기',
              type: 'item',
              url: '/Product/pendingStockTable',
            },
            {
              id: 'badges05',
              title: '패키지관리',
              type: 'item',
              url: '/Package/packageList',
            },
          ],
        },
      ],
    },
    {
      id: 'navigation03',
      title: 'AS 및 거래',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'basic03',
          title: 'AS 및 거래관리',
          type: 'collapse',
          icon: 'feather icon-list',
          children: [
            {
              id: 'badges05',
              title: 'AS 및 거래목록',
              type: 'item',
              url: '/Trade/tradeTable/1',
            },
            {
              id: 'badges06',
              title: 'AS접수',
              type: 'item',
              url: '/Trade/As/asRegistration',
            },
            {
              id: 'badges07',
              title: '납품접수',
              type: 'item',
              url: '/Trade/Delivery/deliveryRegistration',
            },
            {
              id: 'badges08',
              title: '수금등록',
              type: 'item',
              url: '/Trade/CollectionPayment/collectionPaymentRegistration/collection',
            },
            {
              id: 'badges09',
              title: '지불등록',
              type: 'item',
              url: '/Trade/CollectionPayment/collectionPaymentRegistration/payment',
            },
            {
              id: 'badges10',
              title: '제품판매',
              type: 'item',
              url: '/Trade/BuySale/buySaleRegistration/sale',
            },
            {
              id: 'badges11',
              title: '제품구매',
              type: 'item',
              url: '/Trade/BuySale/buySaleRegistration/buy',
            },
            {
              id: 'badges12',
              title: '메모등록',
              type: 'item',
              url: '/Trade/Memo/memoRegistration',
            },
          ],
        },
      ],
    },
    {
      id: 'navigation04',
      title: '출고',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'basic04',
          title: '출고관리',
          type: 'collapse',
          icon: 'feather icon-shopping-cart',
          children: [
            {
              id: 'badges30',
              title: '출고내역',
              type: 'item',
              url: '/Release/releaseTable',
            },
            {
              id: 'badges31',
              title: '출고로그',
              type: 'item',
              url: '/Release/releaseLogTable',
            },
          ],
        },
      ],
    },
    {
      id: 'navigation05',
      title: '회계',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'basic05',
          title: '회계관리',
          type: 'collapse',
          icon: 'feather icon-list',
          children: [
            {
              id: 'badges15',
              title: '회계목록',
              type: 'item',
              url: '/Trade/accountingTable/1',
            },
            {
              id: 'badges16',
              title: '수입등록',
              type: 'item',
              url: '/Trade/IncomeOutcome/incomeOutcomeRegistration/income',
            },
            {
              id: 'badges17',
              title: '지출등록',
              type: 'item',
              url: '/Trade/IncomeOutcome/incomeOutcomeRegistration/outcome',
            },
            {
              id: 'badges18',
              title: '미수금현황',
              type: 'item',
              url: '/Trade/receivableTable/plus',
            },
            {
              id: 'badges19',
              title: '지불금현황',
              type: 'item',
              url: '/Trade/receivableTable/minus',
            },
          ],
        },
      ],
    },
    {
      id: 'navigation06',
      title: 'AS/납품현황',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'basic06',
          title: 'AS/납품현황',
          type: 'collapse',
          icon: 'feather icon-list',
          children: [
            {
              id: 'badges20',
              title: '납품현황',
              type: 'item',
              url: '/Trade/currentSituationTable/delivery/1',
            },
            {
              id: 'badges21',
              title: 'AS현황',
              type: 'item',
              url: '/Trade/currentSituationTable/as/1',
              // target: '_blank',
            },
            {
              id: 'badges22',
              title: 'MY AS',
              type: 'item',
              url: '/Trade/currentSituationTable/myas/1',
            },
          ],
        },
      ],
    },
    {
      id: 'navigation07',
      title: '일정',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'basic07',
          title: '일정관리',
          type: 'item',
          icon: 'feather icon-calendar',
          url: '/Calendar/calendarMain',
          // target: '_blank',
        },
      ],
    },
    {
      id: 'navigation08',
      title: '문서',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'basic08',
          title: '문서관리',
          type: 'collapse',
          icon: 'feather icon-list',
          children: [
            {
              id: 'badges23',
              title: '문서관리',
              type: 'item',
              url: '/Document/documentTable',
            },
            {
              id: 'badges24',
              title: '문서보관함',
              type: 'item',
              url: '/Document/documentStorage/1',
            },
          ],
        },
      ],
    },
    {
      id: 'navigation09',
      title: '근태',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'basic10',
          title: '근태관리',
          type: 'item',
          icon: 'feather icon-calendar',
          url: '/Attendance/attendanceMain',
        },
      ],
    },
    {
      id: 'navigation10',
      title: '직원',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'basic11',
          title: '직원관리',
          type: 'collapse',
          icon: 'feather icon-list',
          children: [
            {
              id: 'badges25',
              title: '직원목록',
              type: 'item',
              url: '/Employee/employeeList',
            },
            {
              id: 'badges26',
              title: '직원등록',
              type: 'item',
              url: '/Employee/employeeCreate',
            },
            {
              id: 'badges27',
              title: '권한관리',
              type: 'item',
              url: '/Release/releaseLogPermission',
            },
          ],
        },
      ],
    },
  ],
};
