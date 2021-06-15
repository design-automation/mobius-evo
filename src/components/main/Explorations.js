import React, { useEffect, useState, useContext } from "react";
import * as QueryString from "query-string";
import { Space, Row, Button, Descriptions, Badge, Tree, Spin, Drawer, Tag, Popconfirm, Menu, Table } from "antd";
import { Link } from "react-router-dom";
import { PlusSquareOutlined, SyncOutlined, CheckCircleOutlined, MinusCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { API, graphqlOperation } from "aws-amplify";
import { listJobs, generationsByJobId } from "../../graphql/queries";
import { updateJob, deleteGenEvalParam, deleteJob } from "../../graphql/mutations";
import { deleteS3 } from "../../amplify-apis/userFiles";
import { AuthContext } from "../../Contexts";
import Help from './utils/Help';
import "./Explorations.css";

function JobTable({ isDataLoadingState, jobDataState }) {
    const expandedSettings = ["Max_Designs", "Population_Size", "Tournament_Size"];
    const { isDataLoading, setIsDataLoading } = isDataLoadingState;
    const { jobData, setjobData } = jobDataState;
    const sortProps = {
        sorter: true,
        sortDirections: ["ascend", "descend"],
    };
    const columns = [
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            fixed: "left",
            render: (text, record) => 
            <button className='text-btn' onClick={() => handleRowClick(record)}>{text}</button>
        },
        // {
        //     title: "Created At",
        //     dataIndex: "createdAt",
        //     key: "createdAt",
        //     ...sortProps,
        //     defaultSortOrder: "descend",
        //     render: (text) => new Date(text).toLocaleString(),
        // },
        {
            title: "Status",
            dataIndex: "jobStatus",
            key: "status",
            fixed: "left",
            ...sortProps,
            render: (text) => {
                switch (text) {
                    case "inprogress":
                        return <Badge status="processing" text="In Progress" />;
                    case "completed":
                        return <Badge status="success" text="Completed" />;
                    case "cancelled":
                        return <Badge status="error" text="Error" />;
                    default:
                        return <Badge status="default" text="Expired" />;
                }
            },
        },
        {
            title: "Last Modified",
            dataIndex: "updatedAt",
            key: "updatedAt",
            ...sortProps,
            defaultSortOrder: "descend",
            render: (text) => (<Space>{new Date(text).toLocaleString()}</Space>)
        },
        {
            title: "Gen File(s)",
            dataIndex: "genUrl",
            key: "genFile",
            ...sortProps,
            render: (urls) => (<>{urls.map(text => <p>{text.split("/").pop()}</p>)}</>),
        },
        {
            title: "Eval File",
            dataIndex: "evalUrl",
            key: "evalFile",
            ...sortProps,
            render: (text) => text.split("/").pop(),
        },
        ...expandedSettings.map((dataKey) => ({
            title: dataKey.replace(/_/g, ' '),
            dataIndex: dataKey.toLowerCase(),
            key: dataKey.toLowerCase(),
            ...sortProps,
        })),
        {
            title: "Mutation Standard Deviation",
            dataIndex: "mutation_sd",
            key: "mutation_sd",
            ...sortProps
        },
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
            fixed: "right",
            render: (text, record) => 
            <button className='text-btn'
                onClick={() => deleteJobAndParams(record.id, record.owner)}
            >delete</button>
            ,
        },
    ];

    async function getGenEvalParamByJobID(jobID, userID, resultList, nextToken = null) {
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
                    getGenEvalParamByJobID(jobID, userID, resultList, (nextToken = queryResult.data.generationsByJobID.nextToken)).catch((err) => {
                        throw err;
                    });
                }
                queriedJobResults.forEach((result) => resultList.push(result.id));
            })
            .catch((err) => {
                console.log(err);
                throw err;
            });
    }

    async function deleteJobAndParams(jobID, userID) {
        setIsDataLoading(true);
        // const genParamIDList = [];
        // const promiseList = [];
        // await getGenEvalParamByJobID(jobID, userID, genParamIDList);
        // genParamIDList.forEach((paramID) =>
        //     promiseList.push(
        //         API.graphql(
        //             graphqlOperation(deleteGenEvalParam, {
        //                 input: { id: paramID },
        //             })
        //         ).catch((err) => {
        //             throw err;
        //         })
        //     )
        // );
        await API.graphql(
            graphqlOperation(deleteJob, {
                input: { id: jobID },
            })
        ).catch((err) => {
            throw err;
        })
        // promiseList.push(deleteS3(`${userID}/${jobID}`, () => {}))
        // await Promise.all(promiseList);
        setjobData((jobData) => {
            const newjobData = [];
            jobData.forEach(rowObj => {
                if (rowObj.id === jobID) {
                    return;
                }
                newjobData.push(rowObj);
            });
            return newjobData;
        })
        setIsDataLoading(false);
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
        const _jobData = [...jobData];
        if (order === "ascend") {
            _jobData.sort((a, b) => compareAscend(a[field], b[field]));
        } else {
            _jobData.sort((a, b) => compareDescend(a[field], b[field]));
        }
        setjobData(_jobData);
    };

    function handleRowClick(rowData) {
        window.location.href = `/searches/search-results#${QueryString.stringify({ id: rowData.id })}`;
    }
    return ( <>
        <Space direction="horizontal" size="small" align='center'>
            <Button type="primary">
                <Link to={`/new-job`}>Create New Search</Link>
            </Button>
            <Help page='jobs_page' part='main'></Help>
        </Space>
        <Table
            loading={isDataLoading}
            dataSource={jobData}
            columns={columns}
            rowKey="key"
            showSorterTooltip={false}
            onChange={handleTableChange}
            expandable={{
                defaultExpandAllRows: true,
            }}
            pagination={{
                // total:jobList.length,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `${total} files`,
            }}
            scroll={{ x: 1800 }} sticky
        />
    </>);
}

function Explorations() {
    const { cognitoPayload } = useContext(AuthContext);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [dataView, setDataView] = useState("tree");
    const [jobData, setjobData] = useState([]);

    const compareDescend = (a, b) => {
        if (a > b) {
            return -1;
        } else if (a < b) {
            return 1;
        } else {
            return 0;
        }
    };

    const refreshList = (cognitoPayloadSub, setjobData, setIsDataLoading) => {
        API.graphql(
            graphqlOperation(listJobs, {
                filter: {
                    userID: {
                        eq: cognitoPayloadSub,
                    },
                },
            })
        )
            .then((queriedResults) => {
                const jobList = queriedResults.data.listJobs.items;
                const jobData = jobList.map((data, index) => {
                    if (!data.mutation_sd) { data.mutation_sd = 0.05; }
                    return {
                        key: index + 1,
                        title: data.description,
                        ...data,
                        action: ''
                    };
                });
                setjobData(jobData.sort((a, b) => compareDescend(a.updatedAt, b.updatedAt)));
                setIsDataLoading(false);
            })
            .catch((error) => console.log(error));
    }
    useEffect(() => {
        refreshList(cognitoPayload.sub, setjobData, setIsDataLoading)
    }, [cognitoPayload]);
    return (
        <div className="explorations-container">
            <Menu
                onClick={(e) => {
                    setDataView(e.key);
                }}
                selectedKeys={[dataView]}
                mode="horizontal"
            ></Menu>
            <JobTable
                isDataLoadingState={{ isDataLoading, setIsDataLoading }}
                jobDataState={{ jobData, setjobData }}
            />
        </div>
    );
}

export default Explorations;
