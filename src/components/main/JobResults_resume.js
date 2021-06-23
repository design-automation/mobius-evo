import React, { useEffect, useState } from "react";
import { Form, Space, Button, Divider, InputNumber, Upload, message, Tag, Table, Modal, Row, Collapse, Tooltip, notification, Descriptions } from "antd";
import { uploadS3, listS3, getS3Url, downloadS3 } from "../../amplify-apis/userFiles";
import { UploadOutlined } from "@ant-design/icons";
import { API, graphqlOperation } from "aws-amplify";
import { createGenEvalParam, updateGenEvalParam, updateJob } from "../../graphql/mutations";
import "./JobResults_resume.css";
import Help from "./utils/Help";
import helpJSON from "../../assets/help/help_text_json";
import {compareAscend, compareDescend} from './utils/UtilFunctions'
import { generationsByJobId, listJobs } from "../../graphql/queries";

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

function FileSelectionModal({form, isFileModalVisibleState, jobSettingsState, jobResultsState, replacedUrl, replaceEvalCheck }) {
    const [s3Files, setS3Files] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isTableLoading, setIsTableLoading] = useState(true);
    const { isFileModalVisible, setIsFileModalVisible } = isFileModalVisibleState;
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
                let newLiveCount = 0;
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
                            survivalGeneration: null,
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
                        newLiveCount++;
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
                formUpdate["genFile_existing_" + newFile] = newLiveCount;
                formUpdate["genFile_" + newFile] = 0;
                setJobResults(jobResults.concat(newJobs));
            }
        }
        await Promise.all(allPromises);
        form.setFieldsValue(formUpdate);
        setSelectedRows([])
        setSelectedRowKeys([])
        setIsFileModalVisible(false);
    };
    const handleEvalOk = async () => {
        if (selectedRows.length === 0 || !selectedRows[0].filename) {
            setSelectedRows([])
            setSelectedRowKeys([])
            setIsFileModalVisible(false);
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
                    survivalGeneration: null,
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
        setIsFileModalVisible(false);
    };

    const handleCancel = () => {
        setIsFileModalVisible(false);
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
    useEffect(listS3files, [uploadedFiles, isFileModalVisible]); // Updates when new files are uploaded
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
            <Modal title="Select File" visible={isFileModalVisible} onOk={handleOk} onCancel={handleCancel}>
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


function ParamImportModal({ form, jobSettings, isImportModalVisibleState, genFile, importDataState}) {
    const [isTableLoading, setIsTableLoading] = useState(true);
    const [jobList, setJobList] = useState([]);
    const { isImportModalVisible, setIsImportModalVisible } = isImportModalVisibleState;
    const { importData, setImportData } = importDataState;
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [lastGenFile, setLastGenFile] = useState(null);

    if (lastGenFile !== genFile) {
        setSelectedRows([])
        setSelectedRowKeys([])
        setJobList([])
        setLastGenFile(genFile)
    }

    const handleOk = async () => {
        importData[genFile].jobs = []
        importData[genFile].min = 0
        selectedRows.forEach(row => {
            importData[genFile].jobs.push({
                id: row.id,
                owner: row.owner,
                description: row.description,
                resultCount: row.resultList.length,
                resultList: row.resultList
            })
            importData[genFile].min += row.resultList.length
        })
        setImportData(importData);
        const fieldVals = form.getFieldsValue()
        if (fieldVals["genFile_" + genFile] < importData[genFile].min) {
            const fieldUpdate = {};

            let totalCount = importData[genFile].min;
            for (let i in fieldVals) {
                if (i.startsWith('genFile_') && i !== 'genFile_total_items' && i !== "genFile_" + genFile) {
                    totalCount += fieldVals[i];
                }
            }
            fieldUpdate["genFile_" + genFile] = importData[genFile].min;
            fieldUpdate.genFile_total_items = totalCount;
            form.setFieldsValue(fieldUpdate)
        }
        setIsImportModalVisible(false);
        document.getElementById('triggerNumGenChange').click();
    };

    const handleCancel = () => {
        setIsImportModalVisible(false);
    };
    const sortProps = {
        sorter: true,
        sortDirections: ["ascend", "descend"]
    }

    const columns = [
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            fixed: "left",
        },
        {
            title: "Gen File(s)",
            dataIndex: "genUrl",
            key: "genFile",
            ...sortProps,
            render: (urls) => (<>{urls.map(text => {
                const url = text.split("/").pop()
                return <p key={url}>{url}</p>
            })}</>),
        },
        {
            title: "Settings",
            dataIndex: "max_designs",
            key: "evalFile",
            render: (_, data) => {
                let max_designs, population_size, tournament_size, mutation_sd;
                if (data.run_settings) {
                    const runSettings = JSON.parse(data.run_settings)
                    max_designs = runSettings.max_designs
                    population_size = runSettings.population_size
                    tournament_size = runSettings.tournament_size
                    mutation_sd = runSettings.mutation_sd
                } else {
                    max_designs = data.max_designs
                    population_size = data.population_size
                    tournament_size = data.tournament_size
                    mutation_sd = data.mutation_sd
                }
                return (<>
                    <p key='md'>{`max designs: ${max_designs}`}</p>
                    <p key='ps'>{`population size: ${population_size}`}</p>
                    <p key='ts'>{`tournament size: ${tournament_size}`}</p>
                    <p key='msd'>{`mutation standard deviation: ${mutation_sd}`}</p>
                </>);
            }
        },
        {
            title: "Param Count",
            dataIndex: "resultList",
            key: "resultList",
            ...sortProps,
            render: resultList => resultList.length,
        },

    ];

    async function getGenEvalParamByJobID(jobID, userID, genFile, resultList, nextToken = null) {
        await API.graphql(
            graphqlOperation(generationsByJobId, {
                limit: 1000,
                owner: { eq: userID },
                JobID: jobID,
                filter: null,
                items: {},
                nextToken,
            })
        )
            .then((queryResult) => {
                let queriedJobResults = queryResult.data.generationsByJobID.items;
                if (queryResult.data.generationsByJobID.nextToken) {
                    getGenEvalParamByJobID(jobID, userID, genFile, resultList, queryResult.data.generationsByJobID.nextToken).catch((err) => {
                        throw err;
                    });
                }
                queriedJobResults.forEach((result) => {
                    if (result.genUrl.endsWith(genFile) && result.live) {
                        resultList.push(result)
                    }
                });
            })
            .catch((err) => {
                console.log(err);
                throw err;
            });
    }

    const listRelatedJobs = () => {
        setIsTableLoading(true);
        let isSubscribed = true; // prevents memory leak on unmount
        API.graphql(
            graphqlOperation(listJobs, {
                filter: {
                    userID: {
                        eq: jobSettings.owner,
                    },
                },
            })
        )
            .then(async (queriedResults) => {
                const jobList = queriedResults.data.listJobs.items;
                const queryPromises = [];
                const jobData = jobList.map((data, index) => {
                    if (data.id === jobSettings.id) { return null; }
                    let check = false;
                    data.genUrl.forEach(url => {
                        if (url.endsWith('/' + genFile)) {
                            check = true;
                        }
                    })
                    if (!check) {return null;}
                    if (data.run_settings) {
                        const runSettings = JSON.parse(data.run_settings);
                        data.num_gen = runSettings.num_gen;
                        data.max_designs = runSettings.max_designs;
                        data.population_size = runSettings.population_size;
                        data.tournament_size = runSettings.tournament_size;
                        data.mutation_sd = runSettings.mutation_sd;
                    }
                    if (!data.mutation_sd) { data.mutation_sd = 0.05; }
                    const resultList = [];
                    queryPromises.push(getGenEvalParamByJobID(data.id, data.owner, '/' + genFile, resultList, null))
                    return {
                        key: index + 1,
                        ...data,
                        resultList: resultList
                    };
                });
                await Promise.all(queryPromises);
                const _jobList = jobData.filter(x => (x !== null) && (x.resultList.length > 0)).sort(
                    (a, b) => compareDescend(a.updatedAt, b.updatedAt))
                setJobList(_jobList);
                setTimeout(() => {
                    setIsTableLoading(false);
                }, 1000);
            })
            .catch((error) => console.log(error));
        return () => (isSubscribed = false);
    };
    useEffect(listRelatedJobs, [jobSettings, isImportModalVisible]); // Updates when new files are uploaded

    const handleTableChange = (pagination, filters, sorter) => {
        const [field, order] = [sorter.field, sorter.order];
        const _jobList = [...jobList];
        if (order === "ascend") {
            _jobList.sort((a, b) => compareAscend(a[field], b[field]));
        } else {
            _jobList.sort((a, b) => compareDescend(a[field], b[field]));
        }
        setJobList(_jobList);
    };
    return (
        <>
            <Modal title="Select Search" visible={isImportModalVisible} width='80%' onOk={handleOk} onCancel={handleCancel}>
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Table
                        dataSource={jobList}
                        columns={columns}
                        loading={isTableLoading}
                        onChange={handleTableChange}
                        showSorterTooltip={false}
                        pagination={{
                            total: jobList.length,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total) => `${total} files`,
                        }}
                        rowSelection={{
                            selectedRowKeys,
                            columnTitle: "Select Search",
                            type: "checkbox",
                            onChange: (selectedRowKeys, selectedRows) => {
                                setSelectedRowKeys(selectedRowKeys);
                                setSelectedRows(selectedRows);
                            },
                        }}
                    ></Table>
                </Space>
            </Modal>
        </>
    );
}

