import React, { useEffect, useState, useContext } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { generationsByJobId, getJob } from "../../graphql/queries";
import { updateJob } from "../../graphql/mutations";
import * as QueryString from "query-string";
import {
    Row,
    Space,
    Button,
    Spin,
    Form,
    Col,
    Divider,
    Input,
    Checkbox,
    Table,
    Popconfirm,
    Tabs,
    Descriptions,
    Collapse,
    Alert,
    notification,
} from "antd";
import { Column, Scatter, DualAxes } from "@ant-design/charts";
import { AuthContext } from "../../Contexts";
import Iframe from "react-iframe";
// import { ReactComponent as Download } from "../../assets/download.svg";
import { ReactComponent as View } from "../../assets/view.svg";
import { ResumeForm } from "./UserSearchResult_resume.js";
import Help from "./utils/Help";
import { getS3Public } from "../../amplify-apis/userFiles";
import { ConsoleSqlOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { XYPlot, DecorativeAxis, LineSeries, DiscreteColorLegend, XAxis } from "react-vis";

import "./UserSearchResult.css";

const MOBIUS_VIEWER_URL = "https://design-automation.github.io/mobius-viewer-dev-0-7/";
const { TabPane } = Tabs;
function paramsRegex(params) {
    return JSON.parse(params);
    // const splits = params.replace(/\{|\}/g, '').split(',');
    // const ret = {};
    // splits.forEach(split => {
    //     const nameValSplit = split.split(':');
    //     const pName = nameValSplit[0].replace(/\"/g, '').trim();
    //     ret[pName] = nameValSplit[1].trim();
    // })
    // return ret

    // const pattern = /(\w+)=(\w+.?\w+)/gm;
    // const result = [...params.replace(/\"/g, '').matchAll(pattern)];
    // const ret = {};
    // result.forEach((match) => (ret[match[1]] = match[2]));
    // return ret;
}
function updateTextArea(text) {
    document.getElementById("hiddenInputText").value = text;
    document.getElementById("hiddenUpdateTextAreaButton").click();
}
function updateSelectedResult(text) {
    document.getElementById("hiddenInputText").value = text;
    document.getElementById("hiddenUpdateSelectedResultButton").click();
}
function printJSONString(jsonString) {
    if (!jsonString) {
        return "";
    }
    try {
        const formattedString = JSON.stringify(JSON.parse(jsonString), null, 4);
        return formattedString.slice(1, -1);
    } catch (ex) {
        console.log("~~~~~~~~~~~~ JSON parsing error...", ex);
        return jsonString;
    }
}
function assembleModelText(data) {
    return (
        "ID: " +
        data.id +
        "\n\n" +
        "Parameters: " +
        printJSONString(data.params) +
        "\n" +
        "Evaluation Result: " +
        printJSONString(data.evalResult) +
        "\n" +
        ""
    );
}

function notify(title, text, isWarn = false) {
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
}

async function getData(jobID, userID, setJobSettings, setJobResults, lastUpdatedData = null) {
    const latestUpdateTime = new Date().toISOString();
    let scoreCheck = true;

    const jobQuery = API.graphql(
        graphqlOperation(getJob, {
            id: jobID,
        })
    );

    const resultQuery = new Promise(async (resolve) => {
        const results = lastUpdatedData? lastUpdatedData.data: [];
        async function callQuery(nextToken = null) {
            const resultQueryInput = {
                limit: 1000,
                owner: { eq: userID },
                JobID: jobID,
                items: {},
                nextToken,
            };
            if (lastUpdatedData) {
                resultQueryInput.filter = {
                    updatedAt: {
                        ge: lastUpdatedData.time
                    }
                }
            }
            const queryResult = await API.graphql(
                graphqlOperation(generationsByJobId, resultQueryInput)
            )
            if (!queryResult || !queryResult.data || !queryResult.data.generationsByJobID) {
                resolve(results);
            }
            queryResult.data.generationsByJobID.items.forEach(item => {
                results[Number(item.GenID)] = item
                if (!item.score && !item.errorMessage) {
                    scoreCheck = false;
                }
            })
            if (queryResult.data.generationsByJobID.nextToken) {
                callQuery(queryResult.data.generationsByJobID.nextToken)
            } else {
                resolve(results)
            }
        }
        await callQuery();
    }).catch((err) => {
        console.log(err);
        throw err;
    });


    const jobData = (await jobQuery).data.getJob;
    if (jobData.run_settings) {
        const runSettings = JSON.parse(jobData.run_settings);
        jobData.num_gen = runSettings.num_gen;
        jobData.max_designs = runSettings.max_designs;
        jobData.population_size = runSettings.population_size;
        jobData.tournament_size = runSettings.tournament_size;
        jobData.mutation_sd = runSettings.mutation_sd;
    }
    setJobSettings(jobData);

    const newJobResults = await resultQuery;
    // jobResults.sort((a, b) => a.GenID - b.GenID);
    setJobResults(newJobResults);

    if (!jobData || jobData.jobStatus === "inprogress" || newJobResults.length < jobData.max_designs || !scoreCheck) {
        setTimeout(() => {
            // setIsLoading(true);
            setJobResults([]);
            const latestUpdated = {
                time: latestUpdateTime,
                data: newJobResults
            }
            getData(jobID, userID, setJobSettings, setJobResults, latestUpdated);
        }, 10000);
    }
}
function viewModel(url, contextURLs = null) {
    const iframe = document.getElementById("mobius_viewer").contentWindow;
    let urls = [];
    if (contextURLs && Array.isArray(contextURLs)) {
        for (const contextUrl of contextURLs) {
            if (contextUrl && contextUrl !== "") {
                urls.push(contextUrl);
            }
        }
    }
    urls.push(url);
    iframe.postMessage(
        {
            messageType: "update",
            url: urls,
        },
        "*"
    );
}
function FilterForm({ modelParamsState, jobResultsState, filteredJobResultsState, setIsLoadingState }) {
    const [form] = Form.useForm();
    const { modelParams, setModelParams } = modelParamsState;
    const { jobResults, setJobResults } = jobResultsState;
    const { filteredJobResults, setFilteredJobResults } = filteredJobResultsState;
    const [initialValues, setInitialValues] = useState({
        "show-group": ["live", "dead"],
    });
    const { isLoading, setIsLoading } = setIsLoadingState;
    const [isFiltering, setIsFiltering] = useState(false);

    const handleFinish = (values) => {
        setIsFiltering(true);
        setFilteredJobResults([]);
        const filteredResults = [];
        const processedValues = {};
        for (let i in values) {
            const vals = i.split("-");
            if (!processedValues[vals[0]]) {
                processedValues[vals[0]] = {};
            }
            processedValues[vals[0]][vals[1]] = values[i];
        }

        jobResults.forEach((result) => {
            const params = JSON.parse(result.params);
            if (processedValues.show && processedValues.show.group) {
                if (processedValues.show.group.length === 0) {
                    return;
                }
                if (processedValues.show.group.length === 1) {
                    if (processedValues.show.group[0] === "live") {
                        if (!result.live) {
                            return;
                        }
                    } else {
                        if (result.live) {
                            return;
                        }
                    }
                }
            }
            if (processedValues.score && (result.score < processedValues.score.min || result.score > processedValues.score.max)) {
                return;
            }
            for (const p in params) {
                if (processedValues[p] && (params[p] < processedValues[p].min || params[p] > processedValues[p].max)) {
                    return;
                }
            }
            filteredResults.push(result);
        });
        setFilteredJobResults(filteredResults);
        setIsFiltering(false);
    };
    useEffect(() => {
        const singleResult = jobResults[0];
        if (singleResult && modelParams.length === 0) {
            setModelParams(Object.keys(paramsRegex(singleResult.params)));
        }
        const resultMinMax = {
            params: modelParams.reduce((result, current, index, array) => {
                result[`${current}`] = [Infinity, -Infinity];
                return result;
            }, {}),
            score: [Infinity, -Infinity],
        };
        jobResults.forEach((result) => {
            const _params = paramsRegex(result.params);
            modelParams.forEach((param) => {
                if (_params[param] >= resultMinMax.params[`${param}`][1]) {
                    resultMinMax.params[`${param}`][1] = Math.ceil(_params[param]);
                }
                if (_params[param] <= resultMinMax.params[`${param}`][0]) {
                    resultMinMax.params[`${param}`][0] = Math.floor(_params[param]);
                }
            });
            if (result.score >= resultMinMax.score[1]) {
                resultMinMax.score[1] = Math.ceil(result.score);
            }
            if (result.score <= resultMinMax.score[0]) {
                resultMinMax.score[0] = Math.floor(result.score);
            }
        });
        let _initialValues = Object.keys(resultMinMax.params).reduce((result, current, currentIndex, array) => {
            const ret = { ...result };
            ret[`${current}-min`] = resultMinMax.params[current][0];
            ret[`${current}-max`] = resultMinMax.params[current][1];
            return ret;
        }, {});
        _initialValues["score-min"] = resultMinMax.score[0];
        _initialValues["score-max"] = resultMinMax.score[1];
        setInitialValues((initialValues) => {
            return { ...initialValues, ..._initialValues };
        });
        return () => {
            setIsLoading(false);
        };
    }, [setIsLoading, jobResults, modelParams, setModelParams, isFiltering]);
    // useEffect(() => {
    //   if (!isLoading && !isFiltering && jobResults.length===0) {
    //     if (jobSettings.jobStatus === "completed") {
    //       message.warning("filter returned 0 results");
    //     } else {
    //       message.info("search is still processing");
    //     }
    //   }
    // },[isLoading, isFiltering])
    useEffect(() => {
        form.resetFields();
    }, [form, initialValues]);

    return !isLoading ? (
        <Form form={form} onFinish={handleFinish} initialValues={initialValues}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Row>
                    <Space
                        size="large"
                        style={{
                            width: "100%",
                            justifyContent: "flex-start",
                            height: "100%",
                            alignItems: "normal",
                        }}
                    >
                        <Col>
                            <h3>parameters</h3>
                            {modelParams.map((param) => {
                                return (
                                    <Row key={`${param}-group`}>
                                        <Space>
                                            <Form.Item name={`${param}-min`} label={param}>
                                                <Input prefix="min" />
                                            </Form.Item>
                                            <Form.Item name={`${param}-max`}>
                                                <Input prefix="max" />
                                            </Form.Item>
                                        </Space>
                                    </Row>
                                );
                            })}
                        </Col>
                        <Divider type="vertical" />
                        <Col>
                            <h3>score</h3>
                            <Space>
                                <Form.Item name={`score-min`} key={`score-min`}>
                                    <Input prefix="min" />
                                </Form.Item>
                                <Form.Item name={`score-max`} key={`score-max`}>
                                    <Input prefix="max" />
                                </Form.Item>
                            </Space>
                            <Form.Item name="show-group" label="Show">
                                <Checkbox.Group>
                                    <Checkbox value="live">live</Checkbox>
                                    <Checkbox value="dead">dead</Checkbox>
                                </Checkbox.Group>
                            </Form.Item>
                        </Col>
                    </Space>
                </Row>
                <Row style={{ justifyContent: "center" }}>
                    <Button type="primary" htmlType="submit" disabled={isFiltering}>
                        Filter
                    </Button>
                </Row>
            </Space>
        </Form>
    ) : null;
}

function SingularParallelPlot({ genFile, plotData, domain, decorativeAxisLabels, legendItems, width, jobResults }) {
    const [hoveredNode, setHoveredNode] = useState(null);
    const [legends, setLegends] = useState(JSON.parse(JSON.stringify(legendItems)));
    function onLegendClick(l) {
        l.disabled = !l.disabled;
        setLegends(legends);
        if (hoveredNode === null) {
            setHoveredNode(false);
        } else {
            setHoveredNode(null);
        }
    }
    function onHoveredClick() {
        jobResults.forEach((data) => {
            if (data.GenID !== hoveredNode.id) {
                return;
            }
            getS3Public(
                data.owner + "/" + data.JobID + "/" + data.id + "_eval.gi",
                (url) => {
                    document.getElementById("hiddenInput").value = url;
                    document.getElementById("hiddenButton").click();
                },
                () => {}
            );
            updateTextArea(assembleModelText(data));
            updateSelectedResult(data.owner + "/" + data.JobID + "/" + data.id);
        });
    }
    return (
        <>
            <h4>{genFile}</h4>
            <DiscreteColorLegend items={legends} orientation="horizontal" onItemClick={onLegendClick}></DiscreteColorLegend>
            <XYPlot width={width - 100} height={width / 2 - 200} xType="ordinal" onMouseLeave={() => setHoveredNode(null)} onClick={onHoveredClick}>
                <XAxis key={`xAxis-${genFile}`} tickValues={decorativeAxisLabels} />
                {plotData.map((series) => {
                    if (series.genFile !== genFile) {
                        return null;
                    }
                    for (const l of legends) {
                        if (l.title === series.genStatus) {
                            if (l.disabled) {
                                return null;
                            }
                            break;
                        }
                    }
                    return (
                        <LineSeries
                            data={series.data}
                            key={`${series.id}`}
                            color={series.color}
                            onSeriesMouseOver={(e) => {
                                setHoveredNode(series);
                            }}
                            strokeWidth={1}
                        />
                    );
                })}
                {hoveredNode && hoveredNode.genFile === genFile ? (
                    <LineSeries data={hoveredNode.data} key={`${hoveredNode.id}-hovered-border`} color="#ff" strokeWidth={7} />
                ) : null}
                {hoveredNode && hoveredNode.genFile === genFile ? (
                    <LineSeries data={hoveredNode.data} key={`${hoveredNode.id}-hovered-fill`} color={hoveredNode.color} strokeWidth={4} />
                ) : null}
                {decorativeAxisLabels.map((cell, index) => {
                    return (
                        <DecorativeAxis
                            key={`${genFile}-${index}-axis`}
                            axisStart={{ x: cell, y: 0 }}
                            axisEnd={{ x: cell, y: 1 }}
                            axisDomain={[domain[cell].min, domain[cell].max]}
                            style={{
                                text: { color: "#ff" },
                            }}
                        />
                    );
                })}
            </XYPlot>
            <br></br>
        </>
    );
}

function ParallelPlot({ jobResults }) {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        function handleResize() {
            setWidth(window.innerWidth);
        }
        window.addEventListener("resize", handleResize);
    });

    const legendItems = {};
    const colors_pallete = ["#A16F47", "#B400C2", "#683F8F", "#09AABD", "#3C9E7F", "#B81E00", "#AB4B5D", "#0000A6", "#4169A6", "#0BB524"];
    const colors = {};

    const plotData = [];
    const genFiles = {};
    const domain = {};
    const decorativeAxisLabels = {};
    jobResults.forEach((result) => {
        if (!result.score) {
            return;
        }
        const genFile = result.genUrl.split("/").pop();
        if (!decorativeAxisLabels[genFile]) {
            decorativeAxisLabels[genFile] = [];
            domain[genFile] = { score: { min: Infinity, max: -Infinity } };
        }
        const parameters = JSON.parse(result.params);
        Object.keys(parameters).forEach((paramKey) => {
            if (!domain[genFile][paramKey]) {
                domain[genFile][paramKey] = { min: parameters[paramKey], max: parameters[paramKey] };
                decorativeAxisLabels[genFile].push(paramKey);
            }
            domain[genFile][paramKey].min = Math.min(domain[genFile][paramKey].min, parameters[paramKey]);
            domain[genFile][paramKey].max = Math.max(domain[genFile][paramKey].max, parameters[paramKey]);
            domain[genFile][paramKey].range = domain[genFile][paramKey].max - domain[genFile][paramKey].min;
        });
        domain[genFile].score.min = Math.min(domain[genFile].score.min, result.score);
        domain[genFile].score.max = Math.max(domain[genFile].score.max, result.score);
        domain[genFile].score.range = domain[genFile].score.max - domain[genFile].score.min;
    });
    for (const i in decorativeAxisLabels) {
        decorativeAxisLabels[i].push("score");
    }

    jobResults.forEach((result) => {
        if (!result.score) {
            return;
        }
        const parameters = JSON.parse(result.params);
        const resultData = [];
        const genFile = result.genUrl.split("/").pop();
        genFiles[genFile] = true;
        const genStatus = result.live ? "live" : "dead";
        if (!colors[genFile + " - " + genStatus]) {
            colors[genFile + " - " + genStatus] = colors_pallete.pop();
            if (!legendItems[genFile]) {
                legendItems[genFile] = [];
            }
            legendItems[genFile].push({
                title: genStatus,
                color: colors[genFile + " - " + genStatus],
            });
        }
        decorativeAxisLabels[genFile].forEach((paramKey) => {
            if (!parameters[paramKey] && parameters[paramKey] !== 0) {
                return;
            }
            resultData.push({
                y: (parameters[paramKey] - domain[genFile][paramKey].min) / domain[genFile][paramKey].range,
                x: paramKey,
            });
        });
        resultData.push({
            y: (result.score - domain[genFile].score.min) / domain[genFile].score.range,
            x: "score",
        });
        plotData.push({
            id: result.GenID,
            data: resultData,
            color: colors[genFile + " - " + genStatus],
            genFile: genFile,
            genStatus: genStatus,
        });
    });
    return (
        <>
            {Object.keys(genFiles)
                .sort()
                .map((genFile) => (
                    <SingularParallelPlot
                        key={genFile}
                        genFile={genFile}
                        plotData={plotData}
                        domain={domain[genFile]}
                        decorativeAxisLabels={decorativeAxisLabels[genFile]}
                        legendItems={legendItems[genFile]}
                        width={width}
                        jobResults={jobResults}
                    ></SingularParallelPlot>
                ))}
        </>
    );
}

