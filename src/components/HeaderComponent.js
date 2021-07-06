import React, { useContext, useEffect, useState } from "react";
import "./HeaderComponent.css";
import { Link } from "react-router-dom";
import { Auth, API } from "aws-amplify";
import { AuthContext } from "../Contexts";
import { SettingOutlined } from "@ant-design/icons";
import { Button, Space, Modal, List, Typography, Switch, Spin } from "antd";
import { getSettingsFile} from "../amplify-apis/userFiles";
import packageJson from "../../package.json";
import { createEvoSetting, updateEvoSetting } from "../graphql/mutations";
import { getEvoSetting } from "../graphql/queries";

const INIT_SETTINGS = {
    hideSignUp: false
};
function HeaderComponent() {
    const cognitoPayload = useContext(AuthContext).cognitoPayload;

    function SettingsDropdown() {
        const [initCheck, setInitCheck] = useState(false);
        const [settings, setSettings] = useState(INIT_SETTINGS);
        const [hideSignUp, setHideSignUp] = useState(INIT_SETTINGS.hideSignUp);
        const [isModalVisible, setIsModalVisible] = useState(false);
        const [isLoading, setIsLoading] = useState(true);

        useEffect(() => {
            let isMounted = true;
            if (initCheck) { return () => {
                isMounted = false;
            };}
            API.graphql({
                query: getEvoSetting,
                variables: {
                    id: "mainSettings"
                },
                authMode: "AWS_IAM",
            })
                .then(async (queryResult) => {
                    if (!isMounted) return;
                    setInitCheck(true);
                    if (queryResult && queryResult.data && queryResult.data.getEvoSetting) {
                        try {
                            console.log(queryResult)
                            const parsedSettings = JSON.parse(queryResult.data.getEvoSetting.value);
                            console.log(parsedSettings)
                            setSettings(parsedSettings);
                            setHideSignUp(parsedSettings.hideSignUp);
                        } catch(ex) {
                            console.log(ex)
                        }
                    } else {
                        API.graphql({
                            query: createEvoSetting,
                            variables: {
                                input: {
                                    id: "mainSettings",
                                    value: JSON.stringify(INIT_SETTINGS)
                                }
                            },
                            authMode: "AWS_IAM",
                        }).then(()=>console.log('ok')).catch((error) => console.log(error));
                    }
                    setIsLoading(false);
            }).catch((error) => console.log(error));
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
            console.log(settings)
            API.graphql({
                query: updateEvoSetting,
                variables: {
                    input: {
                        id: "mainSettings",
                        value: JSON.stringify(settings)
                    }
                },
                authMode: "AWS_IAM",
            }).then(()=>console.log('ok')).catch((error) => console.log(error));
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
        return (
            <>
                <Button id="explorations-btn" onClick={showSettingsModal}>
                    <SettingOutlined />
                </Button>
                <Modal title="Basic Modal" visible={isModalVisible} onOk={applySettingsUpdate} onCancel={cancelSettingsUpdate}>
                    <Spin spinning={isLoading}>
                        {isLoading? null: (<List.Item>
                            <Space>
                                <Typography.Text>Hide Signup</Typography.Text> 
                                <Switch checked={hideSignUp} onClick={(val) => changeSetting("hideSignUp", val)} />
                            </Space>
                        </List.Item>)}
                    </Spin>
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
