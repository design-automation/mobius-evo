import React, { useContext, useEffect, useState } from "react";
import "./Landing.css";
import { Auth } from "aws-amplify";
import { onAuthUIStateChange } from "@aws-amplify/ui-components";
import { AuthContext } from "../../Contexts";
import { AmplifyAuthenticator, AmplifySignIn, AmplifySignUp } from "@aws-amplify/ui-react";
import { Space, Collapse, Row, Col, Typography, Button, Descriptions, Checkbox, Affix } from "antd";
import { Link } from 'react-router-dom';
import { UploadOutlined } from "@ant-design/icons";
import { getSettingsFile } from "../../amplify-apis/userFiles";
import awsExports from '../../aws-exports'

function Landing() {
    function NotAuthenticated() {
        const [hideSignUp, setHideSignUp] = useState(true);

        const setCognitoPayload = useContext(AuthContext).setCognitoPayload;
        async function authUser() {
            try {
                let currSession = await Auth.currentSession();
                setCognitoPayload(currSession.getIdToken().payload);
            } catch (err) {
                if (err !== "No current user") {
                    // no current user on page load
                    alert(err);
                }
            }
        }

        useEffect(() => {
            let isMounted = true;
            onAuthUIStateChange(authUser)
            let settingFile;
            getSettingsFile(response => settingFile = response, () => settingFile = null).then(()=>{
                if (!isMounted) return;
                if (settingFile) {
                    try {
                        const settings = JSON.parse(settingFile);
                        console.log(settings)
                        setHideSignUp(settings.hideSignUp);
                    } catch(ex) {}
                } else {
                    setHideSignUp(false);
                }
            })
            return () => { isMounted = false };
        });

        return (
            <AmplifyAuthenticator usernameAlias="email">
                <AmplifySignUp
                    slot="sign-up"
                    usernameAlias="email"s
                    headerText="Create a Mobius-evo Account"
                    formFields={[
                    {
                        type: "email",
                        label: "E-mail",
                        placeholder: "email@email.mail",
                        required: true
                    },
                    {
                        type: "password",
                        label: "Password",
                        placeholder: "********",
                        required: true
                    },
                    {
                        type: "nickname",
                        label: "How should we address you?",
                        placeholder: "nickname",
                        required: true
                    }
                    ]}
                />
                <AmplifySignIn slot="sign-in" usernameAlias="email" headerText="Get started!" hideSignUp={hideSignUp}/>
            </AmplifyAuthenticator>
        );
    }
    function Authenticated() {
        if (awsExports.aws_user_files_s3_bucket && awsExports.aws_user_files_s3_bucket_region) {
            const dashboardName = 'evoInfo' + awsExports.aws_user_files_s3_bucket.split('userfiles131353')[1];
            return <a 
                target="_blank"
                href={`https://console.aws.amazon.com/cloudwatch/home?region=${awsExports.aws_user_files_s3_bucket_region}#dashboards:name=${dashboardName}`}>
                Monitor Möbius Evolver data usage
            </a>
        }
    }
    function LandingSection() {
        return (
            <section>
                <Typography.Title level={3}>What is Möbius Evolver?</Typography.Title>
                <Typography.Paragraph>
                    Möbius Evolver is an open-source web-app for designers to optimize 3D parametric models.
                    The app runs on the Amazon AWS Clouding Computing platform.
                </Typography.Paragraph>
                <Collapse defaultActiveKey={["1", "2", "3", "4", "5", "6", "7"]}>

                    <Collapse.Panel header="Optimisation Algorithm" key="1">
                        <Typography.Paragraph>
                            For the optimization process, an Evolutionary Programming (EP) algorithm is used.
                            EP is one of the four major evolutionary algorithm paradigms.
                            It was first used by Lawrence J. Fogel in the US in 1960s as a learning process aiming to generate artificial intelligence (<Typography.Link href="https://en.wikipedia.org/wiki/Evolutionary_programming">Wikipedia</Typography.Link>).
                            EP focuses on the evolution of distinct species.
                        </Typography.Paragraph>
                    </Collapse.Panel>

                    <Collapse.Panel header="Reflective Intelligence Amplification" key="2" >
                        <Typography.Paragraph>
                            Möbius Evolver supports a human-in-the-loop optimization approach.
                            In this approach, the designer and computer are working together as two actors, each doing what they do best.
                            The aim is to amplify the intelligence of the designer, through a cyclical exchange between the human and computer.
                        </Typography.Paragraph>
                        <Typography.Paragraph>
                            In this exchange, each actor has a specific task to perform. 
                            <ul>
                                <li>The task for the designer is to specify the design rules and design goals that will drive the optimization process. </li>
                                <li>The task of the computer is to search for optimal designs, using the evolutionary algorithm. </li>
                            </ul>
                        </Typography.Paragraph>
                        <Typography.Paragraph>
                            A cyclical process emerges, where the designer and computer take turns to perform their respective tasks.
                            The designer will start by specifying an initial set of rules and goals.
                            The computer will then execute the search process, and within a few minutes, return a population of optimized designs.
                            The designer will then reflect on the optimized designs and will most likely see certain deficiencies.
                            They can then modify the rules and goals, and pass these back to the computer.
                            The computer will execute a new search process, thereby producing more optimized designs. 
                            This can continue until the designer is satisfied with the results. 
                        </Typography.Paragraph>
                    </Collapse.Panel>

                    <Collapse.Panel header="Rules and Goals" key="3">
                        <Typography.Paragraph>
                            To specify the rules and goals required for a search process, the designer needs to create two types of scripts: one or more generative scripts, and one evaluative script. 
                            <ul>
                                <li>The generative script has a set of parameters, an generates design models. Varying the parameters will vary the models that are generated,</li>
                                <li>The evaluative script analyses a 3D model can calculates an overall score based on a set of performance criteria. </li>
                            </ul>
                        </Typography.Paragraph>
                        <Typography.Paragraph>
                            These scripts can be created using Möbius Modeller. 
                            Möbius Modeller is an open-source web application for 3D parametric modelling. 
                            The app allows users to create modelling procedures using the Obi visual programming language. 
                            In the Obi language, you write computer programs by drawing flowcharts and by defining procedures using 'click and fill-in-the-blanks' coding.
                        </Typography.Paragraph>
                        <Typography.Paragraph>
                            Once the designer has created the scripts, they can upload them to Möbius Evolver, set a few settings and start the search process.
                        </Typography.Paragraph>
                    </Collapse.Panel>

                    <Collapse.Panel header="Cloud Computing" key="4">
                        <Typography.Paragraph>
                            Möbius Evolver executes the evolutionary algorithm in the cloud, executing all the scripts in parallel.
                            This allows the search process to be massively speeded up.
                            Evolving a 1000 design will take just two or three minutes. 
                        </Typography.Paragraph>
                        <Typography.Paragraph>
                            This speed of execution is vital in order to keep the design process alive.
                            When the designer only needs to wait a few minutes to get back the optimised designs, there is no disruption to their thought process and ideas. 
                        </Typography.Paragraph>
                    </Collapse.Panel>

                    <Collapse.Panel header="Getting Started" key="7">
                        <Collapse 
                            // accordion
                            bordered={false}
                            >
                            <Collapse.Panel header="1. Download js files" key="a">
                                Möbius Evolver requires two types of js files created in Möbius Modeller:
                                <Row gutter={20}>
                                    <Col md={12}>
                                        <ol>
                                            <li>Generation File
                                                <ul>
                                                    <li>Creates the model which will be evaluated</li>
                                                    <li>Parameters to be used in the evolution should be set with sliders in the start node</li>
                                                    <li>Final gi model should be saved to the Local Storage with <code>io.Export</code></li>
                                                    <li>Each iteration from a generation file is called an "individual", and its type is called a "species"</li>
                                                </ul>
                                            </li>
                                            <li>Evaluation File
                                                <ul>
                                                    <li>Reads the generated gi model from Local Storage with <code>io.Import</code> in the START NODE</li>
                                                    <li>The evaluation file should return an Object with a single numerical score.</li>
                                                </ul>
                                            </li>
                                        </ol>
                                    </Col>
                                    <Col md={12}>
                                        <img src={process.env.PUBLIC_URL + '/images/mobius_modeller_saveJS.png'}
                                            height={"200px"}
                                        />
                                    </Col>
                                </Row>
                                <Space>
                                    <Typography.Link>Example Gen File</Typography.Link>
                                    <Typography.Link>Example Eval File</Typography.Link>
                                </Space>
                            </Collapse.Panel>
                            <Collapse.Panel header="2. Create New Search" key="b">
                                <Descriptions column={1} bordered={true}>
                                    <Descriptions.Item label="Past Search Spaces may be accessed from the top menu">
                                        <Button type="text">
                                            <Link to={`/searches`} target="_blank">Search Spaces</Link>
                                        </Button>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="A New Search may be started from the page">
                                        <Button type="primary">
                                            <Link to={`/new-job`} target="_blank">Create New Search</Link>
                                        </Button>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Collapse.Panel>
                            <Collapse.Panel header="3. Search Settings" key="c">
                                <Descriptions column={1} bordered={true}>
                                    <Descriptions.Item label="Description">Short Description for New Search</Descriptions.Item>
                                    <Descriptions.Item label="Number of Designs">Number of Generations</Descriptions.Item>
                                    <Descriptions.Item label="Population Size">Total population in each Generation, regardless of species</Descriptions.Item>
                                    <Descriptions.Item label="Tournament Size">Number of individuals selected at random for mutation, regardless of species</Descriptions.Item>
                                    <Descriptions.Item label="Mutation Standard Deviation">The standard deviation value that determines the variation in the mutated values of individuals' parameters</Descriptions.Item>
                                </Descriptions>
                            </Collapse.Panel>
                            <Collapse.Panel header="4. Upload Gen and Eval Files" key="d">
                                <Descriptions column={1} bordered={true}>
                                    <Descriptions.Item label="Upload Generation and Evaluation Files. Multiple files may be uploaded at a time.">
                                        <Button>
                                            <UploadOutlined /> Upload File
                                        </Button>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Collapse.Panel>
                            <Collapse.Panel header="5. Start Search" key="e">
                                <Descriptions column={1} bordered={true}>
                                    <Descriptions.Item label="Ensure at least one Generation file and Evaluation file was selected. More than one Generation file may be selected to compete in a population.">
                                        <Checkbox />
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Start Search">
                                        <Button type="primary">
                                            Start
                                        </Button>
                                    </Descriptions.Item>
                                </Descriptions>                   
                            </Collapse.Panel>
                            <Collapse.Panel header="6. Go to Results Page and explore" key="f">
                                <Descriptions column={1} bordered>
                                    <Descriptions.Item label="Results">
                                        <ul>
                                            <li>Filter Form: Filter Generations with parameters and score ranges</li>
                                            <li>Progress Plot: </li>
                                            <li>Score Plot: Bar plot of each generation score</li>
                                            <li>Möbius Viewer: Preview Generated or Evaluated Model</li>
                                            <li>Result Table: Results in Table format</li>
                                        </ul>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Settings">Search Settings used for search</Descriptions.Item>
                                    <Descriptions.Item label="Resume">Continue search from results. Search settings may be changed and new files may be added or replaced.</Descriptions.Item>
                                </Descriptions>
                            </Collapse.Panel>
                        </Collapse>
                    </Collapse.Panel>

                    <Collapse.Panel header="Links" key="5">
                        <Typography.Paragraph>
                            Möbius Evolver is open-source, under MIT license. The source-code is on GitHub.
                            <ul>
                                <li><Typography.Link href="https://github.com/design-automation/mobius-evo">Möbius Evolver Source Code</Typography.Link></li>
                            </ul>
                        </Typography.Paragraph>
                    </Collapse.Panel>

                    <Collapse.Panel header="Contact Us" key="6">
                        <Typography.Paragraph>
                            Möbius Evolver is being developed by the Design Automation Lab at the National University of Singapore.
                            <ul>
                                <li><Typography.Link href="http://design-automation.net/">Design Automation Lab</Typography.Link></li>
                            </ul>
                        </Typography.Paragraph>
                        <Typography.Paragraph>If you would like to collaborate or get involved, please contact us. </Typography.Paragraph>
                    </Collapse.Panel>
                    
                </Collapse>
            </section>
        )
    }
    return (
        <div id="landing-container">
            <Row >
                <Col md={12}>
                    <LandingSection />
                </Col>
                <Col md={12}>
                    <Affix className="login-container">{!useContext(AuthContext).cognitoPayload ? <NotAuthenticated /> : <Authenticated/>}</Affix>
                </Col>
            </Row>
        </div>
    );
}

export default Landing;