function MinMaxPlot({ jobResults }) {
    // const generationData = {};
    const survivalGenerationData = {};
    jobResults.forEach((result) => {
        if (!result.score) {
            return;
        }

        // if (!generationData[result.generation]) {
        //     generationData[result.generation] = [result.score];
        // } else {
        //     generationData[result.generation].push(result.score);
        // }
        if (result.survivalGeneration) {
            for (let i = result.generation; i <= result.survivalGeneration; i++) {
                if (!survivalGenerationData[i]) {
                    survivalGenerationData[i] = [];
                }
                survivalGenerationData[i].push(result);
            }
        }
    });
    // console.log('survivalGenerationData', survivalGenerationData)
    // delete survivalGenerationData[1];

    let minY = Infinity,
        maxY = -Infinity;
    const scoreData = [];
    const genCountData = [];
    Object.keys(survivalGenerationData).map((generation) => {
        let minVal = Infinity,
            maxVal = -Infinity,
            sum = 0;
        const count = survivalGenerationData[generation].length;
        const genCount = { __total__: 0 };
        survivalGenerationData[generation].forEach((result) => {
            minVal = Math.min(minVal, result.score);
            maxVal = Math.max(maxVal, result.score);
            sum += result.score;
            if (!genCount[result.genUrl]) {
                genCount[result.genUrl] = 0;
            }
            genCount[result.genUrl] += 1;
            genCount.__total__ += 1;
        });
        minY = Math.min(minVal, minY);
        maxY = Math.max(maxVal, maxY);
        scoreData.push({
            dataType: "max",
            generation: generation,
            score: maxVal,
        });
        scoreData.push({
            dataType: "avg",
            generation: generation,
            score: sum / count,
        });
        scoreData.push({
            dataType: "min",
            generation: generation,
            score: minVal,
        });
        for (const key of Object.keys(genCount)) {
            if (key === "__total__") {
                continue;
            }
            genCountData.push({
                dataType: key.split("/").pop(),
                generation: generation,
                genCount: genCount[key],
            });
        }
    });
    const config = {
        title: {
            visible: true,
            text: "Progress Plot",
        },
        description: {
            visible: true,
            text: "Score Progression over Generations",
        },
        data: [scoreData, genCountData],
        xField: "generation",
        yField: ["score", "genCount"],
        // seriesField: 'dataType',
        // color: ['#cb302d', '#e3ca8c', '#82d1de'],
        xAxis: {
            title: {
                text: "Generation",
            },
        },
        geometryOptions: [
            {
                geometry: "line",
                seriesField: "dataType",
            },
            {
                geometry: "column",
                isStack: true,
                seriesField: "dataType",
                isPercent: false,
            },
        ],

        yAxis: {
            score: {
                min: Math.floor(minY),
                max: Math.ceil(maxY),
                title: {
                    text: "Score",
                },
            },
            genCount: {
                title: {
                    text: "Gen File Count",
                },
            },
        },
    };
    return <DualAxes {...config} />;
}

