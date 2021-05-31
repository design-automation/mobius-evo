import React, { useState, useContext, useEffect } from "react";
import { Button, Modal, Tooltip } from "antd";
import { QuestionOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import helpJSON from "../../../assets/help/help_text_json";
import * as showdown from "showdown";
import "./Help.css";

const mdConverter = new showdown.Converter({ literalMidWordUnderscores: true });

function Help({ page, part }) {
    const [isModalVisible, setIsModalVisible] = useState(false);

    let hoverText = "";
    let popupTitle = "";
    let popupText = "";
    try {
        hoverText = helpJSON.hover[page][part];
        popupTitle = helpJSON.popup[page][part].title;
        popupText = mdConverter.makeHtml(helpJSON.popup[page][part].text).replace(/\\n/g, "<br/>");
    } catch (ex) {
        return <></>;
    }

    const showModal = (event) => {
        setIsModalVisible(true);
        event.stopPropagation();
    };

    const closeModal = (event) => {
        setIsModalVisible(false);
        event.stopPropagation();
    };

    return (
        <>
            <Tooltip placement="topLeft" title={hoverText}>
                <Button type="text" shape="circle" icon={<QuestionCircleOutlined />} size="small" onClick={showModal}></Button>
            </Tooltip>
            <Modal title={"Help: " + popupTitle} visible={isModalVisible} footer={null} onOk={closeModal} onCancel={closeModal} width={1000}>
                <div dangerouslySetInnerHTML={{ __html: popupText }}></div>
            </Modal>
        </>
    );
}
export default Help;
