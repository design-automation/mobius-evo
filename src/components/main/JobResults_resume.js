import React, { useEffect, useState } from "react";
import { Form, Space, Button, Radio, InputNumber, Upload, message, Tag, Table, Modal, Row, Collapse, Tooltip, notification } from "antd";
import { uploadS3, listS3, getS3Url, downloadS3 } from "../../amplify-apis/userFiles";
import { UploadOutlined } from "@ant-design/icons";
import { API, graphqlOperation } from "aws-amplify";
import { createGenEvalParam, updateGenEvalParam, updateJob } from "../../graphql/mutations";
import "./JobResults_resume.css";
import Help from "./utils/Help";
import helpJSON from "../../assets/help/help_text_json";

const notify = (title, text, isWarn = false) => {
    if (isWarn) {
        notification.error({
            message: title,
            description: text,
        });
        return;
    }
    notification.open({
        message: title,
        description: text,
    });
};

function FileSelectionModal({form, isModalVisibleState, jobSettingsState, jobResultsState, replacedUrl, replaceEvalCheck }) {
    const [s3Files, setS3Files] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isTableLoading, setIsTableLoading] = useState(true);
    const { isModalVisible, setIsModalVisible } = isModalVisibleState;
    const { jobSettings, setJobSettings } = jobSettingsState;
    const { jobResults, setJobResults } = jobResultsState;
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);


    const handleOk = async () => {
        if (!replaceEvalCheck) {
            handleGenOk();
        } else {
            handleEvalOk();
        }
    };
    const handleGenOk = async () => {
        const allPromises = [];
        const formUpdate = {};
        for (const selectedRow of selectedRows) {
            const newFile = selectedRow.filename;
            if (!newFile) {
                continue;
            }
            let newUrl = "";
            await getS3Url(
                `files/gen/${newFile}`,
                (s3Url) => (newUrl = s3Url),
                () => {}
            );
            let okCheck = false;
            if (!replacedUrl) {
                if (jobSettings.genUrl.indexOf(newUrl) !== -1) {
                    notify('Unable to add gen file!', 'Search already contains Gen file to be added.')
                    continue;
                }
                jobSettings.genUrl.push(newUrl);
                okCheck = true;
            } else {
                const genIndex = jobSettings.genUrl.indexOf(replacedUrl);
                if (genIndex !== -1) {
                    jobSettings.genUrl.splice(genIndex, 1, newUrl);
                    okCheck = true;
                }
            }
            // let expiration = 86400;
            // if (jobSettings.expiration) {
            //     expiration = jobSettings.expiration;
            // }
            // const expiration_time = Math.round(Date.now() / 1000) + expiration;

            if (okCheck) {
                setJobSettings(jobSettings);
                let newID = jobResults.length;
                const newJobs = [];
                jobResults
                    .filter((result) => result.genUrl === replacedUrl && result.live === true)
                    .forEach((result) => {
                        allPromises.push(
                            API.graphql(
                                graphqlOperation(updateGenEvalParam, {
                                    input: {
                                        id: result.id,
                                        JobID: result.JobID,
                                        GenID: result.GenID,
                                        live: false,
                                        expirationTime: null,
                                    },
                                })
                            )
                                .then()
                                .catch((err) => console.log(err))
                        );
                        const newParam = {
                            id: result.JobID + "_" + newID,
                            JobID: result.JobID,
                            GenID: newID,
                            generation: result.generation,
                            genUrl: newUrl,
                            evalUrl: result.evalUrl,
                            evalResult: null,
                            live: true,
                            params: result.params,
                            score: null,
                            owner: result.owner,
                            expirationTime: null,
                            errorMessage: null,
                        };
                        allPromises.push(
                            API.graphql(
                                graphqlOperation(createGenEvalParam, {
                                    input: newParam,
                                })
                            )
                                .then()
                                .catch((err) => console.log(err))
                        );
                        result.live = false;
                        newJobs.push(newParam);
                        newID += 1;
                    });
                allPromises.push(
                    API.graphql(
                        graphqlOperation(updateJob, {
                            input: jobSettings,
                        })
                    )
                        .then()
                        .catch((err) => console.log(err))
                );
                formUpdate["genFile_" + newFile] = 0
                setJobResults(jobResults.concat(newJobs));
            }
        }
        await Promise.all(allPromises);
        form.setFieldsValue(formUpdate);
        setSelectedRows([])
        setSelectedRowKeys([])
        setIsModalVisible(false);
    };
    const handleEvalOk = async () => {
        if (selectedRows.length === 0 || !selectedRows[0].filename) {
            setSelectedRows([])
            setSelectedRowKeys([])
            setIsModalVisible(false);
            return;
        }
        const newFile = selectedRows[0].filename;
        let newUrl = "";
        await getS3Url(
            `files/eval/${newFile}`,
            (s3Url) => (newUrl = s3Url),
            () => {}
        );
        jobSettings.evalUrl = newUrl;
        // let expiration = 86400;
        // if (jobSettings.expiration) {
        //     expiration = jobSettings.expiration;
        // }
        // const expiration_time = Math.round(Date.now() / 1000) + expiration;
        const allPromises = [];

        setJobSettings(jobSettings);
        let newID = jobResults.length;
        const newJobs = [];
        jobResults
            .filter((result) => result.live === true)
            .forEach((result) => {
                allPromises.push(
                    API.graphql(
                        graphqlOperation(updateGenEvalParam, {
                            input: {
                                id: result.id,
                                JobID: result.JobID,
                                GenID: result.GenID,
                                live: false,
                                expirationTime: null,
                            },
                        })
                    )
                        .then()
                        .catch((err) => console.log(err))
                );
                const newParam = {
                    id: result.JobID + "_" + newID,
                    JobID: result.JobID,
                    GenID: newID,
                    generation: result.generation,
                    genUrl: result.genUrl,
                    evalUrl: newUrl,
                    evalResult: null,
                    live: true,
                    params: result.params,
                    score: null,
                    owner: result.owner,
                    expirationTime: null,
                    errorMessage: null,
                };
                allPromises.push(
                    API.graphql(
                        graphqlOperation(createGenEvalParam, {
                            input: newParam,
                        })
                    )
                        .then()
                        .catch((err) => console.log(err))
                );
                result.live = false;
                newJobs.push(newParam);
                newID += 1;
            });
        allPromises.push(
            API.graphql(
                graphqlOperation(updateJob, {
                    input: jobSettings,
                })
            )
                .then()
                .catch((err) => console.log(err))
        );
        setJobResults(jobResults.concat(newJobs));

        await Promise.all(allPromises);
        setSelectedRows([])
        setSelectedRowKeys([])
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const columns = [
        {
            title: "File",
            dataIndex: "filename",
            key: "filename",
            sorter: true,
            sortDirections: ["ascend", "descend"],
        },
        {
            title: "Uploaded",
            dataIndex: "lastModified",
            key: "lastModified",
            sorter: true,
            sortDirections: ["ascend", "descend"],
            defaultSortOrder: "descend",
            render: (text, record, index) => (
                <Space>
                    {text.toLocaleString()}
                    {record.tag ? (
                        <Tag color="green" key={record.tag}>
                            {record.tag.toUpperCase()}
                        </Tag>
                    ) : null}
                </Space>
            ),
        }
    ];

    const rowSelection = {
        selectedRowKeys,
        columnTitle: 'Select File',
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowKeys(selectedRowKeys)
            setSelectedRows(selectedRows)
        }
    };
    if (replaceEvalCheck || replacedUrl) {
        rowSelection.type = 'radio';
    } else {
        rowSelection.type = 'checkbox';
    }

    const listS3files = () => {
        setIsTableLoading(true);
        const uploadedSet = new Set(uploadedFiles);
        let isSubscribed = true; // prevents memory leak on unmount
        const prepS3files = (files) => {
            if (isSubscribed) {
                const fileList = [];
                files.forEach(({ key, lastModified }, index) => {
                    const fileUrlSplit = key.split("/");
                    if (replaceEvalCheck && fileUrlSplit[fileUrlSplit.length - 2] === "gen") {
                        return;
                    } else if (!replaceEvalCheck && fileUrlSplit[fileUrlSplit.length - 2] === "eval") {
                        return;
                    }
                    fileList.push({
                        key: index,
                        filename: key.split("/").pop(),
                        lastModified,
                        tag: uploadedSet.has(key.split("/").pop()) ? "new" : null,
                    });
                });
                fileList.sort((a, b) => b.lastModified - a.lastModified); // Default descending order
                setS3Files([...fileList]);
                setIsTableLoading(false);
            }
        }; // changes state if still subscribed
        listS3(prepS3files, () => {});
        return () => (isSubscribed = false);
    };
    useEffect(listS3files, [uploadedFiles, isModalVisible]); // Updates when new files are uploaded
    function FileUpload({ uploadType }) {
        function handleUpload({ file, onSuccess, onError, onProgress }) {
            uploadS3(`files/${uploadType.toLowerCase()}/${file.name}`, file, onSuccess, onError, onProgress);
        }
        function handleChange(event) {
            if (event.file.status === "done") {
                message.success(`${event.file.name} file uploaded successfully`);
                setUploadedFiles([...uploadedFiles, ...event.fileList.map((file) => file.name)]);
            } else if (event.file.status === "error") {
                message.error(`${event.file.name} file upload failed.`);
            }
        }
        return (
            <div className="upload-topbar">
                <Upload accept=".js" multiple={true} customRequest={handleUpload} onChange={handleChange} showUploadList={false}>
                    <Button>
                        <UploadOutlined /> Upload {uploadType} File
                    </Button>
                </Upload>
            </div>
        );
    }
    const handleTableChange = (pagination, filters, sorter) => {
        const compareAscend = (a, b) => {
            if (a < b) {
                return -1;
            } else if (a > b) {
                return 1;
            } else {
                return 0;
            }
        };
        const compareDescend = (a, b) => {
            if (a > b) {
                return -1;
            } else if (a < b) {
                return 1;
            } else {
                return 0;
            }
        };
        const [field, order] = [sorter.field, sorter.order];
        const _s3Files = [...s3Files];
        if (order === "ascend") {
            _s3Files.sort((a, b) => compareAscend(a[field], b[field]));
        } else {
            _s3Files.sort((a, b) => compareDescend(a[field], b[field]));
        }
        setS3Files(_s3Files);
    };
    return (
        <>
            <Modal title="Select File" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <FileUpload uploadType={replaceEvalCheck?"eval":"gen"} />
                    <Table
                        dataSource={s3Files}
                        columns={columns}
                        loading={isTableLoading}
                        onChange={handleTableChange}
                        showSorterTooltip={false}
                        pagination={{
                            total: s3Files.length,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total) => `${total} files`,
                        }}
                        rowSelection={rowSelection}
                    ></Table>
                </Space>
            </Modal>
        </>
    );
}

