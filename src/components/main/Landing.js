import React, { useContext, useEffect } from "react";
import "./Landing.css";
import { Auth } from "aws-amplify";
import { onAuthUIStateChange } from "@aws-amplify/ui-components";
import { AuthContext } from "../../Contexts";
import { AmplifyAuthenticator, AmplifySignIn } from "@aws-amplify/ui-react";
import { Space, Collapse, Row, Col, Typography, Button, Descriptions, Checkbox } from "antd";
import { Link } from 'react-router-dom';
import { UploadOutlined } from "@ant-design/icons";

function NotAuthenticated() {
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
    useEffect(() => onAuthUIStateChange(authUser));

    return (
        // <AmplifyAuthenticator usernameAlias="email">
        //   <AmplifySignUp
        //     slot="sign-up"
        //     usernameAlias="email"s
        //     headerText="Create a Mobius-exo Account"
        //     formFields={[
        //       {
        //         type: "email",
        //         label: "E-mail",
        //         placeholder: "email@email.mail",
        //         required: true
        //       },
        //       {
        //         type: "password",
        //         label: "Password",
        //         placeholder: "********",
        //         required: true
        //       },
        //       {
        //         type: "nickname",
        //         label: "How should we address you?",
        //         placeholder: "nickname",
        //         required: true
        //       }
        //     ]}
        //   />
        //   <AmplifySignIn
        //     slot="sign-in"
        //     usernameAlias="email"
        //     headerText="Get started!"
        //   />
        // </AmplifyAuthenticator>
        <AmplifyAuthenticator usernameAlias="email">
            <AmplifySignIn slot="sign-in" usernameAlias="email" headerText="Get started!" hideSignUp />
        </AmplifyAuthenticator>
    );
}

function LandingArticle() {
    return (
        <article id="landing-article">
            <h1>Evolutionary Analysis of Mobius Parametric Models</h1>
            <p></p>
            <Space size="middle">
                <a href="https://mobius.design-automation.net/gallery">Mobius Modeller</a>
                <a type="link" href="http://design-automation.net">
                    Design Automation Lab
                </a>
            </Space>
        </article>
    );
}

function GettingStarted() {
    return (
        <article>
            <h1>Getting Started</h1>
            <Collapse 
                // accordion
                bordered={false}
                >
                <Collapse.Panel header="1. Download js files" key="1">
                    Mobius Evolver requires two types of js files created in Mobius Modeller:
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
                <Collapse.Panel header="2. Create New Search" key="2">
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
                <Collapse.Panel header="3. Search Settings" key="3">
                    <Descriptions column={1} bordered={true}>
                        <Descriptions.Item label="Description">Short Description for New Search</Descriptions.Item>
                        <Descriptions.Item label="Number of Designs">Number of Generations</Descriptions.Item>
                        <Descriptions.Item label="Population Size">Total population in each Generation, regardless of species</Descriptions.Item>
                        <Descriptions.Item label="Tournament Size">Number of individuals selected at random for mutation, regardless of species</Descriptions.Item>
                        <Descriptions.Item label="Survival Size">Number of fittest individuals to survive to the next Generation, regardless of species</Descriptions.Item>
                    </Descriptions>
                </Collapse.Panel>
                <Collapse.Panel header="4. Upload Gen and Eval Files" key="4">
                    <Descriptions column={1} bordered={true}>
                        <Descriptions.Item label="Upload Generation and Evaluation Files. Multiple files may be uploaded at a time.">
                            <Button>
                                <UploadOutlined /> Upload File
                            </Button>
                        </Descriptions.Item>
                    </Descriptions>
                </Collapse.Panel>
                <Collapse.Panel header="5. Start Search" key="5">
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
                <Collapse.Panel header="6. Go to Results Page and explore" key="6">
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Results">
                            <ul>
                                <li>Filter Form: Filter Generations with parameters and score ranges</li>
                                <li>Progress Plot: </li>
                                <li>Score Plot: Bar plot of each generation score</li>
                                <li>Mobius Viewer: Preview Generated or Evaluated Model</li>
                                <li>Result Table: Results in Table format</li>
                            </ul>
                        </Descriptions.Item>
                        <Descriptions.Item label="Settings">Search Settings used for search</Descriptions.Item>
                        <Descriptions.Item label="Resume">Continue search from results. Search settings may be changed and new files may be added or replaced.</Descriptions.Item>
                    </Descriptions>
                </Collapse.Panel>
            </Collapse>
        </article>
    )
}

function Landing() {
    return (
        <div id="landing-container">
            <Row style={{width:"100%"}}>
                <Col md={12}>
                    <section>
                        <LandingArticle/>
                        <hr/>
                        <GettingStarted />
                    </section>
                </Col>
                <Col md={12}>
                    {!useContext(AuthContext).cognitoPayload ? <NotAuthenticated /> : null}
                </Col>
            </Row>
        </div>
    );
}

export default Landing;
