import React, { useEffect, useState, useContext } from "react";
import * as QueryString from "query-string";
import { Space, Row, Button, Descriptions, Badge, Tree, Spin, Drawer, Tag, Popconfirm, Menu, Table } from "antd";
import { Link } from "react-router-dom";
import { API, graphqlOperation } from "aws-amplify";
import { listJobs } from "../../graphql/queries";
import Help from './utils/Help';
import "./GuestSearchesList.css";
import {compareAscend, compareDescend} from './utils/UtilFunctions'
import { AuthContext } from "../../Contexts";

function JobTable({ isDataLoadingState, jobDataState }) {
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
        {
            title: "Status",
            dataIndex: "jobStatus",
            key: "status",
            width: 120,
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
            width: 120,
            ...sortProps,
            defaultSortOrder: "descend",
            render: (text) => (<Space>{new Date(text).toLocaleString()}</Space>)
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
            title: "Eval File",
            dataIndex: "evalUrl",
            key: "evalFile",
            ...sortProps,
            render: (text) => text.split("/").pop(),
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
        }
    ];

    const handleTableChange = (pagination, filters, sorter) => {
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
            rowKey="id"
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
            scroll={{ x: 1200 }} sticky
        />
    </>);
}

function GuestSearchesList() {
    const { cognitoPayload } = useContext(AuthContext);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [dataView, setDataView] = useState("tree");
    const [jobData, setjobData] = useState([]);

    console.log(cognitoPayload)

    const compareDescend = (a, b) => {
        if (a > b) {
            return -1;
        } else if (a < b) {
            return 1;
        } else {
            return 0;
        }
    };

    const refreshList = (setjobData, setIsDataLoading) => {
        API.graphql(
            graphqlOperation(listJobs),
        )
            .then((queriedResults) => {
                const jobList = queriedResults.data.listJobs.items;
                const jobData = jobList.map((data, index) => {
                    if (data.run_settings) {
                        const runSettings = JSON.parse(data.run_settings);
                        data.num_gen = runSettings.num_gen;
                        data.max_designs = runSettings.max_designs;
                        data.population_size = runSettings.population_size;
                        data.tournament_size = runSettings.tournament_size;
                        data.mutation_sd = runSettings.mutation_sd;
                    }
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
        refreshList(setjobData, setIsDataLoading)
    }, []);
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

export default GuestSearchesList;