function ResumeForm({ jobID, jobSettingsState, jobResultsState, getData, setIsLoading }) {
    const { jobSettings, setJobSettings } = jobSettingsState;
    const { jobResults, setJobResults } = jobResultsState;

    const [isFileModalVisible, setIsFileModalVisible] = useState(false);
    const [replacedUrl, setReplacedUrl] = useState(null);
    const [replaceEvalCheck, setReplacedEvalCheck] = useState(false);
    const [form] = Form.useForm();

    const [isImportModalVisible, setIsImportModalVisible] = useState(false);
    const [importGenFile, setImportGenFile] = useState(false);

    const importDataMapping = {}
    jobSettings.genUrl.forEach(url => {
        const genKey = url.split('/').pop();
        importDataMapping[genKey] = {
            min: 0,
            jobs: []
        }
    });
    const [importData, setImportData] = useState(importDataMapping);


    async function initParams(jobID, newJobSettings) {
        let startingGenID = jobResults.length;
        const allPromises = [];
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
            let newItems = jobSettings["genFile_" + genKey];
            // add the imported data
            if (importData[genKey] && importData[genKey].jobs) {
                newItems -= importData[genKey].min;
                for (const importJob of importData[genKey].jobs) {
                    for (const param of importJob.resultList) {
                        allParams.push(JSON.parse(param.params))
                        console.log(param.params)
                        const paramSet = {
                            id: jobID + "_" + startingGenID,
                            JobID: jobID.toString(),
                            GenID: startingGenID.toString(),
                            generation: maxGen + 1,
                            survivalGeneration: null,
                            genUrl: newJobSettings.genUrl[genKey],
                            evalUrl: newJobSettings.evalUrl,
                            evalResult: null,
                            live: true,
                            owner: jobSettings.owner,
                            params: param.params,
                            score: null,
                            expirationTime: null,
                            errorMessage: null,
                        };
        
                        allPromises.push(
                            API.graphql(
                                graphqlOperation(createGenEvalParam, {
                                    input: paramSet,
                                })
                            )
                                .then()
                                .catch((err) => console.log(err))
                        );
                        startingGenID ++
                    }
                }
            }
            for (let i = 0; i < newItems; i++) {
                const paramSet = {
                    id: jobID + "_" + startingGenID,
                    JobID: jobID.toString(),
                    GenID: startingGenID.toString(),
                    generation: maxGen + 1,
                    survivalGeneration: null,
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
        console.log('....', newJobSettings)
        console.log('~~~~', importGenFile)

        newJobSettings.description = jobSettings.description;
        newJobSettings.genUrl = {};
        newJobSettings.genKeys = jobSettings.genUrl.map((genUrl) => {
            const genKey = genUrl.split("/").pop();
            newJobSettings.genUrl[genKey] = genUrl;
            return genKey;
        });
        // newJobSettings.genKeys.forEach((key) => {
        //     newJobSettings["genFile_" + key] -= jobResults.filter(
        //         (result) => result.live === true && result.genUrl === newJobSettings.genUrl[key]
        //     ).length;
        // });
        newJobSettings.evalUrl = jobSettings.evalUrl;
        setIsLoading(true);
        await initParams(jobSettings.id, newJobSettings);

        jobSettings.jobStatus = "inprogress";
        jobSettings.run = true;
        jobSettings.num_gen = newJobSettings.num_gen;
        jobSettings.max_designs = newJobSettings.max_designs;
        jobSettings.population_size = newJobSettings.population_size;
        jobSettings.tournament_size = newJobSettings.tournament_size;
        jobSettings.mutation_sd = newJobSettings.mutation_sd;
        API.graphql(
            graphqlOperation(updateJob, {
                input: {
                    id: jobSettings.id,
                    description: jobSettings.description,
                    jobStatus: "inprogress",
                    run: true,
                    expiration: null,
                    run_settings: JSON.stringify({
                        num_gen: newJobSettings.num_gen,
                        max_designs: newJobSettings.max_designs,
                        population_size: newJobSettings.population_size,
                        tournament_size: newJobSettings.tournament_size,
                        mutation_sd: newJobSettings.mutation_sd,
                    }),
                    max_designs: null,
                    population_size: null,
                    tournament_size: null,
                    mutation_sd: null,
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
        for (const key in importData) {
            importData[key] = {
                min: 0,
                jobs: []
            }
        }
        setJobSettings(jobSettings);
        setImportData(importData)

    }
    function handleFinishFail() {
        notify('Unable to Resume Search', 'Please check for Errors in form!', true);
    }
    function onNumGenChange() {
        setTimeout(() => {
            const fieldValues = form.getFieldsValue()
            let livePop = jobResults.filter(r => r.live).length;
            let firstGenPop = fieldValues.genFile_total_items - livePop;

            // total initial items number is smaller/equal to current live size => new first gen pop = new gen num * pop size
            if (firstGenPop <= 0) {
                firstGenPop = livePop;
            }

            let newDesigns = firstGenPop;
            livePop += firstGenPop;

            for (let i = 1; i < fieldValues.new_gens; i++) {
                if (livePop > fieldValues.population_size) {
                    livePop = fieldValues.population_size
                }
                newDesigns += livePop;
                livePop += livePop;
            }

            form.setFieldsValue({
                max_designs: jobResults.length + newDesigns,
                new_designs: newDesigns
            })
        },0)
    }
    function onPopChange(e) {
        onNumChange(null);
    }
    function onNumChange(e) {
        setTimeout(() => {
            let totalCount = 0;
            const formVal = form.getFieldsValue();
            jobSettings.genUrl.forEach((genUrl) => {
                const genFile = genUrl.split("/").pop();
                totalCount += Number(formVal["genFile_" + genFile]) + Number(formVal["genFile_existing_" + genFile]);
            });
            const formUpdate = { genFile_total_items: totalCount };
            form.setFieldsValue(formUpdate);
            onNumGenChange();
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
            totalCount += Number(formVal["genFile_" + genFile]) + Number(formVal["genFile_existing_" + genFile]);
        });
        if ((totalCount- formInitialValues.initial_live_items) > formVal.new_designs) {
            return Promise.reject(new Error('Total number of new genFile parameters cannot be higher than max number of new designs'));
        }
        return Promise.resolve();
    }
    const formInitialValues = {
        max_designs: jobResults.length + jobSettings.population_size * 5,
        new_gens: 5,
        new_designs: jobSettings.population_size * 5,
        population_size: jobSettings.population_size,
        tournament_size: jobSettings.tournament_size,
        mutation_sd: jobSettings.mutation_sd,

        genFile_total_items: jobSettings.population_size,
        initial_live_items : 0
    };
    if (jobSettings.jobStatus === "cancelled") {
        formInitialValues.max_designs = jobSettings.max_designs;
        formInitialValues.new_designs = 0;
    }
    jobSettings.genUrl.forEach((url) => {
        const genFile = url.split("/").pop();
        formInitialValues["genFile_" + genFile] = 0;
        formInitialValues["genFile_existing_" + genFile] = 0;
    });
    jobResults.forEach((result) => {
        if (!result.live) {
            return;
        }
        const genFile = result.genUrl.split("/").pop();
        formInitialValues["genFile_existing_" + genFile] += 1;
        formInitialValues.initial_live_items += 1;
    });

    const showModalGen = (url) => {
        setReplacedUrl(url);
        setReplacedEvalCheck(false);
        setIsFileModalVisible(true);
    };
    const showModalEval = () => {
        setReplacedUrl("");
        setReplacedEvalCheck(true);
        setIsFileModalVisible(true);
    };
    const showModalImport = (genFile) => {
        setIsImportModalVisible(true);
        setImportGenFile(genFile)
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
                    <Collapse.Panel header="New Generative Settings" key="2" extra={genExtra("resume_gen_file")}>
                        <Button htmlType="button" onClick={() => showModalGen(null)}>Add Gen File</Button>
                        <Table dataSource={genTableData} columns={genTableColumns} rowKey="genUrl"></Table>
                    </Collapse.Panel>
                    <Collapse.Panel header="New Evaluative Settings" key="3" extra={genExtra("resume_eval_file")}>
                        <Button htmlType="button" onClick={() => showModalEval(null)}>Add Eval File</Button>
                        <Table dataSource={evalTableData} columns={evalTableColumns} rowKey="evalUrl"></Table>
                    </Collapse.Panel>
                    <Collapse.Panel header="New Search Settings" key="1" extra={genExtra("resume_new_settings_1")}>
                        <Tooltip placement="topLeft" title={helpText.new_gens}>
                            <Form.Item label="Number of new Generations" name="new_gens" rules={rules}>
                                <InputNumber min={0} onChange={onNumGenChange} />
                            </Form.Item>
                        </Tooltip>

                        <Tooltip placement="topLeft" title={helpText.new_designs}>
                            <Form.Item label="Number of New Designs" name="new_designs" rules={rules}>
                                <InputNumber className="form-text" disabled/>
                            </Form.Item>
                        </Tooltip>

                        <Tooltip placement="topLeft" title={helpText.max_designs}>
                            <Form.Item label="New Max Designs" name="max_designs" rules={rules}>
                                <InputNumber className="form-text" disabled />
                            </Form.Item>
                        </Tooltip>

                        <Tooltip placement="topLeft" title={helpText.population_size}>
                            <Form.Item label="Population Size" name="population_size" rules={rules}>
                                <InputNumber min={1} onChange={onPopChange} />
                            </Form.Item>
                        </Tooltip>

                        <Divider/>

                        <Tooltip placement="topLeft" title={helpText.total_items}>
                            <Form.Item label="Total Starting Items" name="genFile_total_items">
                                <InputNumber className="form-text" disabled />
                            </Form.Item>
                        </Tooltip>
                        {/* {jobSettings.genUrl.map((genUrl) => {
                            const genFile = genUrl.split("/").pop();
                            return <div key={"genFile_" + genFile}>
                                <Form.Item label={genFile + ' - existing'} name={"genFile_existing_" + genFile} key={"genFile_existing_" + genFile}>
                                    <InputNumber className="form-text" disabled/>
                                </Form.Item>
                                <Form.Item label={genFile + ' - new'} name={"genFile_" + genFile} key={"genFile_" + genFile} rules={[...rules, {validator: checkGenFile}]}>
                                    <InputNumber min={formInitialValues["genFile_" + genFile]} onChange={onNumChange}/>
                                </Form.Item>
                                </div>;
                        })} */}
                        {jobSettings.genUrl.map((genUrl) => {
                            const genFile = genUrl.split("/").pop();
                            return (<div key={"genFile_" + genFile}>
                                    <Form.Item label={genFile + ' - existing'} name={"genFile_existing_" + genFile} key={"genFile_existing_" + genFile}>
                                        <InputNumber className="form-text" disabled/>
                                    </Form.Item>
                                    <Form.Item label={genFile} key={"genFile_" + genFile}>
                                        <Form.Item
                                            className="sub-form-item"
                                            key="form_input"
                                            name={"genFile_" + genFile}
                                            rules={[...rules, { validator: checkGenFile }]}
                                        >
                                            <InputNumber name={"genFile_" + genFile} min={importData[genFile].min + formInitialValues["genFile_" + genFile]} onChange={onNumChange} />
                                        </Form.Item>
                                        <Form.Item key="import_btn" className="sub-form-item">
                                            <Button onClick={()=>{showModalImport(genFile)}}>import</Button>
                                        </Form.Item>
                                        <Form.Item key="import_searches" className="sub-form-item">
                                            {importData[genFile].jobs.map(job=>{
                                                return <p key={job.id}>{job.description}: {job.resultCount}</p>
                                            })}
                                        </Form.Item>
                                    </Form.Item>
                                </div>
                            );
                        })}

                        <Divider/>
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
                isFileModalVisibleState={{ isFileModalVisible, setIsFileModalVisible }}
                jobSettingsState={{ jobSettings, setJobSettings }}
                jobResultsState={{ jobResults, setJobResults }}
                replacedUrl={replacedUrl}
                replaceEvalCheck={replaceEvalCheck}
            />
            <ParamImportModal
                form={form}
                jobSettings={jobSettings}
                isImportModalVisibleState={{ isImportModalVisible, setIsImportModalVisible }}
                importDataState={{ importData, setImportData }}
                genFile={importGenFile}
            />
            <button id='triggerNumGenChange' className='hidden-elm' onClick={onNumGenChange}></button>
        </>
    );
}

export { ResumeForm };
