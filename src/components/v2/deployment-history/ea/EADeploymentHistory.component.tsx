import React, { useState, useEffect } from 'react';
import { showError, Progressing, ErrorScreenManager } from '../../../common';
import docker from '../../../../assets/icons/misc/docker.svg';
import {
    getDeploymentHistory,
    HelmAppDeploymentHistoryResponse,
    HelmAppDeploymentDetail,
    getDeploymentManifestDetails,
    HelmAppDeploymentManifestDetail,
} from '../../../external-apps/ExternalAppService';
import { ServerErrors } from '../../../../modals/commonTypes';
import { Moment12HourFormat } from '../../../../config';
import CodeEditor from '../../../CodeEditor/CodeEditor';
import moment from 'moment';
import Tippy from '@tippyjs/react';
import '../../../app/details/cIDetails/ciDetails.scss';
import YAML from 'yaml';
import './ea-deployment-history.scss';
import MessageUI from '../../common/message.ui';

interface DeploymentManifestDetail extends HelmAppDeploymentManifestDetail {
    loading?: boolean;
    error?: boolean;
    isApiCallTriggered?: boolean;
}

const initDeploymentManifestDetails = new Map<number, DeploymentManifestDetail>();

function ExternalAppDeploymentHistory({ appId }: { appId: string }) {
    const [isLoading, setIsLoading] = useState(true);
    const [errorResponseCode, setErrorResponseCode] = useState(undefined);
    const [deploymentHistoryArr, setDeploymentHistoryArr] = useState<HelmAppDeploymentDetail[]>([]);
    const [selectedDeploymentHistoryIndex, setSelectedDeploymentHistoryIndex] = useState<number>(0);
    const [selectedDeploymentTabIndex, setSelectedDeploymentTabIndex] = useState<number>(0);
    const [deploymentManifestDetails, setDeploymentManifestDetails] = useState<Map<number, DeploymentManifestDetail>>();

    const deploymentTabs: string[] = ['Source', 'values.yaml', 'Helm generated manifest'];

    // component load
    useEffect(() => {
        getDeploymentHistory(appId)
            .then((deploymentHistoryResponse: HelmAppDeploymentHistoryResponse) => {
                setDeploymentHistoryArr(
                    deploymentHistoryResponse.result?.deploymentHistory?.sort(
                        (a, b) => b.deployedAt.seconds - a.deployedAt.seconds,
                    ) || [],
                );
                setIsLoading(false);

                // Init deployment manifest details map
                deploymentHistoryResponse.result?.deploymentHistory?.forEach(({ version }) => {
                    initDeploymentManifestDetails.set(version, { loading: true });
                });
                setDeploymentManifestDetails(initDeploymentManifestDetails);
            })
            .catch((errors: ServerErrors) => {
                showError(errors);
                setErrorResponseCode(errors.code);
                setIsLoading(false);
            });
    }, []);

    function changeDeployment(index: number) {
        if (selectedDeploymentHistoryIndex == index) {
            return;
        }

        setSelectedDeploymentHistoryIndex(index);

        // Resetting the deployment tab selection, loading & error states on version change.
        setSelectedDeploymentTabIndex(0);
    }

    async function fetchDeploymentDetail(version: number): Promise<void> {
        try {
            const { result } = await getDeploymentManifestDetails(appId, version);
            initDeploymentManifestDetails.set(version, {
                manifest: result.manifest,
                valuesYaml: result.valuesYaml,
                loading: false,
                error: false,
                isApiCallTriggered: true,
            });
            setDeploymentManifestDetails(new Map<number, DeploymentManifestDetail>(initDeploymentManifestDetails));
        } catch (e) {
            initDeploymentManifestDetails.set(version, {
                loading: false,
                error: true,
                isApiCallTriggered: true,
            });
            setDeploymentManifestDetails(new Map<number, DeploymentManifestDetail>(initDeploymentManifestDetails));
        }
    }

    function updateDeploymentManifestDetails(version: number): void {
        initDeploymentManifestDetails.set(version, {
            loading: true,
            isApiCallTriggered: true,
        });
        setDeploymentManifestDetails(new Map<number, DeploymentManifestDetail>(initDeploymentManifestDetails));
        fetchDeploymentDetail(version);
    }

    function changeDeploymentTab(index: number) {
        if (selectedDeploymentTabIndex === index) {
            return;
        }

        if (index === 1 || index === 2) {
            const version = deploymentHistoryArr[selectedDeploymentHistoryIndex]?.version;
            const selectedDeploymentManifestDetail = initDeploymentManifestDetails.get(version);

            if (!selectedDeploymentManifestDetail.isApiCallTriggered || selectedDeploymentManifestDetail.error) {
                updateDeploymentManifestDetails(version);
            }
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

    function renderCodeEditor(): JSX.Element | null {
        if (selectedDeploymentTabIndex !== 1 && selectedDeploymentTabIndex !== 2) {
            return null;
        }

        const version = deploymentHistoryArr[selectedDeploymentHistoryIndex]?.version;
        const selectedDeploymentManifestDetail = deploymentManifestDetails.get(version);

        if (selectedDeploymentManifestDetail.loading && !selectedDeploymentManifestDetail.error) {
            return <Progressing theme="white" pageLoader />;
        } else if (!selectedDeploymentManifestDetail.loading && selectedDeploymentManifestDetail.error) {
            return (
                <MessageUI
                    iconClassName="error-exclamation-icon"
                    theme="white"
                    msg="There was an error loading the file."
                    msgStyle={{ color: '#767D84', marginTop: '0' }}
                    size={24}
                    isShowActionButton={true}
                    actionButtonText="Retry"
                    onActionButtonClick={() => {
                        updateDeploymentManifestDetails(version);
                    }}
                    actionButtonStyle={{ color: '#0066cc', textDecoration: 'none' }}
                />
            );
        }

        return (
            selectedDeploymentManifestDetail.manifest &&
            selectedDeploymentManifestDetail.valuesYaml && (
                <div className="bcn-0 border-btm">
                    <CodeEditor
                        value={
                            selectedDeploymentTabIndex === 1
                                ? YAML.stringify(JSON.parse(selectedDeploymentManifestDetail.valuesYaml), {
                                      indent: 2,
                                  })
                                : selectedDeploymentManifestDetail.manifest
                        }
                        noParsing
                        mode="yaml"
                        height={700}
                        readOnly={true}
                    ></CodeEditor>
                </div>
            )
        );
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
                            <div>
                                <a rel="noreferrer noopener" target="_blank" href={chartMetadata.home} className="anchor">
                                    {chartMetadata.home}
                                </a>
                            </div>
                        </div>
                        <div className="source-detail border-btm pb-10 pt-10">
                            <div className="cn-7">Sources</div>
                            <div>
                                {chartMetadata.sources?.map((source) => {
                                    return (
                                        <div>
                                            <a rel="noreferrer noopener" target="_blank" href={source} className="anchor">
                                                {source}
                                            </a>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="source-detail pb-10 pt-10">
                            <div className="cn-7">Description</div>
                            <div>{chartMetadata.description}</div>
                        </div>
                    </div>
                }
                {renderCodeEditor()}
            </div>
        );
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
                                        <Tippy arrow={true} className="default-tt" content={dockerImage}>
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