function ResumeForm({ jobID, jobSettingsState, jobResultsState, getData, setIsLoading }) {
    const { jobSettings, setJobSettings } = jobSettingsState;
    const { jobResults, setJobResults } = jobResultsState;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [replacedUrl, setReplacedUrl] = useState(null);
    const [replaceEvalCheck, setReplacedEvalCheck] = useState(false);
    const [form] = Form.useForm();
    async function initParams(jobID, newJobSettings) {
        let startingGenID = jobResults.length;
        const allPromises = [];
        for (let i = 0; i < newJobSettings.genFile_random_generated; i++) {
            const randomIndex = Math.floor(Math.random() * newJobSettings.genUrl.length);
            newJobSettings["genFile_" + newJobSettings.genKeys[randomIndex]] += 1;
        }
        for (const genKey of newJobSettings.genKeys) {
            let genFile;
            await downloadS3(
                `files/gen/${genKey}`,
                (data) => {
                    genFile = data;
                },
                () => {}
            );
            // console.log(genFileText)
            if (!genFile) {
                console.log("Error: Unable to Retrieve Gen File!");
                return false;
            }
            const splittedString = genFile.split("/** * **/");
            const argStrings = splittedString[0].split("// Parameter:");
            const params = [];
            if (argStrings.length > 1) {
                for (let i = 1; i < argStrings.length - 1; i++) {
                    params.push(JSON.parse(argStrings[i]));
                }
                params.push(JSON.parse(argStrings[argStrings.length - 1].split("function")[0].split("async")[0]));
            }
            params.forEach((x) => {
                if (x.min && typeof x.min !== "number") {
                    x.min = Number(x.min);
                }
                if (x.max && typeof x.max !== "number") {
                    x.max = Number(x.max);
                }
                if (x.step && typeof x.step !== "number") {
                    x.step = Number(x.step);
                }
            });
            if (!params) {
                continue;
            }
            let maxGen = 1;
            const allParams = [];
            jobResults.forEach((result) => {
                maxGen = Math.max(maxGen, result.generation)
                if (result.genUrl === newJobSettings.genUrl[genKey]) {
                    allParams.push(result.params)
                }
            });
            for (let i = 0; i < newJobSettings["genFile_" + genKey]; i++) {
                const paramSet = {
                    id: jobID + "_" + startingGenID,
                    JobID: jobID.toString(),
                    GenID: startingGenID.toString(),
                    generation: maxGen + 1,
                    genUrl: newJobSettings.genUrl[genKey],
                    evalUrl: newJobSettings.evalUrl,
                    evalResult: null,
                    live: true,
                    owner: newJobSettings.owner,
                    params: null,
                    score: null,
                    expirationTime: null,
                    errorMessage: null,
                };
                startingGenID++;
                const itemParams = {};

                let duplicateCount = 0;
                while (true){
                    // generate the parameters used for that Gen File
                    for (const param of params) {
                        if (param.hasOwnProperty("step")) {
                            let steps = (param.max - param.min) / param.step;
                            let randomStep = Math.floor(Math.random() * steps);
                            itemParams[param.name] = param.min + param.step * randomStep;
                        } else {
                            itemParams[param.name] = param.value;
                        }
                    }
                    let existCheck = false;
                    for (const existingParam of allParams) {
                        let isDuplicate = true;
                        for (const param of params) {
                            if (!param.hasOwnProperty("step")) {
                                continue;
                            }
                            if (itemParams[param.name] !== existingParam[param.name]) {
                                isDuplicate = false;
                                break;
                            }
                        }
                        if (isDuplicate) {
                            existCheck = true;
                            break;
                        }
                    }
                    if (!existCheck || duplicateCount >= 20) {
                        allParams.push(itemParams);
                        break;
                    }
                    duplicateCount += 1;
                }
                paramSet.params = JSON.stringify(itemParams);
                allPromises.push(
                    API.graphql(
                        graphqlOperation(createGenEvalParam, {
                            input: paramSet,
                        })
                    )
                        .then()
                        .catch((err) => console.log(err))
                );
            }
        }
        await Promise.all(allPromises);
    }

    async function handleFinish() {
        if (jobSettings.genUrl.length === 0) {
            notify('Unable to Resume Search', 'Please add least one Gen File!', true);
            return;
        }
        const newJobSettings = form.getFieldsValue();
        newJobSettings.description = jobSettings.description;
        newJobSettings.genUrl = {};
        newJobSettings.genKeys = jobSettings.genUrl.map((genUrl) => {
            const genKey = genUrl.split("/").pop();
            newJobSettings.genUrl[genKey] = genUrl;
            return genKey;
        });
        newJobSettings.genKeys.forEach((key) => {
            newJobSettings["genFile_" + key] -= jobResults.filter(
                (result) => result.live === true && result.genUrl === newJobSettings.genUrl[key]
            ).length;
        });
        newJobSettings.evalUrl = jobSettings.evalUrl;
        setIsLoading(true);
        await initParams(jobSettings.id, newJobSettings);

        jobSettings.jobStatus = "inprogress";
        jobSettings.run = true;
        jobSettings.max_designs = newJobSettings.max_designs;
        jobSettings.population_size = newJobSettings.population_size;
        jobSettings.tournament_size = newJobSettings.tournament_size;
        jobSettings.mutation_sd = newJobSettings.mutation_sd;
        API.graphql(
            graphqlOperation(updateJob, {
                input: {
                    id: jobSettings.id,
                    jobStatus: "inprogress",
                    run: true,
                    expiration: null,
                    description: jobSettings.description,
                    max_designs: newJobSettings.max_designs,
                    population_size: newJobSettings.population_size,
                    tournament_size: newJobSettings.tournament_size,
                    mutation_sd: newJobSettings.mutation_sd,
                },
            })
        )
            .then(() => {
                setJobResults([]);
                getData(jobSettings.id, jobSettings.owner, setJobSettings, setJobResults, setIsLoading, () => setIsLoading(false)).catch((err) =>
                    console.log(err)
                );
            })
            .catch((err) => console.log(err));
        // jobSettings.expiration = newJobSettings.expiration;
        jobSettings.max_designs = newJobSettings.max_designs;
        jobSettings.population_size = newJobSettings.population_size;
        jobSettings.tournament_size = newJobSettings.tournament_size;
        jobSettings.mutation_sd = newJobSettings.mutation_sd;
        setJobSettings(jobSettings);
    }
    function handleFinishFail() {
        notify('Unable to Resume Search', 'Please check for Errors in form!', true);
    }
    function onNewDesignChange(e) {
        setTimeout(() => {
            const new_designs = Number(form.getFieldValue("new_designs"));
            const formUpdate = { max_designs: jobSettings.max_designs + new_designs };
            form.setFieldsValue(formUpdate);
        }, 0);
    }
    function onPopChange(e) {
        onNumChange(null);
    }
    function onNumChange(e) {
        setTimeout(() => {
            let totalCount = 0;
            jobSettings.genUrl.forEach((genUrl) => {
                const genFile = genUrl.split("/").pop();
                const inpID = "genFile_" + genFile;
                totalCount += Number(form.getFieldValue(inpID));
            });
            const formUpdate = { genFile_total_items: totalCount };
            form.setFieldsValue(formUpdate);
        }, 0);
    }
    function checkTournament(_, value) {
        const popVal = form.getFieldValue('population_size');
        if (value >= popVal * 2) {
            return Promise.reject(new Error('Tournament size must be smaller than 2 * population_size!'));
        }
        return Promise.resolve();
    }
    function checkGenFile(_) {
        const formVal = form.getFieldsValue();
        let totalCount = 0;
        jobSettings.genUrl.forEach((genUrl) => {
            const genFile = genUrl.split("/").pop();
            const inpID = "genFile_" + genFile;
            totalCount += Number(formVal[inpID]);
        });
        if ((totalCount- formInitialValues.initial_live_items) > formVal.new_designs) {
            return Promise.reject(new Error('Total number of new genFile parameters cannot be higher than max number of new designs'));
        }
        return Promise.resolve();
    }
    const formInitialValues = {
        max_designs: jobSettings.max_designs * 2,
        new_designs: jobSettings.max_designs,
        population_size: jobSettings.population_size,
        tournament_size: jobSettings.tournament_size,
        mutation_sd: jobSettings.mutation_sd,

        genFile_total_items: jobSettings.population_size,
        initial_live_items : 0
        // genFile_mutate: 0,
    };
    if (jobSettings.jobStatus === "cancelled") {
        formInitialValues.max_designs = jobSettings.max_designs;
        formInitialValues.new_designs = 0;
    }
    jobSettings.genUrl.forEach((url) => {
        const genFile = url.split("/").pop();
        formInitialValues["genFile_" + genFile] = 0;
    });
    jobResults.forEach((result) => {
        if (!result.live) {
            return;
        }
        const genFile = result.genUrl.split("/").pop();
        formInitialValues["genFile_" + genFile] += 1;
        formInitialValues.initial_live_items += 1;
    });

    const showModalGen = (url) => {
        setReplacedUrl(url);
        setReplacedEvalCheck(false);
        setIsModalVisible(true);
    };
    const showModalEval = () => {
        setReplacedUrl("");
        setReplacedEvalCheck(true);
        setIsModalVisible(true);
    };

    const deleteGenFile = async (url) => {
        const urlIndex = jobSettings.genUrl.indexOf(url);
        if (urlIndex !== -1) {
            jobSettings.genUrl.splice(urlIndex, 1);
            await API.graphql(
                graphqlOperation(updateJob, {
                    input: jobSettings,
                })
            )
                .then()
                .catch((err) => console.log(err));
            setJobSettings(null);
            setJobSettings(jobSettings);
        }
    };

    if (!jobID || !jobSettings) {
        return <></>;
    }

    const genTableColumns = [
        {
            title: "Gen File",
            dataIndex: "genFile",
            key: "genFile",
            defaultSortOrder: "ascend",
        },
        {
            title: "Total Items",
            dataIndex: "numItems",
            key: "numItems",
        },
        {
            title: "Live Items",
            dataIndex: "liveItems",
            key: "liveItems",
        },
        {
            title: "Action",
            dataIndex: "fileAction",
            key: "fileAction",
            render: (url) => (
                <>
                    <Button type="text" htmlType="button" onClick={() => showModalGen(url)}>
                        replace
                    </Button>
                    <br></br>
                    <Button type="text" htmlType="button" onClick={() => deleteGenFile(url)}>
                        delete
                    </Button>
                </>
            ),
        },
    ];
    const genTableData = jobSettings.genUrl.map((genUrl) => {
        const genFile = genUrl.split("/").pop();
        const tableEntry = {
            genUrl: genUrl,
            genFile: genFile,
            numItems: jobResults.filter((result) => result.genUrl === genUrl).length,
            liveItems: jobResults.filter((result) => result.genUrl === genUrl && result.live === true).length,
            fileAction: genUrl,
        };
        return tableEntry;
    });
    const evalTableColumns = [
        {
            title: "Eval File",
            dataIndex: "evalFile",
            key: "evalFile",
        },
        {
            title: "Total Items",
            dataIndex: "numItems",
            key: "numItems",
        },
        {
            title: "Live Items",
            dataIndex: "liveItems",
            key: "liveItems",
        },
        {
            title: "Action",
            dataIndex: "fileAction",
            key: "fileAction",
            render: () => (
                <Button type="text" htmlType="button" onClick={() => showModalEval()}>
                    replace
                </Button>
            ),
        },
    ];

    const evalTableData = [
        {
            evalUrl: jobSettings.evalUrl,
            evalFile: jobSettings.evalUrl.split("/").pop(),
            numItems: jobResults.filter((result) => result.evalUrl === jobSettings.evalUrl).length,
            liveItems: jobResults.filter((result) => result.evalUrl === jobSettings.evalUrl && result.live === true).length,
            fileAction: jobSettings.evalUrl,
        },
    ];
    const genExtra = (part) => <Help page="result_page" part={part}></Help>;

    let helpText = {};
    try {
        helpText = helpJSON.hover.result_page;
    } catch (ex) {}

    const rules = [{required: true}]
    return (
        <>
            <Form
                name="ResumeJob"
                onFinish={handleFinish}
                onFinishFailed={handleFinishFail}
                scrollToFirstError={true}
                requiredMark={false}
                form={form}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
                layout="horizontal"
                labelAlign="left"
                initialValues={formInitialValues}
            >
                <Collapse defaultActiveKey={["1", "2", "3", "4"]}>
                    <Collapse.Panel header="New Search Settings" key="1" extra={genExtra("resume_new_settings_1")}>
                        <Tooltip placement="topLeft" title={helpText.max_designs}>
                            <Form.Item label="New Max Designs" name="max_designs" rules={rules}>
                                <InputNumber disabled />
                            </Form.Item>
                        </Tooltip>

                        <Tooltip placement="topLeft" title={helpText.new_designs}>
                            <Form.Item label="Number of New Designs" name="new_designs" rules={rules}>
                                <InputNumber min={0} onChange={onNewDesignChange} />
                            </Form.Item>
                        </Tooltip>

                        <Tooltip placement="topLeft" title={helpText.population_size}>
                            <Form.Item label="Population Size" name="population_size" rules={rules}>
                                <InputNumber min={1} onChange={onPopChange} />
                            </Form.Item>
                        </Tooltip>

                        <Tooltip placement="topLeft" title={helpText.tournament_size}>
                            <Form.Item label="Tournament Size" name="tournament_size" rules={[...rules,{ validator: checkTournament }]}>
                                <InputNumber min={1} />
                            </Form.Item>
                        </Tooltip>

                        <Tooltip placement="topLeft" title={helpText.mutation_sd}>
                            <Form.Item label="Mutation Standard Deviation" name="mutation_sd">
                                <InputNumber min={0.001} max={1} step={0.001}/>
                            </Form.Item>
                        </Tooltip>
                    </Collapse.Panel>
                    <Collapse.Panel header="New Generative Settings" key="2" extra={genExtra("resume_gen_file")}>
                        <Button htmlType="button" onClick={() => showModalGen(null)}>Add Gen File</Button>
                        <Table dataSource={genTableData} columns={genTableColumns} rowKey="genUrl"></Table>
                    </Collapse.Panel>
                    <Collapse.Panel header="New Evaluative Settings" key="3" extra={genExtra("resume_eval_file")}>
                        <Button htmlType="button" onClick={() => showModalEval(null)}>Add Eval File</Button>
                        <Table dataSource={evalTableData} columns={evalTableColumns} rowKey="evalUrl"></Table>
                    </Collapse.Panel>
                    <Collapse.Panel header="New Initialization Settings" key="4" extra={genExtra("resume_new_settings_2")}>
                        <Tooltip placement="topLeft" title={helpText.total_items}>
                            <Form.Item label="Total Starting Items" name="genFile_total_items">
                                <InputNumber disabled />
                            </Form.Item>
                        </Tooltip>
                        {jobSettings.genUrl.map((genUrl) => {
                            const genFile = genUrl.split("/").pop();
                            return (
                                <Form.Item label={genFile} name={"genFile_" + genFile} key={"genFile_" + genFile} rules={[...rules, {validator: checkGenFile}]}>
                                    <InputNumber min={formInitialValues["genFile_" + genFile]} onChange={onNumChange}/>
                                </Form.Item>
                            );
                        })}
                        {/* <Tooltip placement="topLeft" title={helpText.mutate}>
                            <Form.Item label="Mutate from Existing" name="genFile_mutate" rules={rules}>
                                <InputNumber min={0} onChange={onNumChange} />
                            </Form.Item>
                        </Tooltip>

                        <Tooltip placement="topLeft" title={helpText.random_generated}>
                            <Form.Item label="Randomly Generated" name="genFile_random_generated">
                                <InputNumber disabled />
                            </Form.Item>
                        </Tooltip> */}
                    </Collapse.Panel>
                </Collapse>
                <br />
                <Row justify="center">
                    <Button type="primary" htmlType="submit">
                        Resume Search
                    </Button>
                </Row>
            </Form>
            <FileSelectionModal
                form = {form}
                isModalVisibleState={{ isModalVisible, setIsModalVisible }}
                jobSettingsState={{ jobSettings, setJobSettings }}
                jobResultsState={{ jobResults, setJobResults }}
                replacedUrl={replacedUrl}
                replaceEvalCheck={replaceEvalCheck}
            />
        </>
    );
}

export { ResumeForm };
