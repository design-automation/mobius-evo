import React, { useState, useContext, useEffect } from "react";
import "./UserCreateNewSearch.css";
import * as QueryString from "query-string";
import { v4 as uuidv4 } from "uuid";
import { API, graphqlOperation } from "aws-amplify";
import { createJob, createGenEvalParam } from "../../graphql/mutations";
import { generationsByJobId, listJobs } from "../../graphql/queries";
import { uploadS3, listS3, getS3Url, downloadS3, deleteS3 } from "../../amplify-apis/userFiles";
import { UploadOutlined } from "@ant-design/icons";
import { AuthContext } from "../../Contexts";
import {
    Form,
    Input,
    InputNumber,
    Button,
    Tooltip,
    Table,
    Radio,
    Checkbox,
    Upload,
    message,
    Tag,
    Space,
    Spin,
    Row,
    Collapse,
    notification,
    Modal,
    Slider,
    Divider,
    Col,
} from "antd";
import Help from "./utils/Help";
import helpJSON from "../../assets/help/help_text_json";
import {compareAscend, compareDescend} from './utils/UtilFunctions'

const testDefault = {
    description: `new test`,
    num_gen: 5,
    max_designs: 100,
    population_size: 20,
    tournament_size: 10,
    mutation_sd: 0.05,
    expiration_days: 30,
    genFile_random_generated: 20,
    genFile_total_items: 20,
};
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

