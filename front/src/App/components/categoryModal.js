import React, { useState, useEffect, useCallback } from 'react';
import { Button as RButton } from 'react-bootstrap';
import { Modal, List, Button, Input, message } from 'antd';
import { CloseOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import requestCategoryGet from '../../Axios/Category/requestCategoryGet';
import requestCategoryDelete from '../../Axios/Category/requestCategoryDelete';
import requestCategoryUpdate from '../../Axios/Category/requestCategoryUpdate';
import requestCategoryCreate from '../../Axios/Category/requestCategoryCreate';

const CategoryModal = (prop) => {
  const [state, setState] = useState({ visible: false }); // Modal Visible, true->보임, false->안보임
  const [text, setText] = useState(''); // Category Update Input Value
  const [name, setName] = useState(''); // Category Create Input Value
  const [category, setCategory] = useState(prop.data); // Customer Category, Product Category 구분값
  const [data, setData] = useState([]); // Category Data

  // Show Modal, Visible false->true
  const showModal = () => {
    setState({ visible: true });
  };

  // Cancel Button Click 시 Visible true->false
  const handleCancel = (e) => {
    setState({
      visible: false,
    });
    // window.location.reload();
  };

  const categoryGet = useCallback(() => {
    requestCategoryGet(category).then((res) => {
      for (const i in res) {
        res[i].type = 0;
      }
      setData(res);
    });
  }, [category]);

  // requestCategoryGet()이 처음에만 실행되도록
  useEffect(() => {
    categoryGet();
  }, [categoryGet]);

  // Category Delete
  const categoryDelete = (id) => {
    requestCategoryDelete(id).then(() => categoryGet());
  };

  // Category Create
  const categoryCreate = () => {
    // InputText에 입력값이 없을 경우
    if (name === '') {
      message.warning('분류명을 입력해주세요.');
      return null;
    }

    // 입력값이 중복될 경우
    for (const i in data) {
      if (data[i].name === name) {
        message.warning('중복되는 분류입니다.');
        return null;
      }
    }

    requestCategoryCreate({ name: name, category: category }).then(() => {
      setName('');

      setCategory(prop.data);
      categoryGet();
    });
  };

  // Category Update
  const categoryUpdate = (id) => {
    // InputText에 입력값이 없을 경우
    if (text === '') {
      message.warning('수정할 분류명를 입력해주세요.');
      return null;
    }

    // 입력값이 중복될 경우
    for (const i in data) {
      if (data[i].name === text) {
        message.warning('중복되는 분류입니다.');
        return null;
      }
    }

    requestCategoryUpdate(id, text).then((res) => {
      // Name 초기화
      setName('');

      // Text 초기화
      setText('');

      categoryGet();
    });
  };

  // Update Button Click 시에 CategoryList CategoryName가 수정이 가능하도록 Text->Input TextBox
  const CategoryList = (item) => {
    return item.type ? (
      <Input
        type="text"
        onChange={(e) => {
          setText(e.target.value);
        }}
        style={{ width: '50%' }}
      />
    ) : (
      item.name
    );
  };

  // Update Button Click 시에 구분값 type 변경 0->1, Text->Input TextBox, 0=text, 1=input
  const changeType = (index) => {
    let dummy = data.slice();
    dummy[index].type = 1;

    setData(dummy);
  };

  return (
    <>
      <RButton variant="primary" onClick={showModal}>
        편집
      </RButton>
      <Modal
        title="분류 편집"
        okText="분류추가"
        visible={state.visible}
        onOk={() => categoryCreate()}
        onCancel={() => handleCancel()}
        zIndex={1030}
      >
        <List
          bordered
          dataSource={data}
          renderItem={(item, index) => (
            <List.Item key={'list_' + index}>
              {CategoryList(item)}
              <div style={{ float: 'right', marginTop: '-8px' }}>
                <Button
                  disabled={!item.type}
                  type="primary"
                  icon={<CheckOutlined />}
                  size="middle"
                  style={{ background: '#fff', borderColor: '#fff', color: 'black' }}
                  onClick={(e) => categoryUpdate(item.id)}
                />
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  size="middle"
                  style={{ background: '#fff', borderColor: '#fff', color: 'black' }}
                  onClick={(e) => changeType(index)}
                />
                <Button
                  type="primary"
                  icon={<CloseOutlined />}
                  size="middle"
                  style={{ background: '#fff', borderColor: '#fff', color: 'red' }}
                  onClick={(e) => categoryDelete(item.id)}
                />
              </div>
            </List.Item>
          )}
        />
        <Input
          placeholder="새로운 분류 생성"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </Modal>
    </>
  );
};

export default CategoryModal;
