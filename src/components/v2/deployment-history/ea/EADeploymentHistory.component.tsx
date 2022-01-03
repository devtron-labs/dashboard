import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify';
import { showError, Progressing, ErrorScreenManager,  } from '../../../common';
import docker from '../../../../assets/icons/misc/docker.svg';
import { getDeploymentHistory, HelmAppDeploymentHistoryResponse, HelmAppDeploymentHistory, HelmAppDeploymentDetail } from '../../../external-apps/ExternalAppService';
import { ServerErrors } from '../../../../modals/commonTypes';
import {Moment12HourFormat} from '../../../../config';
import CodeEditor from '../../../CodeEditor/CodeEditor'
import moment from 'moment'
import Tippy from '@tippyjs/react';
import '../../../app/details/cIDetails/ciDetails.scss';
import './ea-deployment-history.scss'

function ExternalAppDeploymentHistory({appId}) {
    const [isLoading, setIsLoading] = useState(true);
    const [errorResponseCode, setErrorResponseCode] = useState(undefined);
    const [deploymentHistoryArr, setDeploymentHistoryArr] = useState<HelmAppDeploymentDetail[]>([]);
    const [selectedDeploymentHistoryIndex, setSelectedDeploymentHistoryIndex] = useState<number>(0);
    const [selectedDeploymentTabIndex, setSelectedDeploymentTabIndex] = useState<number>(0);

    const deploymentTabs: string[] = new Array("Source", "Applied YAML");

    // component load
    useEffect(() => {
        getDeploymentHistory(appId)
            .then((deploymentHistoryResponse: HelmAppDeploymentHistoryResponse) => {
                setDeploymentHistoryArr(deploymentHistoryResponse.result?.deploymentHistory?.sort((a , b) => b.deployedAt.seconds - a.deployedAt.seconds) || []);
                setIsLoading(false);
            })
            .catch((errors: ServerErrors) => {
                showError(errors);
                setErrorResponseCode(errors.code);
                setIsLoading(false);
            });
    }, []);

    function changeDeployment(index: number){
        if(selectedDeploymentHistoryIndex == index){
            return;
        }

        setSelectedDeploymentHistoryIndex(index);
    }

    function changeDeploymentTab(index: number){
        if(selectedDeploymentTabIndex == index){
            return;
        }

        setSelectedDeploymentTabIndex(index);
    }

    function renderDeploymentCards() {
        return <>
            {deploymentHistoryArr.map((deployment, index) => {
                return (
                    <React.Fragment key={deployment.version}>
                        <div onClick={() => changeDeployment(index)} className={`w-100 ci-details__build-card ${selectedDeploymentHistoryIndex == index ? 'active' : ''}`}>
                            <div className="w-100" style={{ height: '64px', display: 'grid', gridTemplateColumns: '20px 1fr', padding: '12px 0', gridColumnGap: '12px' }}>
                                <div className="app-summary__icon icon-dim-22 succeeded"></div>
                                <div className="flex column left ellipsis-right">
                                    <div className="cn-9 fs-14">{moment(new Date(deployment.deployedAt.seconds * 1000)).format(Moment12HourFormat)}</div>
                                    <div className="flex left cn-7 fs-12">
                                        {deployment.dockerImages &&
                                            <div className="app-commit__hash app-commit__hash--no-bg">
                                                <img src={docker} className="commit-hash__icon grayscale" />{deployment.dockerImages[0].split(':')[1]}
                                                {
                                                    deployment.dockerImages.length > 1 &&
                                                    <div className="pl-5 cn-5">+ {deployment.dockerImages.length-1} more</div>
                                                }
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                )
            })}
        </>
    }

    function renderSelectedDeploymentDetail() {
        return (
            <>
                <div>
                    {renderSelectedDeploymentDetailHeader()}
                    {renderSelectedDeploymentTabs()}
                </div>
                {renderSelectedDeploymentTabData()}
            </>
        )
    }

    function renderSelectedDeploymentTabs() {
        return <ul className="tab-list deployment-tab-list tab-list--borderd mr-20">
            {deploymentTabs.map((tab, index) => {
                return (
                    <li onClick={() => changeDeploymentTab(index)} key={index} className="tab-list__tab">
                        <div className={`tab-list__tab-link ${selectedDeploymentTabIndex == index ? 'active' : ''}`}>{tab}</div>
                    </li>
                )
            })}
        </ul>
    }

    function renderSelectedDeploymentTabData() {
        let deployment = deploymentHistoryArr[selectedDeploymentHistoryIndex];
        let chartMetadata = deployment.chartMetadata;
        let tab = deploymentTabs[selectedDeploymentTabIndex];
        return(
            <div className={`trigger-outputs-container ${selectedDeploymentTabIndex == 0 ? 'pt-20' : ''}`}>
                {
                    selectedDeploymentTabIndex == 0 &&
                    <div className="ml-20 w-100 p-16 bcn-0 br-4 en-2 bw-1 pb-12 mb-12" style={{ width: 'min( 100%, 800px )' }}>
                        <div className="fw-6 fs-14 cn-9 pb-10">Source details</div>
                        <div className="source-detail border-btm pb-10 pt-10">
                            <div className="cn-7">Name</div>
                            <div>{chartMetadata.chartName}</div>
                        </div>
                        <div className="source-detail border-btm pb-10 pt-10">
                            <div className="cn-7">Version</div>
                            <div>{chartMetadata.chartVersion}</div>
                        </div>
                        <div className="source-detail border-btm pb-10 pt-10">
                            <div className="cn-7">Home</div>
                            <div>{chartMetadata.home}</div>
                        </div>
                        <div className="source-detail border-btm pb-10 pt-10">
                            <div className="cn-7">Sources</div>
                            <div>{chartMetadata.sources?.join(',')}</div>
                        </div>
                        <div className="source-detail pb-10 pt-10">
                            <div className="cn-7">Description</div>
                            <div>{chartMetadata.description}</div>
                        </div>
                    </div>
                }
                {
                    selectedDeploymentTabIndex == 1 &&
                    <div className="bcn-0 border-btm">
                        <CodeEditor
                            value={deployment.manifest}
                            noParsing
                            mode="yaml"
                            readOnly={true}>
                        </CodeEditor>
                    </div>
                }
            </div>
        )
    }

    function renderSelectedDeploymentDetailHeader(){
        let deployment = deploymentHistoryArr[selectedDeploymentHistoryIndex];
        return <div className="trigger-details ml-20 pb-20">
            <div className="trigger-details__summary">
                <div className="flex column left pt-10">
                    <div className="cn-9 fs-14 fw-6">Deployed at</div>
                    <div className="flex left">
                        <time className="cn-7 fs-12">
                            {moment(new Date(deployment.deployedAt.seconds * 1000), 'YYYY-MM-DDTHH:mm:ssZ').format(Moment12HourFormat)}
                        </time>
                        {
                            deployment.dockerImages.map((dockerImage, index) => {
                                return (
                                    <div key={index} className="app-commit__hash ml-10">
                                        <Tippy arrow={true} content={dockerImage}>
                                            <span>
                                                <img src={docker} className="commit-hash__icon grayscale" />
                                                <span className="ml-3">{dockerImage.split(':')[1]}</span>
                                            </span>
                                        </Tippy>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    }


    function renderData() {
        return (
            <div className="ci-details">
                <div className="ci-details__history deployment-cards">
                    <span className="pl-16 pr-16 text-uppercase">Deployments</span>
                    <div className="flex column top left" style={{overflowY:'auto'}}>
                        {renderDeploymentCards()}
                    </div>
                </div>
                <div className="ci-details__body">
                    {renderSelectedDeploymentDetail()}
                </div>
            </div>
        )
    }

    return (
        <>
            { isLoading &&
                <div className="loading-wrapper">
                    <Progressing pageLoader />
                </div>
            }

            { !isLoading && errorResponseCode &&
                <div className="loading-wrapper">
                    <ErrorScreenManager code={errorResponseCode} />
                </div>
            }

            { !isLoading && !errorResponseCode &&
                renderData()
            }

        </>

    )
};

export default ExternalAppDeploymentHistory
