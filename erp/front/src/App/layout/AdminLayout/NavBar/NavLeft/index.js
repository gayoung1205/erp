import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
// import { Dropdown, Form } from 'react-bootstrap';
import windowSize from 'react-window-size';

// import NavSearch from './NavSearch';
import Aux from '../../../../../hoc/_Aux';
import DEMO from '../../../../../store/constant';
import * as actionTypes from '../../../../../store/actions';

// Tag
import { Tag, Input, Tooltip, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
// Tag

// Select
import { Select } from 'antd';
// Select

// Modal
import SearchCustomerTableModal from '../../../../../Pages/Search/searchCustomerTableModal';
import SearchProductTableModal from '../../../../../Pages/Search/searchProductTableModal';
import SearchTradeTableModal from '../../../../../Pages/Search/searchTradeTableModal';
// Modal

// Mediaquery
import MediaQuery from 'react-responsive';
// Mediaquery

import requestCustomerGet from '../../../../../Axios/Customer/requestCustomerGet';
import requestCategoryGet from '../../../../../Axios/Category/requestCategoryGet'; // ✅ 추가: 카테고리 API

const { Option } = Select;
const tableData = ['고객', '제품', 'AS 및 거래']; // 검색 대분류 드랍다운 리스트
const columnData = {
  고객: [
    '통합검색',
    '고객(거래처)명',
    'Tel',
    'Phone',
    '주소',
    'Fax',
    'Email',
    '등록일',
    '고객분류',
    '가격분류',
    '메모',
    '등록자ID',
  ],
  제품: ['통합검색', '제품명', '제품분류', '제조사', '보관장소', '주매입처', '코드', '메모', '등록자ID'],
  'AS 및 거래': [
    '통합검색',
    '거래내역',
    '제품내역',
    '고객(거래처)명',
    '등록일',
    '구분',
    'AS(납품)상태',
    '출장/내방',
    '고장증상',
    '완료내역',
    '메모',
    '방문일',
    '완료일',
    '담당자',
    '등록자ID',
  ],
}; // 검색 중분류 드랍다운 리스트
// Select

// ✅ 통일된 스타일 상수 추가
const selectStyle = {
  minWidth: '90px',
  height: '32px',
};

class NavLeft extends PureComponent {
  // Tag
  state = {
    tags: [], // 검색 태그 리스트
    inputVisible: false, // 태그 입력 박스 Visible
    inputValue: '', // 태그 입력 박스 값
    tables: tableData[0], // 검색 대분류 값
    columns: columnData[tableData[0]], // 검색 중분류 리스트 값
    selectColumns: [columnData[tableData[0]][0]], // 검색 중분류 리스트 선택 값
    customerVisible: false, // 고객검색 Modal Visible
    productVisible: false, // 제품검색 Modal Visible
    tradeVisible: false, // AS 및 목록검색 Modal Visible
    // ✅ 추가: 제품분류 관련 state
    productCategories: [], // 제품분류 카테고리 목록
    selectedProductCategory: '전체', // 선택된 제품분류
  };

  // ✅ 추가: 컴포넌트 마운트 시 제품분류 카테고리 로드
  componentDidMount() {
    this.loadProductCategories();
  }

  // ✅ 추가: 제품분류 카테고리 로드 함수
  loadProductCategories = () => {
    requestCategoryGet(1).then((res) => {
      // category=1은 제품분류
      if (res) {
        this.setState({ productCategories: res });
      }
    });
  };

  // ✅ 추가: 제품분류 선택 변경 핸들러
  handleProductCategoryChange = (val) => {
    this.setState({ selectedProductCategory: val });
  };

  // Tag 삭제
  handleClose = (removedTag) => {
    const tags = this.state.tags.filter((tag) => tag !== removedTag);
    this.setState({ tags });
  };

  // Tag 생성 클릭 시에 입력 박스 생성
  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  // 입력 박스 값 저장
  handleInputChange = (e) => {
    this.setState({ inputValue: e.target.value });
  };

  // 태그 생성
  handleInputConfirm = () => {
    const { inputValue } = this.state;
    let { tags } = this.state;
    let column;

    if (typeof this.state.selectColumns === 'string') {
      column = this.state.selectColumns;
      if (inputValue && tags.indexOf(column + ':' + inputValue) === -1) {
        tags = [...tags, column + ':' + inputValue];
      }
    } else {
      for (const i in this.state.selectColumns) {
        column = this.state.selectColumns[i];
        if (inputValue && tags.indexOf(column + ':' + inputValue) === -1) {
          tags = [...tags, column + ':' + inputValue];
        }
      }
    }

    this.setState({
      tags,
      inputVisible: false,
      inputValue: '',
    });
  };

  handleInputEnter = async () => {
    await this.handleInputConfirm();
    this.searchOnHandler();
  };

  saveInputRef = (input) => {
    this.input = input;
  };
  // Tag

  // Select
  // 대분류 Select 변경
  handleProvinceChange = (val) => {
    if (val === 'AS 및 거래') {
      let cmId = window.sessionStorage.getItem('customerId');

      if (cmId !== undefined && cmId !== null && isNaN(cmId) !== true) {
        requestCustomerGet(cmId).then((res) => {
          this.setState({
            tags: [`고객(거래처)명:${res[0].name}`],
            tables: val,
            columns: columnData[val],
            selectColumns: columnData[val][0],
            selectedProductCategory: '전체', // ✅ 추가: 제품분류 초기화
          });
        });
      } else {
        this.setState({
          tags: [],
          tables: val,
          columns: columnData[val],
          selectColumns: columnData[val][0],
          selectedProductCategory: '전체', // ✅ 추가: 제품분류 초기화
        });
      }
    } else {
      this.setState({
        tags: [],
        tables: val,
        columns: columnData[val],
        selectColumns: columnData[val][0],
        selectedProductCategory: '전체', // ✅ 추가: 제품분류 초기화
      });
    }
  };

  // 중분류 Select 선택
  onSelectColumnChange = (val) => {
    this.setState({
      selectColumns: val,
    });
  };

  // 중분류 Select 선택 모바일
  onSelectColumnChangeMobile = (value) => {
    if (this.state.selectColumns.length < 2) {
      this.onSelectColumnChange(value);
    } else {
      switch (this.state.tables) {
        case '제품':
          this.setState({
            selectColumns: [columnData[tableData[1]][0]],
          });
          break;
        case 'AS 및 거래':
          this.setState({
            selectColumns: [columnData[tableData[2]][0]],
          });
          break;
        default:
          this.setState({
            selectColumns: [columnData[tableData[0]][0]],
          });
          break;
      }
      message.warning('모바일 최대 검색 태그는 2개입니다.');
    }
  };
  // Select

  // 검색 함수
  searchOnHandler = () => {
    // tag가 비어 있을 경우 경고
    if (this.state.tags.length === 0) {
      message.warning('검색 태그가 비어있습니다.');
      return null;
    }

    // table 값에 따른 모달 Visible 선택
    switch (this.state.tables) {
      case '제품':
        this.setState({
          productVisible: !this.state.productVisible,
        });
        break;
      case 'AS 및 거래':
        this.setState({
          tradeVisible: !this.state.tradeVisible,
        });
        break;
      default:
        this.setState({
          customerVisible: !this.state.customerVisible,
        });
        break;
    }
  };

  render() {
    // Tag
    const { tags, inputVisible, inputValue } = this.state;
    // Tag

    // Select
    const { columns } = this.state;
    // Select

    let iconFullScreen = ['feather'];
    iconFullScreen = this.props.isFullScreen
        ? [...iconFullScreen, 'icon-minimize']
        : [...iconFullScreen, 'icon-maximize'];

    let navItemClass = ['nav-item'];
    // if (this.props.windowWidth <= 575) {
    //   navItemClass = [...navItemClass, 'd-none'];
    // }
    // let dropdownRightAlign = false;
    // if (this.props.rtlLayout) {
    //   dropdownRightAlign = true;
    // }

    let searchClass = ['main-search'];
    if (this.state.isOpen) {
      searchClass = [...searchClass, 'open'];
    }

    return (
        <Aux>
          <ul className="navbar-nav mr-auto">
            <li>
              <a href={DEMO.BLANK_LINK} className="full-screen" onClick={this.props.onFullScreen}>
                <i className={iconFullScreen.join(' ')} />
              </a>
            </li>
            <li className={navItemClass.join(' ')} style={{ lineHeight: '40px' }}>
              {/* ✅ 수정: 대분류 Select - 크기 통일 */}
              <Select
                  defaultValue={tableData[0]}
                  style={selectStyle}
                  onChange={this.handleProvinceChange}
              >
                {tableData.map((province) => (
                    <Option key={province}>{province}</Option>
                ))}
              </Select>

              {/* ✅ 추가: 제품분류 드롭다운 (제품 선택 시에만 표시) */}
              {this.state.tables === '제품' && (
                  <>
                    <MediaQuery maxDeviceWidth={480}>
                      <Select
                          value={this.state.selectedProductCategory}
                          style={{ ...selectStyle, minWidth: '70px', marginLeft: '4px' }}
                          onChange={this.handleProductCategoryChange}
                      >
                        <Option key="전체" value="전체">전체</Option>
                        {this.state.productCategories.map((cat) => (
                            <Option key={cat.name} value={cat.name}>
                              {cat.name.length > 4 ? cat.name.slice(0, 4) + '..' : cat.name}
                            </Option>
                        ))}
                      </Select>
                    </MediaQuery>
                    <MediaQuery minDeviceWidth={480}>
                      <Select
                          value={this.state.selectedProductCategory}
                          style={{ ...selectStyle, marginLeft: '4px' }}
                          onChange={this.handleProductCategoryChange}
                      >
                        <Option key="전체" value="전체">전체</Option>
                        {this.state.productCategories.map((cat) => (
                            <Option key={cat.name} value={cat.name}>{cat.name}</Option>
                        ))}
                      </Select>
                    </MediaQuery>
                  </>
              )}

              {/* ✅ 수정: 중분류 Select - 크기 통일 */}
              <MediaQuery maxDeviceWidth={480}>
                <Select
                    mode="tags"
                    style={{ ...selectStyle, minWidth: '80px', marginLeft: '4px' }}
                    value={this.state.selectColumns}
                    onChange={this.onSelectColumnChangeMobile}
                    maxTagTextLength={4}
                >
                  {columns.map((city) => (
                      <Option key={city}>{city}</Option>
                  ))}
                </Select>
              </MediaQuery>
              <MediaQuery minDeviceWidth={480}>
                <Select
                    mode="tags"
                    style={{ ...selectStyle, minWidth: '100px', marginLeft: '4px' }}
                    value={this.state.selectColumns}
                    onChange={this.onSelectColumnChange}
                    maxTagTextLength={6}
                >
                  {columns.map((city) => (
                      <Option key={city}>{city}</Option>
                  ))}
                </Select>
              </MediaQuery>
            </li>
            <li className="nav-item" style={{ display: 'inline-block', lineHeight: '40px' }}>
              <div className="input-group">
                {/* Tag */}
                <>
                  {tags.map((tag, index) => {
                    const isLongTag = tag.length > 10;

                    const tagElem = (
                        <Tag
                            className="edit-tag"
                            key={tag}
                            closable={true}
                            onClose={() => this.handleClose(tag)}
                            style={{ marginBottom: '5px', height: '24px', lineHeight: '22px' }}
                        >
                          <span>{isLongTag ? `${tag.slice(0, 10)}...` : tag}</span>
                        </Tag>
                    );
                    return isLongTag ? (
                        <Tooltip title={tag} key={tag}>
                          {tagElem}
                        </Tooltip>
                    ) : (
                        tagElem
                    );
                  })}
                  {inputVisible && (
                      <Input
                          ref={this.saveInputRef}
                          type="text"
                          size="small"
                          className="tag-input"
                          value={inputValue}
                          onChange={this.handleInputChange}
                          onBlur={this.handleInputConfirm}
                          onPressEnter={this.handleInputEnter}
                          style={{ width: '100px', height: '32px' }}
                      />
                  )}
                  {!inputVisible && (
                      <Tag
                          className="site-tag-plus"
                          onClick={this.showInput}
                          style={{ marginBottom: '5px', height: '24px', lineHeight: '22px', cursor: 'pointer' }}
                      >
                        <PlusOutlined /> 새 검색어
                      </Tag>
                  )}
                </>
                {/* Tag */}

                {/* ✅ 수정: 검색 버튼 크기 통일 */}
                {!inputVisible && (
                    <div
                        id="main-search"
                        className={searchClass.join(' ')}
                        style={{ display: 'inline-block', padding: '0', marginLeft: '4px' }}
                    >
                      <div className="input-group">
                    <span
                        className="input-group-append search-btn btn btn-primary"
                        onClick={this.searchOnHandler}
                        style={{ height: '32px', lineHeight: '20px', padding: '5px 10px' }}
                    >
                      <i className="feather icon-search input-group-text" style={{ padding: '0' }} />
                    </span>
                      </div>
                    </div>
                )}
              </div>
            </li>
            <li className="nav-item"></li>
          </ul>
          <SearchCustomerTableModal
              visible={this.state.customerVisible}
              tables={this.state.tables}
              tags={this.state.tags}
          />
          {/* ✅ 수정: 제품검색 모달에 selectedProductCategory 전달 */}
          <SearchProductTableModal
              visible={this.state.productVisible}
              tables={this.state.tables}
              tags={this.state.tags}
              productCategory={this.state.selectedProductCategory}
          />
          <SearchTradeTableModal visible={this.state.tradeVisible} tables={this.state.tables} tags={this.state.tags} />
        </Aux>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isFullScreen: state.isFullScreen,
    rtlLayout: state.rtlLayout,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onFullScreen: () => dispatch({ type: actionTypes.FULL_SCREEN }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(windowSize(NavLeft));