function ProgressPlot({ jobSettings, jobResults }) {
    const plotData = JSON.parse(JSON.stringify(jobResults));

    let minY = Infinity,
        maxY = -Infinity;
    plotData.forEach((result) => {
        if (result.score) {
            minY = Math.min(minY, result.score);
            maxY = Math.max(maxY, result.score);
        }
        result.genFile = result.genUrl.split("/").pop() + " - " + (result.live ? "live" : "dead");
        result.generation = result.generation.toString();
    });
    const config = {
        title: {
            visible: true,
            text: "Progress Plot",
        },
        description: {
            visible: true,
            text: "Score Progression over Generations",
        },
        xAxis: {
            title: {
                text: "Generation",
            },
        },
        yAxis: {
            score: {
                min: Math.floor(minY),
                max: Math.ceil(maxY),
            },
        },
        data: plotData,
        xField: "generation",
        yField: "score",
        shape: "circle",
        colorField: "genFile",
        appendPadding: 10,
        size: 4,
    };
    return <Scatter {...config} />;
}

function ScorePlot({ jobResults }) {
    const plotData = JSON.parse(JSON.stringify(jobResults));
    let minY,
        maxY = 0;

    const regionAnnotations = [];
    plotData.forEach((result) => {
        if (result.score) {
            if (!minY) {
                minY = result.score;
            }
            minY = Math.min(minY, result.score);
            maxY = Math.max(maxY, result.score);
        }
        result.genFile = result.genUrl.split("/").pop() + " - " + (result.live ? "live" : "dead");

        if (result.generation % 2 === 1) {
            return;
        }
        if (regionAnnotations.length === 0 || regionAnnotations[regionAnnotations.length - 1].gen !== result.generation) {
            regionAnnotations.push({
                type: "region",
                start: [(Number(result.GenID) / jobResults.length) * 100 + "%", "0%"],
                end: [((Number(result.GenID) + 1) / jobResults.length) * 100 + "%", "100%"],
                gen: result.generation,
            });
        } else {
            regionAnnotations[regionAnnotations.length - 1].end = [((Number(result.GenID) + 1) / jobResults.length) * 100 + "%", "100%"];
        }
    });

    const config = {
        title: {
            visible: true,
            text: "Score Plot",
        },
        description: {
            visible: true,
            text: "Evaluated score over generations",
        },
        height: 450,
        data: [plotData, plotData],
        xField: "GenID",
        yField: ["score", "generation"],
        geometryOptions: [
            {
                geometry: "column",
                seriesField: "genFile",
            },
            {
                geometry: "line",
            },
        ],
        padding: [20, 30, 60, 30],
        limitInPlot: false,
        meta: {
            GenID: { sync: false },
            generation: { min: 0 },
        },
        yAxis: {
            score: {
                title: {
                    text: "Score",
                },
            },
            generation: {
                title: {
                    text: "Generation",
                },
            },
        },
        slider: {},
        tooltip: {
            customContent: (title, data) => {
                if (data.length === 0) {
                    return "";
                }
                let img_url = "";
                getS3Public(
                    data[0].data.owner + "/" + data[0].data.JobID + "/" + data[0].data.id + "_eval.png",
                    (url) => {
                        img_url = url;
                    },
                    () => {}
                );
                const params = JSON.parse(data[0].data.params);
                const paramString = Object.keys(params)
                    .map((key) => {
                        return '<li style="margin-left: 20px;">' + key + ": " + params[key] + "</li>";
                    })
                    .join("\n");
                return `<div style="padding: 10px 0px 10px 0px;">
                    <h3 style="margin-bottom: 15px;">${title}</h3>
                    <p>Status: ${data[0].data.live ? "live" : "dead"}</p>
                    <p>Generation: ${data[0].data.generation}</p>
                    <p>Score: ${data[0].data.score}</p>
                    <p style="margin-bottom: 0px;">Parameters:</p>
                    ${paramString}
                    <br>
                    <img src="${img_url}" width="300" height="200" >
                </div>`;
            },
        },
    };
    if (minY && maxY) {
        config.yAxis.score = {
            title: {
                text: "Score",
            },
            min: Math.floor(minY),
            max: Math.ceil(maxY),
        };
    }

    return (
        <DualAxes
            {...config}
            onReady={(plot) => {
                plot.on("plot:click", (evt) => {
                    const { x, y } = evt;
                    const tooltipData = plot.chart.getTooltipItems({ x, y });
                    if (tooltipData.length === 0) {
                        return;
                    }
                    const data = tooltipData[0].data;
                    getS3Public(
                        data.owner + "/" + data.JobID + "/" + data.id + "_eval.gi",
                        (url) => {
                            document.getElementById("hiddenInput").value = url;
                            document.getElementById("hiddenButton").click();
                        },
                        () => {}
                    );
                    updateTextArea(assembleModelText(data));
                    if (evt.data && evt.data.data) {
                        updateSelectedResult(evt.data.data.owner + "/" + evt.data.data.JobID + "/" + evt.data.data.id);
                    }
                });
            }}
        />
    );
}

