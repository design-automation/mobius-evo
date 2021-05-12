import React, { useContext } from 'react';
import './HeaderComponent.css';
import { Link } from 'react-router-dom';
import { Auth, nav } from 'aws-amplify';
import { AuthContext } from '../Contexts';
import { LineChartOutlined  } from '@ant-design/icons';
import { Button, Space } from 'antd';

function HeaderComponent() {
  const cognitoPayload = useContext(AuthContext).cognitoPayload;

  function NavButtons() {
    const menu = (
      <Button
        id="explorations-btn"
        type="link"
        className="nav-button"
      >
        <Link to="/jobs">
          <Space>
            <LineChartOutlined/>
            Jobs
          </Space>
        </Link>
      </Button>
    );

    return (
      <nav>
        <h1 
          id="mobius-evo"
          className="nav-button"
          >
          <Link 
            to = "/" 
          >Mobius-evo</Link>
        </h1>
        {cognitoPayload && menu}
      </nav>
    );
  };

  function AccButton() {
    return (cognitoPayload && 
      <div className="user-menu">
        <Button 
          id="user-btn"
          type="link"
          className="nav-button"
        >
          <Link to="/user">Hi, {cognitoPayload.nickname}</Link>
        </Button>  
        <Button
          id="signout"
          onClick={() => Auth.signOut().then(()=> window.location.reload(false))}
        >
          Sign Out
        </Button>
      </div>
    );
  };

  return (
    <header>
      <NavButtons/>
      <AccButton/>
    </header>
  )
}

export default HeaderComponent;