import React from 'react';

import Aux from '../../../../../../../../hoc/_Aux';
import DEMO from '../../../../../../../../store/constant';

const friend = (props) => {
  let timeClass = ['d-block'];
  if (props.data.status) {
    timeClass = [...timeClass, 'text-c-green'];
  } else {
    timeClass = [...timeClass, 'text-muted'];
  }

  let time = '';
  if (props.data.time) {
    time = <small className={timeClass.join(' ')}>{props.data.time}</small>;
  }

  let newFriend = '';
  if (props.data.new) {
    newFriend = <div className="live-status">{props.data.new}</div>;
  }

  return (
    <Aux>
      <div
        className={props.activeId === props.data.id ? 'media userlist-box ripple active' : 'media userlist-box ripple'}
        onClick={props.clicked}
      >
        <a className="media-left" href={DEMO.BLANK_LINK}>
          {' '}
          {newFriend}
        </a>
        <div className="media-body">
          <h6 className="chat-header">
            {props.data.name}
            {time}
          </h6>
        </div>
      </div>
    </Aux>
  );
};

export default friend;