function FileSelectionModal({ form, isFileModalVisibleState, genFilesState, setEvalFile, replacedUrl, replaceEvalCheck, importDataState }) {
    const [s3Files, setS3Files] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isTableLoading, setIsTableLoading] = useState(true);
    const { genFiles, setGenFiles } = genFilesState;
    const { isFileModalVisible, setIsFileModalVisible } = isFileModalVisibleState;
    const { importData, setImportData } = importDataState;
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
        let okCheck = false;
        const formUpdate = {};
        for (const selectedRow of selectedRows) {
            const newFile = selectedRow.filename;
            let newUrl = "";
            await getS3Url(
                `files/gen/${newFile}`,
                (s3Url) => (newUrl = s3Url),
                () => {}
            );
            if (!replacedUrl) {
                if (genFiles.indexOf(newUrl) !== -1) {
                    notify("Unable to add gen file!", "Search already contains Gen file to be added.");
                    continue;
                }
                genFiles.push(newUrl);
                okCheck = true;
            } else {
                const genIndex = genFiles.indexOf(replacedUrl);
                if (genIndex !== -1) {
                    genFiles.splice(genIndex, 1, newUrl);
                    okCheck = true;
                }
            }
            formUpdate["genFile_" + newFile] = 0;
            importData[newFile] = {
                min: 0,
                jobs: []
            };
        }
        if (okCheck) {
            setGenFiles(genFiles);
            form.setFieldsValue(formUpdate);
        }
        setSelectedRows([]);
        setSelectedRowKeys([]);
        setImportData(importData)
        setIsFileModalVisible(false);
    };
    const handleEvalOk = async () => {
        if (selectedRows.length === 0 || !selectedRows[0].filename) {
            setSelectedRows([]);
            setSelectedRowKeys([]);
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
        setSelectedRows([]);
        setSelectedRowKeys([]);
        setEvalFile(newUrl);
        setIsFileModalVisible(false);
    };

    const handleCancel = () => {
        setSelectedRows([]);
        setSelectedRowKeys([]);
        setIsFileModalVisible(false);
    };

    const deleteUploadedFile = async (fileName, index) => {
        setIsTableLoading(true);
        let fileDir;
        if (replaceEvalCheck) {
            fileDir = `files/eval/${fileName}`
        } else {
            console.log('gen')
            fileDir = `files/gen/${fileName}`
        }
        await deleteS3(fileDir, null)
        setSelectedRows([]);
        setSelectedRowKeys([]);
        s3Files.splice(index, 1)
        setS3Files([...s3Files])
        setIsTableLoading(false);
    }

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
        },
        {
            title: "Action",
            dataIndex: "filename",
            key: "action",
            render: (filename, _, index) => <button className='text-btn' onClick={() => deleteUploadedFile(filename, index)}>delete</button>
        }
    ];
    const rowSelection = {
        selectedRowKeys,
        columnTitle: "Select File",
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowKeys(selectedRowKeys);
            setSelectedRows(selectedRows);
        },
    };
    if (replaceEvalCheck || replacedUrl) {
        rowSelection.type = "radio";
    } else {
        rowSelection.type = "checkbox";
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
            <Modal title="Select File" visible={isFileModalVisible} width='60%' onOk={handleOk} onCancel={handleCancel}>
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <FileUpload uploadType={replaceEvalCheck ? "eval" : "gen"} />
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

function ParamImportModal({ form, isImportModalVisibleState, genFile, cognitoPayloadSub, importDataState}) {
    const [isTableLoading, setIsTableLoading] = useState(true);
    const [jobList, setJobList] = useState([]);
    const { isImportModalVisible, setIsImportModalVisible } = isImportModalVisibleState;
    const { importData, setImportData } = importDataState;
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

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
                if (i.startsWith('genFile_') && i !== 'genFile_total_items' && i !== 'genFile_random_generated' && i !== "genFile_" + genFile) {
                    totalCount += fieldVals[i];
                }
            }
            fieldUpdate["genFile_" + genFile] = importData[genFile].min;
            if (totalCount < fieldVals.population_size) {
                fieldUpdate.genFile_random_generated = fieldVals.population_size - totalCount;
                totalCount = fieldVals.population_size;
            } else {
                fieldUpdate.genFile_random_generated = 0;
            }
            fieldUpdate.genFile_total_items = totalCount;
            fieldUpdate.max_designs = totalCount + (fieldVals.num_gen - 1) * fieldVals.population_size;

            form.setFieldsValue(fieldUpdate)
        }
        setIsImportModalVisible(false);
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
            title: "Number of Imported Individuals",
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
        let isSubscribed = true; // prevents memory leak on unmount
        setJobList([]);
        setIsTableLoading(true);
        API.graphql(
            graphqlOperation(listJobs, {
                filter: {
                    userID: {
                        eq: cognitoPayloadSub,
                    },
                },
            })
        )
            .then(async (queriedResults) => {
                if (!isSubscribed) { return; }
                const jobList = queriedResults.data.listJobs.items;
                const queryPromises = [];
                const jobData = jobList.map((data, index) => {
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
                setSelectedRows([])
                setSelectedRowKeys([])
                setIsTableLoading(false);
            })
            .catch((error) => console.log(error));
        return () => (isSubscribed = false);
    };
    useEffect(listRelatedJobs, [cognitoPayloadSub, genFile]); // Updates when new files are uploaded

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

function SettingsForm({ currentStateManage }) {
    const { cognitoPayload } = useContext(AuthContext);
    const { currentState, setCurrentState } = currentStateManage;
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [genFiles, setGenFiles] = useState([]);
    const [evalFile, setEvalFile] = useState(null);

    const [isFileModalVisible, setIsFileModalVisible] = useState(false);
    const [replacedUrl, setReplacedUrl] = useState(null);
    const [replaceEvalCheck, setReplacedEvalCheck] = useState(false);

    const [isImportModalVisible, setIsImportModalVisible] = useState(false);
    const [importGenFile, setImportGenFile] = useState(false);
    const [importData, setImportData] = useState({});


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
        const urlIndex = genFiles.indexOf(url);
        if (urlIndex !== -1) {
            genFiles.splice(urlIndex, 1);
            setGenFiles(genFiles);
            setCurrentState(!currentState);
        }
    };

    async function initParams(jobID, jobSettings, importData) {
        let startingGenID = 0;
        const allPromises = [];
        const genUrls = {};
        const genKeys = jobSettings.genUrl.map((url) => {
            const key = url.split("/").pop();
            genUrls[key] = url;
            return key;
        });
        for (let i = 0; i < jobSettings.genFile_random_generated; i++) {
            const randomIndex = Math.floor(Math.random() * jobSettings.genUrl.length);
            jobSettings["genFile_" + genKeys[randomIndex]] += 1;
        }

        // for each of the gen file
        for (const genKey of genKeys) {
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
            const allParams = [];
            let newItems = jobSettings["genFile_" + genKey];
            // add the imported data
            if (importData[genKey] && importData[genKey].jobs) {
                newItems -= importData[genKey].min;
                for (const importJob of importData[genKey].jobs) {
                    for (const param of importJob.resultList) {
                        allParams.push(JSON.parse(param.params))
                        const paramSet = {
                            id: jobID + "_" + startingGenID,
                            JobID: jobID.toString(),
                            GenID: startingGenID.toString(),
                            generation: 1,
                            survivalGeneration: null,
                            genUrl: genUrls[genKey],
                            evalUrl: jobSettings.evalUrl,
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
                    generation: 1,
                    survivalGeneration: null,
                    genUrl: genUrls[genKey],
                    evalUrl: jobSettings.evalUrl,
                    evalResult: null,
                    live: true,
                    owner: jobSettings.owner,
                    params: null,
                    score: null,
                    expirationTime: null,
                    errorMessage: null,
                };
                startingGenID++;
                const itemParams = {};
                let duplicateCount = 0;

                // generate one set of parameters used for that Gen File
                while (true) {
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

                // add it to the database
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
        const jobID = uuidv4();
        const jobSettings = form.getFieldsValue();
        if (!genFiles || !evalFile) {
            notify("Unable to Start Job", "Please select at least one Gen File and one Eval File!", true);
            return;
        }
        // jobSettings.expiration = jobSettings.expiration_days * 24 * 60 * 60;
        setIsSubmitting(true);

        jobSettings.genUrl = genFiles;
        jobSettings.evalUrl = evalFile;
        await initParams(jobID, jobSettings, importData);
        const jobParam = {
            id: jobID,
            userID: cognitoPayload.sub,
            jobStatus: "inprogress",
            owner: cognitoPayload.sub,
            run: true,
            evalUrl: jobSettings.evalUrl,
            genUrl: jobSettings.genUrl,
            expiration: null,
            description: jobSettings.description,
            history: null,
            run_settings: JSON.stringify({
                num_gen: jobSettings.num_gen,
                max_designs: jobSettings.max_designs,
                population_size: jobSettings.population_size,
                tournament_size: jobSettings.tournament_size,
                mutation_sd: jobSettings.mutation_sd,
            }),
            other_settings: '{}',
            max_designs: null,
            population_size: null,
            tournament_size: null,
            mutation_sd: null,
            errorMessage: null,
        };
        API.graphql(
            graphqlOperation(createJob, {
                input: jobParam,
            })
        ).then(() => {
            setIsSubmitting(false);
            window.location.href = `/searches/search-results#${QueryString.stringify({ id: jobID })}`;
        });
    }
    function handleFinishFail() {
        notify("Unable to Start Job", "Please check for Errors in form!", true);
    }
    const formInitialValues = testDefault;

    function onNumGenChange() {
        setTimeout(() => {
            const fieldValues = form.getFieldsValue();
            form.setFieldsValue({
                max_designs: fieldValues.genFile_total_items + (fieldValues.num_gen - 1) * fieldValues.population_size,
            });
        }, 0);
    }
    function onPopChange() {
        onNumChange(null);
    }
    function onNumChange() {
        setTimeout(() => {
            const starting_population = Number(form.getFieldValue("population_size"));
            let totalCount = 0;
            genFiles.forEach((genUrl) => {
                const genFile = genUrl.split("/").pop();
                const inpID = "genFile_" + genFile;
                totalCount += Number(form.getFieldValue(inpID));
            });
            let countDiff = starting_population - totalCount;
            const formUpdate = { genFile_total_items: totalCount < starting_population ? starting_population : totalCount };
            if (countDiff < 0) {
                countDiff = 0;
            }
            formUpdate["genFile_random_generated"] = countDiff;
            form.setFieldsValue(formUpdate);

            onNumGenChange();
        }, 0);
    }
    function checkTournament(_, value) {
        const popVal = form.getFieldValue("population_size");
        if (value >= popVal * 2) {
            return Promise.reject(new Error("Tournament size must be smaller than 2 * population_size!"));
        }
        return Promise.resolve();
    }

    function checkGenFile(_) {
        const formVal = form.getFieldsValue();
        let totalCount = 0;
        genFiles.forEach((genUrl) => {
            const genFile = genUrl.split("/").pop();
            const inpID = "genFile_" + genFile;
            totalCount += Number(formVal[inpID]);
        });
        // if (totalCount > formVal.max_designs) {
        //     return Promise.reject(new Error("Total number of genFile parameters cannot be higher than max number of designs"));
        // }
        return Promise.resolve();
    }

    const genExtra = (part) => <Help page="start_new_job_page" part={part}></Help>;
    let helpText = {};
    try {
        helpText = helpJSON.hover.start_new_job_page;
    } catch (ex) {}
    const rules = [{ required: true }];

    const genTableData = genFiles.map((genUrl) => {
        const genFile = genUrl.split("/").pop();
        const tableEntry = {
            genUrl: genUrl,
            genFile: genFile,
            fileAction: genUrl,
        };
        return tableEntry;
    });
    const evalTableData = [];
    if (evalFile) {
        evalTableData.push({
            evalUrl: evalFile,
            evalFile: evalFile.split("/").pop(),
            fileAction: evalFile,
        });
    }
    const genTableColumns = [
        {
            title: "Gen File",
            dataIndex: "genFile",
            key: "genFile",
            defaultSortOrder: "ascend",
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
    const evalTableColumns = [
        {
            title: "Eval File",
            dataIndex: "evalFile",
            key: "evalFile",
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

    return (
        <>
            <Spin spinning={isSubmitting} tip="Starting Job...">
                <Form
                    name="jobSettings"
                    onFinish={handleFinish}
                    onFinishFailed={handleFinishFail}
                    scrollToFirstError={true}
                    requiredMark={false}
                    form={form}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 16 }}
                    labelAlign="left"
                    layout="horizontal"
                    initialValues={formInitialValues}
                >
                    <Collapse defaultActiveKey={["1", "2", "3", "4"]}>
                        <Collapse.Panel header="Generative Settings" key="2" extra={genExtra("gen_file")}>
                            <Button htmlType="button" onClick={() => showModalGen(null)}>
                                Add Gen File
                            </Button>
                            <Table dataSource={genTableData} columns={genTableColumns} rowKey="genUrl"></Table>
                        </Collapse.Panel>
                        <Collapse.Panel header="Evaluative Settings" key="3" extra={genExtra("eval_file")}>
                            <Button htmlType="button" onClick={() => showModalEval(null)}>
                                Add Eval File
                            </Button>
                            <Table dataSource={evalTableData} columns={evalTableColumns} rowKey="evalUrl"></Table>
                        </Collapse.Panel>
                        <Collapse.Panel header="Search Settings" key="1" extra={genExtra("settings_1")}>
                            <Tooltip placement="topLeft" title={helpText.description}>
                                <Form.Item label="Description" name="description">
                                    <Input />
                                </Form.Item>
                            </Tooltip>

                            <Tooltip placement="topLeft" title={helpText.num_gen}>
                                <Form.Item label="Number of Generations" name="num_gen" rules={rules}>
                                    <InputNumber min={1} onChange={onNumGenChange} />
                                </Form.Item>
                            </Tooltip>

                            <Tooltip placement="topLeft" title={helpText.max_designs}>
                                <Form.Item label="Number of Designs" name="max_designs" rules={rules}>
                                    <InputNumber className="form-text" disabled />
                                </Form.Item>
                            </Tooltip>

                            <Tooltip placement="topLeft" title={helpText.population_size}>
                                <Form.Item label="Population Size" name="population_size" rules={rules}>
                                    <InputNumber min={1} onChange={onPopChange} />
                                </Form.Item>
                            </Tooltip>

                            <Divider />

                            <Tooltip placement="topLeft" title={helpText.total_items}>
                                <Form.Item label="Total Starting Items" name="genFile_total_items">
                                    <InputNumber className="form-text" disabled />
                                </Form.Item>
                            </Tooltip>
                            {genFiles.map((genUrl) => {
                                const genFile = genUrl.split("/").pop();
                                return (
                                    <Form.Item label={genFile} key={"genFile_" + genFile}>
                                        <Form.Item
                                            className="sub-form-item"
                                            key="form_input"
                                            name={"genFile_" + genFile}
                                            rules={[...rules, { validator: checkGenFile }]}
                                        >
                                            <InputNumber name={"genFile_" + genFile} min={importData[genFile].min} onChange={onNumChange} />
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
                                );
                            })}
                            <Tooltip placement="topLeft" title={helpText.random_generated}>
                                <Form.Item label="Randomly Generated" name="genFile_random_generated">
                                    <InputNumber className="form-text" disabled />
                                </Form.Item>
                            </Tooltip>

                            <Divider />

                            <Tooltip placement="topLeft" title={helpText.tournament_size}>
                                <Form.Item label="Tournament Size" name="tournament_size" rules={[...rules, { validator: checkTournament }]}>
                                    <InputNumber />
                                </Form.Item>
                            </Tooltip>

                            <Tooltip placement="topLeft" title={helpText.mutation_sd}>
                                <Form.Item label="Mutation Standard Deviation" name="mutation_sd">
                                    <InputNumber min={0.001} max={1} step={0.001} />
                                </Form.Item>
                            </Tooltip>
                        </Collapse.Panel>
                    </Collapse>
                    <br></br>
                    <Row justify="center">
                        <Button type="primary" htmlType="submit">
                            Start
                        </Button>
                    </Row>
                    <br></br>
                    <br></br>
                    <br></br>
                </Form>
            </Spin>
            <FileSelectionModal
                form={form}
                isFileModalVisibleState={{ isFileModalVisible, setIsFileModalVisible }}
                importDataState={{ importData, setImportData }}
                genFilesState={{ genFiles, setGenFiles }}
                setEvalFile={setEvalFile}
                replacedUrl={replacedUrl}
                replaceEvalCheck={replaceEvalCheck}
            />
            <ParamImportModal
                form={form}
                isImportModalVisibleState={{ isImportModalVisible, setIsImportModalVisible }}
                importDataState={{ importData, setImportData }}
                genFile={importGenFile}
                cognitoPayloadSub={cognitoPayload.sub}
            />
        </>
    );
}

function JobForm() {
    const [currentState, setCurrentState] = useState(false);
    return (
        <div className="jobForm-container">
            <Space direction="vertical" size="large" style={{ width: "inherit" }}>
                <Space direction="horizontal" size="small" align="baseline">
                    <h1>Start New Search</h1>
                    <Help page="start_new_job_page" part="main"></Help>
                </Space>

                {/* <FileSelection nextStep={nextStep} formValuesState={{ formValues, setFormValues }} /> */}
                <SettingsForm currentStateManage={{ currentState, setCurrentState }} />
                {/* <FormToRender /> */}
            </Space>
        </div>
    );
}

export default JobForm;