function ResultTable({ jobResults, contextForm }) {
    const columns = [
        {
            title: "ID",
            dataIndex: "genID",
            key: "genID",
            defaultSortOrder: "ascend",
            width: 50,
            fixed: "left",
            sorter: (a, b) => a.genID - b.genID,
        },
        {
            title: "Parameters",
            dataIndex: "params",
            key: "params",
            width: 300,
            fixed: "left",
        },
        {
            title: "Gen File",
            dataIndex: "genFile",
            key: "genFile",
        },
        {
            title: "Generation",
            dataIndex: "generation",
            key: "generation",
            sorter: (a, b) => a.generation - b.generation,
        },
        {
            title: "Last Survived Generation",
            dataIndex: "survivalGeneration",
            key: "survivalGeneration",
            sorter: (a, b) => a.survivalGeneration - b.survivalGeneration,
        },
        {
            title: "Live",
            dataIndex: "live",
            key: "live",
            sorter: (a, b) => b.live.length - a.live.length,
        },
        {
            title: "Score",
            dataIndex: "score",
            key: "score",
            sorter: (a, b) => a.score - b.score,
        },
        {
            title: "Gen Model",
            dataIndex: "genModel",
            key: "genModel",
            width: 100,
            fixed: "right",
            align: "center",
            render: (genModel, allData) => (
                <div>
                    <View
                        onClick={() => {
                            document.getElementById("hiddenInput").value = genModel;
                            viewModel(genModel, [contextForm.getFieldValue("contextURL")]);
                            updateTextArea(allData.resultText);
                            updateSelectedResult(genModel.split("/public/").pop().replace(".gi", ""));
                        }}
                    />
                </div>
            ),
        },
        {
            title: "Eval Model",
            dataIndex: "evalModel",
            key: "evalModel",
            width: 100,
            fixed: "right",
            align: "center",
            render: (evalModel, allData) => (
                <div>
                    <View
                        onClick={() => {
                            document.getElementById("hiddenInput").value = evalModel;
                            viewModel(evalModel, [contextForm.getFieldValue("contextURL")]);
                            updateTextArea(allData.resultText);
                            updateSelectedResult(evalModel.split("/public/").pop().replace("_eval.gi", ""));
                        }}
                    />
                </div>
            ),
        },
    ];
    const errorRows = [];
    const tableData = jobResults.map((entry) => {
        let paramsString = "";
        if (entry.params) {
            paramsString = entry.params
                .replace(/\{|\}|"/g, "")
                .replace(/,|,\s/g, " \n")
                .replace(/:/g, ": ");
        }
        const tableEntry = {
            id: entry.id,
            genID: entry.GenID,
            genFile: entry.genUrl.split("/").pop(),
            live: entry.live ? "True" : "False",
            generation: entry.generation,
            survivalGeneration: entry.survivalGeneration ? entry.survivalGeneration : 0,
            params: paramsString,
            score: entry.score,
            rowClass: entry.errorMessage ? "error-row" : "default-row",
            genModel: "",
            evalModel: "",
            resultText: assembleModelText(entry),
        };
        getS3Public(
            entry.owner + "/" + entry.JobID + "/" + entry.id,
            (data) => {
                tableEntry.genModel = data + ".gi";
                tableEntry.evalModel = data + "_eval.gi";
            },
            () => {}
        );

        if (entry.errorMessage) {
            errorRows.push(entry.GenID);
        }
        return tableEntry;
    });
    return (
        <Table
            style={{ whiteSpace: "pre" }}
            dataSource={tableData}
            columns={columns}
            rowKey="genID"
            rowClassName={(record, index) => record.rowClass}
            size="small"
            scroll={{ x: 1500 }}
            sticky
        />
    );
}

function ErrorList({ jobSettings, jobResults }) {
    const [alertOpened, setAlertOpened] = useState(true);
    const toggleAlert = () => setAlertOpened((currentState) => !currentState);
    if (!alertOpened) {
        return (
            <Alert
                message="ERRORS"
                type="error"
                description="..."
                action={
                    <Button size="small" type="text" onClick={toggleAlert} danger>
                        Show More
                    </Button>
                }
            />
        );
    }
    let errors = [];
    if (jobSettings.jobStatus !== "cancelled") {
        return <></>;
    }
    let count = 0;
    jobResults.forEach((result) => {
        if (result.errorMessage) {
            const errStr = "id-" + result.GenID + ": " + result.errorMessage;
            errors.push(errStr);
            errors.push(<br key={count.toString()} />);
            count += 1;
        }
    });
    return (
        <Alert
            message="ERRORS"
            type="error"
            description={<code>{errors}</code>}
            action={
                <Button size="small" type="text" onClick={toggleAlert} danger>
                    Collapse
                </Button>
            }
        />
    );
}

function ViewTextArea({ jobSettings, contextForm }) {
    const [modelText, setModelText] = useState("");
    const [selectedJobResult, setSelectedJobResult] = useState(null);

    function updateTextArea() {
        setModelText(document.getElementById("hiddenInputText").value);
    }
    function updateSelectedResult() {
        setSelectedJobResult(document.getElementById("hiddenInputText").value);
    }
    function viewGIModel() {
        const val = document.getElementById("hiddenInput").value;
        viewModel(val, [contextForm.getFieldValue("contextURL")]);
    }
    function updateContextURL() {
        const val = contextForm.getFieldValue("tempContextURL");
        contextForm.setFieldsValue({ contextURL: val });
        document.getElementById("hiddenButton").click();
        if (!jobSettings.run) {
            const otherSettings = jobSettings.other_settings ? JSON.parse(jobSettings.other_settings) : {};
            otherSettings.contextURL = val;
            API.graphql(
                graphqlOperation(updateJob, {
                    input: {
                        id: jobSettings.id,
                        other_settings: JSON.stringify(otherSettings),
                        run: false,
                    },
                })
            ).catch((err) => console.log({ cancelJobError: err }));
        }
    }

    useEffect(() => {
        if (jobSettings && jobSettings.other_settings) {
            const otherSettings = JSON.parse(jobSettings.other_settings);
            if (otherSettings.contextURL) {
                contextForm.setFieldsValue({
                    contextURL: otherSettings.contextURL,
                    tempContextURL: otherSettings.contextURL,
                });
            }
        }
    }, [jobSettings]);

    async function downloadSelectedModel(isGen = false) {
        if (!selectedJobResult) {
            notify("Unable to Download!", "No result was selected, unable to download gi model.", true);
            return;
        }
        let url;
        getS3Public(
            selectedJobResult + (isGen ? ".gi" : "_eval.gi"),
            (data) => (url = data),
            () => (url = "")
        );
        await fetch(url).then((t) => {
            return t.blob().then((b) => {
                const a = document.getElementById("hiddenLink");
                a.href = URL.createObjectURL(b);
                a.setAttribute("download", selectedJobResult.split("/").pop() + (isGen ? "_gen" : "_eval") + ".gi");
                a.click();
            });
        });
    }
    async function openViewerInNewTab(isGen = false) {
        if (!selectedJobResult) {
            notify("Unable to Download!", "No result was selected, unable to download gi model.", true);
            return;
        }
        let url;
        getS3Public(
            selectedJobResult + (isGen ? ".gi" : "_eval.gi"),
            (data) => (url = data),
            () => (url = "")
        );
        const a = document.getElementById("hiddenLink");
        a.href = MOBIUS_VIEWER_URL + "?file=" + url;
        a.setAttribute("download", null);
        a.target = "_blank";
        a.click();
    }
    return (
        <>
            <Iframe url={MOBIUS_VIEWER_URL} width="100%" height="600px" id="mobius_viewer" />
            <br></br>
            <Space direction="horizontal" size="large" style={{ width: "100%" }} align="start">
                <div className="hiddenElement">
                    <Button id="hiddenUpdateTextAreaButton" onClick={updateTextArea}>
                        apply
                    </Button>
                    <Button id="hiddenUpdateSelectedResultButton" onClick={updateSelectedResult}>
                        apply
                    </Button>
                    <textarea id="hiddenInputText"></textarea>

                    <input id="hiddenInput"></input>
                    <Button id="hiddenButton" onClick={viewGIModel}>
                        apply
                    </Button>

                    <a id="hiddenLink"></a>
                </div>
                <Input.TextArea className="textArea" value={modelText} autoSize={true}></Input.TextArea>
                <Space direction="vertical">
                    <Form name="basic" form={contextForm}>
                        <Space direction="horizontal">
                            <Form.Item className="no-margin-form-item" label="Context Url" name="tempContextURL">
                                <Input />
                            </Form.Item>
                            <Button onClick={updateContextURL}>apply</Button>
                        </Space>
                    </Form>
                    <Button onClick={() => downloadSelectedModel(true)}>Download Gen</Button>
                    <Button onClick={() => downloadSelectedModel()}>Download Eval</Button>
                    <Button onClick={() => openViewerInNewTab(true)}>Open Gen model In New Browser</Button>
                    <Button onClick={() => openViewerInNewTab()}>Open Eval model In New Browser</Button>
                </Space>
            </Space>
        </>
    );
}

function JobResults() {
    const [jobID, setJobID] = useState(null);
    const [modelParams, setModelParams] = useState([]);
    const [jobSettings, setJobSettings] = useState(null);
    const [jobResults, setJobResults] = useState([]);
    const [filteredJobResults, setFilteredJobResults] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { cognitoPayload } = useContext(AuthContext);
    const [contextForm] = Form.useForm();

    useEffect(() => {
        const jobID = QueryString.parse(window.location.hash).id;
        setJobID(jobID);
        getData(jobID, cognitoPayload.sub, setJobSettings,setJobResults).then(() => setIsLoading(false))
            .catch((err) => console.log(err));
    }, [cognitoPayload]);


    const CancelJob = () => {
        function cancelJob() {
            API.graphql(
                graphqlOperation(updateJob, {
                    input: {
                        id: jobID,
                        jobStatus: "cancelling",
                        run: false,
                    },
                })
            ).catch((err) => console.log({ cancelJobError: err }));
        }
        return (
            <Popconfirm
                placement="topRight"
                title="Stop Process?"
                onConfirm={cancelJob}
                icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                okText="Yes"
                cancelText="No"
            >
                <Button type="primary" danger>
                    Stop Process
                </Button>
            </Popconfirm>
        );
    };
    function getDisplayUrlString(data, isGen = false) {
        if (!data) {
            return "";
        }
        let urlString = "";
        if (isGen) {
            urlString = data.map((url) => url.split("/").pop()).join(", ");
            return urlString;
        }
        urlString = data.split("/").pop();
        return urlString;
    }

    const genExtra = (part) => <Help page="result_page" part={part}></Help>;
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
    ];
    let genTableData = [];
    if (jobSettings) {
        genTableData = jobSettings.genUrl.map((genUrl) => {
            const genFile = genUrl.split("/").pop();
            const genTableEntry = {
                genUrl: genUrl,
                genFile: genFile,
                numItems: jobResults.filter((result) => result.genUrl === genUrl).length,
                liveItems: jobResults.filter((result) => result.genUrl === genUrl && result.live === true).length,
            };
            return genTableEntry;
        });
    }

    const expandedSettings = ["Max_Designs", "Population_Size", "Tournament_Size"];

    const pastSettingsColumns = [
        {
            title: "Start Time",
            dataIndex: "runStart",
            key: "runStart",
            defaultSortOrder: "descend",
            fixed: "left",
            width: 120,
            render: (isoTime) => new Date(isoTime).toLocaleString(),
        },
        {
            title: "End Time",
            dataIndex: "runEnd",
            key: "runEnd",
            width: 120,
            fixed: "left",
            render: (isoTime) => new Date(isoTime).toLocaleString(),
        },
        {
            title: "Run Duration",
            dataIndex: "runTime",
            key: "runTime",
            width: 120,
            fixed: "left",
            render: (runDuration) => {
                const minutes = Math.floor(runDuration / 60);
                const seconds = Math.floor(runDuration - minutes * 60);
                if (minutes === 0) {
                    return seconds + " secs";
                }
                if (minutes === 1) {
                    return "1 min " + seconds + " secs";
                }
                return minutes + " mins " + seconds + " secs";
            },
        },
        {
            title: "Status",
            dataIndex: "status",
            width: 100,
            key: "status",
        },
        {
            title: "Gen File(s)",
            dataIndex: "genUrl",
            key: "genFile",
            render: (urls) => (
                <>
                    {urls.map((text) => {
                        const filekey = text.split("/").pop();
                        return <p key={filekey}>{filekey}</p>;
                    })}
                </>
            ),
        },
        {
            title: "Eval File",
            dataIndex: "evalUrl",
            key: "evalFile",
            render: (text) => <p>{text.split("/").pop()}</p>,
        },
        {
            title: "Settings",
            dataIndex: "max_designs",
            key: "evalFile",
            render: (_, data) => {
                let max_designs, population_size, tournament_size, mutation_sd;
                if (data.run_settings) {
                    max_designs = data.run_settings.max_designs;
                    population_size = data.run_settings.population_size;
                    tournament_size = data.run_settings.tournament_size;
                    mutation_sd = data.run_settings.mutation_sd;
                } else {
                    max_designs = data.max_designs;
                    population_size = data.population_size;
                    tournament_size = data.tournament_size;
                    mutation_sd = data.mutation_sd;
                }
                return (
                    <>
                        <p key="md">{`max designs: ${max_designs}`}</p>
                        <p key="ps">{`population size: ${population_size}`}</p>
                        <p key="ts">{`tournament size: ${tournament_size}`}</p>
                        <p key="msd">{`mutation standard deviation: ${mutation_sd}`}</p>
                    </>
                );
            },
        },
    ];
    let pastSettingsData = [];
    let numGen = 0;
    if (jobSettings) {
        pastSettingsData = JSON.parse(jobSettings.history);
        jobResults.forEach((r) => {
            numGen = Math.max(numGen, r.generation);
        });
    }

    return (
        <Space direction="vertical" size="large" style={{ width: "inherit" }}>
            <br></br>
            <Spin spinning={isLoading}>
                {jobSettings ? (
                    <>
                        <Row>
                            <h1>Search: {jobSettings.description}</h1>
                        </Row>
                        <Tabs defaultActiveKey="1" size="large">
                            <TabPane tab="Results" key="1">
                                {!isLoading ? (
                                    <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                        <ErrorList jobResults={jobResults} jobSettings={jobSettings}></ErrorList>
                                        <Collapse defaultActiveKey={["4", "5"]}>
                                            <Collapse.Panel header="Filter Form" key="1" extra={genExtra("result_filter_form")}>
                                                <FilterForm
                                                    modelParamsState={{ modelParams, setModelParams }}
                                                    jobResultsState={{ jobResults, setJobResults }}
                                                    filteredJobResultsState={{ filteredJobResults, setFilteredJobResults }}
                                                    setIsLoadingState={{ isLoading, setIsLoading }}
                                                />
                                            </Collapse.Panel>
                                            <Collapse.Panel header="Progress Plot" key="2" extra={genExtra("result_progress_plot")}>
                                                {/* <ProgressPlot
                                                    jobSettings={jobSettings}
                                                    jobResults={filteredJobResults ? filteredJobResults : jobResults}
                                                /> */}
                                                <MinMaxPlot jobResults={filteredJobResults ? filteredJobResults : jobResults} />
                                            </Collapse.Panel>
                                            <Collapse.Panel header="Parallel Plot" key="3" extra={genExtra("result_parallel_plot")}>
                                                <ParallelPlot jobResults={filteredJobResults ? filteredJobResults : jobResults} />
                                            </Collapse.Panel>
                                            <Collapse.Panel header="Score Plot" key="4" extra={genExtra("result_score_plot")}>
                                                <ScorePlot jobResults={filteredJobResults ? filteredJobResults : jobResults} />
                                            </Collapse.Panel>
                                            <Collapse.Panel header="Mobius Viewer" key="5" extra={genExtra("result_mobius_viewer")}>
                                                <ViewTextArea jobSettings={jobSettings} contextForm={contextForm}></ViewTextArea>
                                            </Collapse.Panel>
                                            <Collapse.Panel header="Result Table" key="6" extra={genExtra("result_result_table")}>
                                                <ResultTable
                                                    jobResults={filteredJobResults ? filteredJobResults : jobResults}
                                                    contextForm={contextForm}
                                                />
                                            </Collapse.Panel>
                                        </Collapse>
                                    </Space>
                                ) : null}
                            </TabPane>
                            <TabPane tab="Settings" key="2">
                                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                    <Collapse defaultActiveKey={["1", "2"]}>
                                        <Collapse.Panel header="Search Settings" key="1" extra={genExtra("settings_job_settings")}>
                                            <Descriptions
                                                bordered={true}
                                                size="small"
                                                column={1}
                                                style={{
                                                    color: "rgba(0,0,0,0.5)",
                                                }}
                                            >
                                                <Descriptions.Item label="ID" key="id">
                                                    {jobSettings.id}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Description" key="description">
                                                    {jobSettings.description}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Last Modified" key="updatedAt">
                                                    {new Date(jobSettings.updatedAt).toLocaleString()}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Gen File(s)" key="genFile">
                                                    {getDisplayUrlString(jobSettings.genUrl, true)}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Eval File(s)" key="evalFile">
                                                    {getDisplayUrlString(jobSettings.evalUrl)}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Number of Generations" key="num_gen">
                                                    {numGen}
                                                </Descriptions.Item>
                                                {expandedSettings.map((dataKey) => (
                                                    <Descriptions.Item label={dataKey.replace(/_/g, " ")} key={dataKey}>
                                                        {jobSettings[dataKey.toLowerCase()]}
                                                    </Descriptions.Item>
                                                ))}
                                                <Descriptions.Item label="Mutation Standard Deviation" key="mutation_sd">
                                                    {jobSettings.mutation_sd}
                                                </Descriptions.Item>
                                                {/* <Descriptions.Item label="expiration" key="expiration">
                                                {String(Number(jobSettings.expiration) / 86400) + ' day(s)'}
                                            </Descriptions.Item> */}
                                            </Descriptions>
                                        </Collapse.Panel>
                                        <Collapse.Panel header="Generative Details" key="2" extra={genExtra("settings_gen_details")}>
                                            <Table dataSource={genTableData} columns={genTableColumns} rowKey="genUrl"></Table>
                                        </Collapse.Panel>
                                        <Collapse.Panel header="Past Settings" key="3" extra={genExtra("settings_past_settings")}>
                                            <Table
                                                dataSource={pastSettingsData}
                                                columns={pastSettingsColumns}
                                                rowKey="runStart"
                                                scroll={{ x: 1000 }}
                                                sticky
                                            ></Table>
                                        </Collapse.Panel>
                                    </Collapse>
                                </Space>
                            </TabPane>
                            <TabPane tab="Resume" key="3">
                                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                    {jobSettings && (jobSettings.jobStatus === "completed" || jobSettings.jobStatus === "cancelled") ? (
                                        <ResumeForm
                                            jobID={jobID}
                                            jobSettingsState={{ jobSettings, setJobSettings }}
                                            jobResultsState={{ jobResults, setJobResults }}
                                            getData={getData}
                                            setIsLoading={setIsLoading}
                                        />
                                    ) : (
                                        <></>
                                    )}
                                    {jobSettings && jobSettings.jobStatus === "inprogress" ? <CancelJob /> : <></>}
                                </Space>
                            </TabPane>
                        </Tabs>
                        <br />
                        <br />
                    </>
                ) : null}
            </Spin>
        </Space>
    );
}

export default JobResults;
