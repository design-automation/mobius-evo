import React, { useContext, useEffect, useState } from "react";
import "./HeaderComponent.css";
import { Link } from "react-router-dom";
import { Auth, nav } from "aws-amplify";
import { AuthContext } from "../Contexts";
import { SettingOutlined } from "@ant-design/icons";
import { Button, Space, Modal, List, Typography, Switch } from "antd";
import { getSettingsFile, writeSettingsFile} from "../amplify-apis/userFiles";
import packageJson from "../../package.json";

const INIT_SETTINGS = {
    hideSignUp: false,
};
function HeaderComponent() {
    const cognitoPayload = useContext(AuthContext).cognitoPayload;

    function SettingsDropdown() {
        const [settings, setSettings] = useState(null);
        const [hideSignUp, setHideSignUp] = useState(false);
        const [isModalVisible, setIsModalVisible] = useState(false);

        useEffect(() => {
            let isMounted = true;
            if (settings) { return () => {
                isMounted = false;
            };}
            let settingFile;
            getSettingsFile(
                (response) => (settingFile = response),
                () => (settingFile = null)
            ).then(() => {
                if (!isMounted) return;
                if (settingFile) {
                    try {
                        const parsedSettings = JSON.parse(settingFile);
                        setSettings(parsedSettings);
                        setHideSignUp(parsedSettings.hideSignUp)
                    } catch (ex) {}
                } else {
                    setSettings(INIT_SETTINGS);
                    setHideSignUp(INIT_SETTINGS.hideSignUp)
                }
            });
            return () => {
                isMounted = false;
            };
        });

        function showSettingsModal() {
            setIsModalVisible(true);
        }
        function applySettingsUpdate() {
            setIsModalVisible(false);
            settings.hideSignUp = hideSignUp;
            setSettings(settings);
            writeSettingsFile(JSON.stringify(settings), ()=>console.log('ok'), ()=>console.log('error'))
        }
        function cancelSettingsUpdate() {
            setIsModalVisible(false);
            setHideSignUp(settings.hideSignUp);
        }
        function changeSetting(settingName, value = null) {
            switch (settingName) {
                case "hideSignUp":
                    setHideSignUp(value);
                    break;
            }
        }

        const data = [["Hide Signup", "hideSignUp"]];

        return (
            <>
                <Button id="explorations-btn" onClick={showSettingsModal}>
                    <SettingOutlined />
                </Button>
                <Modal title="Basic Modal" visible={isModalVisible} onOk={applySettingsUpdate} onCancel={cancelSettingsUpdate}>
                    <List.Item>
                        <Space>
                            <Typography.Text>Hide Signup</Typography.Text> 
                            <Switch checked={hideSignUp} onClick={(val) => changeSetting("hideSignUp", val)} />
                        </Space>
                    </List.Item>
                </Modal>
            </>
        );
    }

    function NavButtons() {
        const menu = (
            <Button id="explorations-btn" type="link" className="nav-button nav-menu">
                <Link to="/searches">Search Spaces</Link>
            </Button>
        );
        const guestMenu = (
            <Button id="explorations-btn" type="link" className="nav-button nav-menu">
                <Link to="/view-searches">All Searches</Link>
            </Button>
        );

        return (
            <nav>
                <h1 id="mobius-evo" className="nav-button">
                    <Link to="/">Mobius Evolver (v {packageJson.version})</Link>
                </h1>
                {cognitoPayload && menu}
                {guestMenu}
            </nav>
        );
    }

    function AccButton() {
        return (
            cognitoPayload && (
                <Space>
                    <Button id="user-btn" type="link" className="nav-button">
                        <Link to="/user">Hi, {cognitoPayload.nickname}</Link>
                    </Button>
                    <SettingsDropdown></SettingsDropdown>
                    <Button id="signout" onClick={() => Auth.signOut().then(() => window.location.reload(false))}>
                        Sign Out
                    </Button>
                </Space>
            )
        );
    }
    return (
        <header>
            <NavButtons />
            <AccButton />
        </header>
    );
}

export default HeaderComponent;
