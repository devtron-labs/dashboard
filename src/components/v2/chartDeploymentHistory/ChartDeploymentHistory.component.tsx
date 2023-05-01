import React, { useState, useEffect } from 'react'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    ConfirmationDialog,
    ServerErrors,
} from '@devtron-labs/devtron-fe-common-lib'
import docker from '../../../assets/icons/misc/docker.svg'
import { ReactComponent as DeployButton } from '../../../assets/icons/ic-deploy.svg'
import { InstalledAppInfo } from '../../external-apps/ExternalAppService'
import { Moment12HourFormat, URLS } from '../../../config'
import CodeEditor from '../../CodeEditor/CodeEditor'
import moment from 'moment'
import Tippy from '@tippyjs/react'
import '../../app/details/cIDetails/ciDetails.scss'
import YAML from 'yaml'
import './chartDeploymentHistory.scss'
import MessageUI from '../common/message.ui'
import { toast } from 'react-toastify'
import { useHistory, useRouteMatch } from 'react-router'
import CDEmptyState from '../../app/details/cdDetails/CDEmptyState'
import DockerListModal from './DockerListModal'
import {
    ChartDeploymentDetail,
    ChartDeploymentHistoryResponse,
    ChartDeploymentManifestDetail,
    getDeploymentHistory,
    getDeploymentManifestDetails,
    rollbackApplicationDeployment,
    RollbackReleaseRequest,
} from './chartDeploymentHistory.service'
import IndexStore from '../appDetails/index.store'
import { DEPLOYMENT_HISTORY_TABS, ERROR_EMPTY_SCREEN } from '../../../config/constantMessaging'
import DeploymentDetailSteps from '../../app/details/cdDetails/DeploymentDetailSteps'
import { triggerStatus } from '../../app/details/cicdHistory/History.components'
import { DeploymentStatusDetailsBreakdownDataType } from '../../app/details/appDetails/appDetails.type'
import { processDeploymentStatusDetailsData } from '../../app/details/appDetails/utils'

interface DeploymentManifestDetail extends ChartDeploymentManifestDetail {
    loading?: boolean
    error?: boolean
    errorCode?: number
    isApiCallInProgress?: boolean
}

function ChartDeploymentHistory({
    appId,
    appName,
    isExternal,
}: {
    appId: string
    appName?: string
    isExternal: boolean
}) {
    const [isLoading, setIsLoading] = useState(true)
    const [errorResponseCode, setErrorResponseCode] = useState<number>()
    const [deploymentHistoryArr, setDeploymentHistoryArr] = useState<ChartDeploymentDetail[]>([])
    const [installedAppInfo, setInstalledAppInfo] = useState<InstalledAppInfo>()
    const [selectedDeploymentHistoryIndex, setSelectedDeploymentHistoryIndex] = useState<number>(0)
    const [selectedDeploymentTabIndex, setSelectedDeploymentTabIndex] = useState<number>(0)
    const [deploymentManifestDetails, setDeploymentManifestDetails] = useState<Map<number, DeploymentManifestDetail>>()
    const [rollbackDialogTitle, setRollbackDialogTitle] = useState('Rollback')
    const [showRollbackConfirmation, setShowRollbackConfirmation] = useState(false)
    const [deploying, setDeploying] = useState(false)
    const [showDockerInfo, setShowDockerInfo] = useState(false)
    const history = useHistory()
    const { url } = useRouteMatch()

    const deploymentTabs: string[] = ['Steps', 'Source', 'values.yaml', 'Helm generated manifest']
    const [deploymentStatusDetailsBreakdownData, setDeploymentStatusDetailsBreakdownData] =
    useState<DeploymentStatusDetailsBreakdownDataType>(processDeploymentStatusDetailsData())

    // component load
    useEffect(() => {
        getDeploymentHistory(appId, isExternal)
            .then((deploymentHistoryResponse: ChartDeploymentHistoryResponse) => {
                const _deploymentHistoryArr =
                    deploymentHistoryResponse.result?.deploymentHistory?.sort(
                        (a, b) => b.deployedAt.seconds - a.deployedAt.seconds,
                    ) || []
                setDeploymentHistoryArr(_deploymentHistoryArr)
                setInstalledAppInfo(deploymentHistoryResponse.result?.installedAppInfo)

                // init deployment manifest details map
                const _deploymentManifestDetails = new Map<number, DeploymentManifestDetail>()
                _deploymentHistoryArr.forEach(({ version }) => {
                    _deploymentManifestDetails.set(version, { loading: true })
                })
                setDeploymentManifestDetails(_deploymentManifestDetails)
                setIsLoading(false)

                /**
                 * This is to set the title including appName used by rollback confirmation dialog
                 *
                 * 1. If appName is present in params (passed from parent) then use it
                 * 2. If not then get appName from appDetails and use it.
                 * 3. On page reload if appName is not present in params or in appDetails then show
                 *    default i.e. 'Rollback'
                 *
                 * Note: Additional check on appName from appDetails has been put to avoid setting undefined
                 * value in dialog title on page reload.
                 */
                if (appName) {
                    setRollbackDialogTitle(`Rollback ${appName}`)
                } else {
                    const appDetails = IndexStore.getAppDetails()
                    if (appDetails.appName) {
                        setRollbackDialogTitle(`Rollback ${appDetails.appName}`)
                    }
                }
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                setErrorResponseCode(errors.code)
                setIsLoading(false)
            })
    }, [])

    const getDeploymentData = (_selectedDeploymentTabIndex: number, _selectedDeploymentHistoryIndex: number) => {
        if (_selectedDeploymentTabIndex !== DEPLOYMENT_HISTORY_TABS.SOURCE) { // Checking if the tab in not source, then fetching api for all except source tab
            checkAndFetchDeploymentDetail(deploymentHistoryArr[_selectedDeploymentHistoryIndex].version)
        }
    }

    function onClickDeploymentTabs(index: number) {  // This will call whenever we change the tabs internally eg, source,value etc
        if (selectedDeploymentTabIndex == index) {
            return
        }
        getDeploymentData(index, selectedDeploymentHistoryIndex)
        setSelectedDeploymentTabIndex(index)
    }

    function onClickDeploymentHistorySidebar(index: number, deploymentVersion: number) {   // This will call whenever we change the deployment from sidebar
        if (selectedDeploymentHistoryIndex == index) {
            return
        }
        getDeploymentData(selectedDeploymentTabIndex, index)
        setSelectedDeploymentHistoryIndex(index)
        // history.replace(`${url}?installedAppVersionHistoryId=${deploymentVersion}`)
    }

    async function checkAndFetchDeploymentDetail(
        version: number,
        forceFetchDeploymentManifest?: boolean,
    ): Promise<void> {
        const _selectedDeploymentManifestDetail = deploymentManifestDetails.get(version)

        if (
            _selectedDeploymentManifestDetail.isApiCallInProgress ||
            (!_selectedDeploymentManifestDetail.loading && !_selectedDeploymentManifestDetail.error) ||
            (!forceFetchDeploymentManifest && _selectedDeploymentManifestDetail.error)
        ) {
            return
        }

        _onFetchingDeploymentManifest(version, _selectedDeploymentManifestDetail)

        try {
            const { result } = await getDeploymentManifestDetails(appId, version, isExternal)
            _onDeploymentManifestResponse(version, _selectedDeploymentManifestDetail, result)
        } catch (err) {
            _onDeploymentManifestResponse(version, _selectedDeploymentManifestDetail, null, err)
        }
    }

    const _onFetchingDeploymentManifest = (
        version: number,
        _selectedDeploymentManifestDetail: DeploymentManifestDetail,
    ) => {
        _selectedDeploymentManifestDetail.loading = true
        _selectedDeploymentManifestDetail.error = false
        _selectedDeploymentManifestDetail.isApiCallInProgress = true

        const _deploymentManifestDetail = new Map<number, DeploymentManifestDetail>(deploymentManifestDetails)
        _deploymentManifestDetail.set(version, _selectedDeploymentManifestDetail)

        setDeploymentManifestDetails(_deploymentManifestDetail)
    }

    const _onDeploymentManifestResponse = (
        version: number,
        _selectedDeploymentManifestDetail: DeploymentManifestDetail,
        result: ChartDeploymentManifestDetail,
        err?: any,
    ) => {
        if (result) {
            _selectedDeploymentManifestDetail.manifest = result.manifest
            _selectedDeploymentManifestDetail.valuesYaml = result.valuesYaml
            _selectedDeploymentManifestDetail.error = false
            _selectedDeploymentManifestDetail.errorCode = 0
        } else {
            _selectedDeploymentManifestDetail.error = true
            _selectedDeploymentManifestDetail.errorCode = err?.code
        }

        _selectedDeploymentManifestDetail.loading = false
        _selectedDeploymentManifestDetail.isApiCallInProgress = false

        const _deploymentManifestDetail = new Map<number, DeploymentManifestDetail>(deploymentManifestDetails)
        _deploymentManifestDetail.set(version, _selectedDeploymentManifestDetail)

        setDeploymentManifestDetails(_deploymentManifestDetail)
    }

    function renderDeploymentCards() {
        return (
            <>
                {deploymentHistoryArr.map((deployment, index) => {
                    return (
                        <React.Fragment key={deployment.version}>
                            <div
                                onClick={() => onClickDeploymentHistorySidebar(index, deployment.version)}
                                className={`w-100 ci-details__build-card ${
                                    selectedDeploymentHistoryIndex == index ? 'active' : ''
                                }`}
                            >
                                <div
                                    className="w-100"
                                    style={{
                                        height: '64px',
                                        display: 'grid',
                                        gridTemplateColumns: '20px 1fr',
                                        padding: '12px 16px',
                                        gridColumnGap: '12px',
                                    }}
                                >
                                    <div className={`dc__app-summary__icon icon-dim-22 ${triggerStatus(deploymentStatusDetailsBreakdownData.deploymentStatus)?.toLocaleLowerCase().replace(/\s+/g, '')}`}></div>
                                    <div className="flex column left dc__ellipsis-right">
                                        <div className="cn-9 fs-14">
                                            {moment(new Date(deployment.deployedAt.seconds * 1000)).format(
                                                Moment12HourFormat,
                                            )}
                                        </div>
                                        <div className="flex left cn-7 fs-12">
                                            {deployment.dockerImages && (
                                                <div className="dc__app-commit__hash dc__app-commit__hash--no-bg">
                                                    <img src={docker} className="commit-hash__icon grayscale" />
                                                    <span className="ml-3" data-testid="docker-version-deployment">
                                                        {deployment.dockerImages[0].split(':')[1] ||
                                                            deployment.dockerImages[0]}
                                                    </span>
                                                    {deployment.dockerImages.length > 1 && (
                                                        <div className="pl-5 cn-5">
                                                            + {deployment.dockerImages.length - 1} more
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    )
                })}
            </>
        )
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
        return (
            <ul className="tab-list deployment-tab-list dc__border-bottom mr-20">
                {deploymentTabs.map((tab, index) => {
                    return (
                        <li onClick={() => onClickDeploymentTabs(index)} key={index} className="tab-list__tab">
                            <div
                                className={`tab-list__tab-link ${selectedDeploymentTabIndex == index ? 'active' : ''}`}
                                data-testid={`nav-bar-option-${index}`}
                            >
                                {tab}
                            </div>
                        </li>
                    )
                })}
            </ul>
        )
    }

    /**
     * This function will implicitly check if passed value string is a JSON string or not by parsing the string first.
     * - If it parses the value as a JSON object successfully then it's a JSON string. Further, stringify it using YAML stringify & return.
     * - Else return the value string without parsing.
     *
     * Note: Currently, only EA apps are returning JSON string so kept the isExternal check.
     * Once APIs get merged this check will be removed.
     *
     * @param value - it'll be either a JSON string or normal YAML string
     * @returns parsed value if it's a JSON string or passed value without parsing
     */
    function getEditorValue(value: string): string {
        if (isExternal) {
            try {
                const parsedJson = JSON.parse(value)
                return YAML.stringify(parsedJson, { indent: 2 })
            } catch (e) {
                return value
            }
        }
        return value
    }

    function renderCodeEditor(): JSX.Element {
        const version = deploymentHistoryArr[selectedDeploymentHistoryIndex].version
        const selectedDeploymentManifestDetail = deploymentManifestDetails.get(version)

        if (selectedDeploymentManifestDetail.loading && !selectedDeploymentManifestDetail.error) {
            return <Progressing theme="white" pageLoader />
        } else if (
            !selectedDeploymentManifestDetail.loading &&
            ((selectedDeploymentManifestDetail.error && selectedDeploymentManifestDetail.errorCode === 404) ||
                (selectedDeploymentTabIndex === 1 && !selectedDeploymentManifestDetail.valuesYaml) ||
                (selectedDeploymentTabIndex === 2 && !selectedDeploymentManifestDetail.manifest))
        ) {
            return (
                <div className="flex h-100">
                    <CDEmptyState
                        subtitle={`${deploymentTabs[selectedDeploymentTabIndex]} ${ERROR_EMPTY_SCREEN.TAB_NOT_AVAILABLE_POSTFIX}`}
                    />
                </div>
            )
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
                        checkAndFetchDeploymentDetail(version, true)
                    }}
                    actionButtonStyle={{ color: '#0066cc', textDecoration: 'none' }}
                />
            )
        }
        return (
            <div className="bcn-0 border-btm">
                <CodeEditor
                    value={
                        selectedDeploymentTabIndex === 1
                            ? getEditorValue(selectedDeploymentManifestDetail.valuesYaml)
                            : getEditorValue(selectedDeploymentManifestDetail.manifest)
                    }
                    noParsing
                    mode="yaml"
                    height="100vh"
                    readOnly={true}
                ></CodeEditor>
            </div>
        )
    }

    function renderSelectedDeploymentTabData() {
        const deployment = deploymentHistoryArr[selectedDeploymentHistoryIndex]
        const chartMetadata = deployment.chartMetadata

        return (

            <div className={`trigger-outputs-container ${selectedDeploymentTabIndex === DEPLOYMENT_HISTORY_TABS.SOURCE ? 'pt-20' : ''}`}>
              {selectedDeploymentTabIndex === 0 &&
               <DeploymentDetailSteps isHelm={true} installedAppVersionHistoryId={deployment.version} setDeploymentStatusDetailsBreakdownData={setDeploymentStatusDetailsBreakdownData} deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}/>}
                {selectedDeploymentTabIndex === 1 && (
                    <div
                        className="ml-20 w-100 p-16 bcn-0 br-4 en-2 bw-1 pb-12 mb-12"
                        style={{ width: 'min( 100%, 800px )' }}
                    >
                        <div className="fw-6 fs-14 cn-9 pb-10" data-testid="source-details-heading">
                            Source details
                        </div>
                        <div className="source-detail border-btm pb-10 pt-10">
                            <div className="cn-7" data-testid="chart-name-deployment-history-heading">
                                Name
                            </div>
                            <div data-testid="chart-name-deployment-history">{chartMetadata.chartName}</div>
                        </div>
                        <div className="source-detail border-btm pb-10 pt-10">
                            <div className="cn-7" data-testid="chart-version-deployment-history-heading">
                                Version
                            </div>
                            <div data-testid="chart-version-deployment-history">{chartMetadata.chartVersion}</div>
                        </div>
                        <div className="source-detail border-btm pb-10 pt-10">
                            <div className="cn-7" data-testid="home-heading">
                                Home
                            </div>
                            <div>
                                <a
                                    rel="noreferrer noopener"
                                    target="_blank"
                                    href={chartMetadata.home}
                                    className="anchor"
                                    data-testid="home-link"
                                >
                                    {chartMetadata.home}
                                </a>
                            </div>
                        </div>
                        <div className="source-detail border-btm pb-10 pt-10">
                            <div className="cn-7" data-testid="sources-heading">
                                Sources
                            </div>
                            <div>
                                {chartMetadata.sources?.map((source, index) => {
                                    return (
                                        <div key={source}>
                                            {source ? (
                                                <a
                                                    rel="noreferrer noopener"
                                                    target="_blank"
                                                    href={source}
                                                    className="anchor"
                                                    data-testid={`sources-link-${index}`}
                                                >
                                                    {source}
                                                </a>
                                            ) : (
                                                '-'
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="source-detail pb-10 pt-10">
                            <div className="cn-7" data-testid="description-heading">
                                Description
                            </div>
                            <div data-testid="description-value">{chartMetadata.description}</div>
                        </div>
                    </div>
                )}
                {(selectedDeploymentTabIndex === 2 || selectedDeploymentTabIndex === 3) && renderCodeEditor()}
            </div>
        )
    }

    const closeDockerInfoTab = () => {
        setShowDockerInfo(false)
    }

    function renderSelectedDeploymentDetailHeader() {
        const deployment = deploymentHistoryArr[selectedDeploymentHistoryIndex]

        return (
            <div className="trigger-details ml-20 mr-20 pb-20">
                <div className="flex dc__content-space trigger-details__summary">
                    <div className="flex column left pt-10">
                        <div className="cn-9 fs-14 fw-6" data-testid="deployed-at-heading">
                            Deployed at
                        </div>
                        <div className="flex left">
                            <time className="cn-7 fs-12">
                                {moment(new Date(deployment.deployedAt.seconds * 1000), 'YYYY-MM-DDTHH:mm:ssZ').format(
                                    Moment12HourFormat,
                                )}
                            </time>
                            {deployment?.deployedBy && (
                                <div className="flex">
                                    <div className="dc__bullet mr-6 ml-6"></div>
                                    <div className="cn-7 fs-12 mr-12">{deployment.deployedBy}</div>
                                </div>
                            )}
                            {deployment.dockerImages.slice(0, 3).map((dockerImage, index) => {
                                return (
                                    <div key={index} className="dc__app-commit__hash ml-10">
                                        <Tippy arrow={true} className="default-tt" content={dockerImage}>
                                            <span>
                                                <img src={docker} className="commit-hash__icon grayscale" />
                                                <span className="ml-3" data-testid="docker-version-deployment-history">
                                                    {dockerImage.split(':')[1] || dockerImage}
                                                </span>
                                            </span>
                                        </Tippy>
                                    </div>
                                )
                            })}
                            {deployment.dockerImages.length > 3 && (
                                <div onClick={() => setShowDockerInfo(true)} className="cursor anchor ml-10">
                                    <span>
                                        <span className="">{deployment.dockerImages.length - 3}</span>
                                        <span className="ml-3">more</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    {selectedDeploymentHistoryIndex !== 0 && (
                        <Tippy className="default-tt" arrow={false} content={'Re-deploy this version'}>
                            <button
                                className="flex cta deploy-button"
                                onClick={() => setShowRollbackConfirmation(true)}
                            >
                                <DeployButton className="deploy-button-icon" />
                                <span className="ml-4">Deploy</span>
                            </button>
                        </Tippy>
                    )}
                    {showDockerInfo && (
                        <DockerListModal dockerList={deployment.dockerImages} closeTab={closeDockerInfoTab} />
                    )}
                </div>
            </div>
        )
    }

    async function handleDeployClick() {
        try {
            setDeploying(true)
            const selectedDeploymentHistory = deploymentHistoryArr[selectedDeploymentHistoryIndex]
            const requestPayload: RollbackReleaseRequest = {
                hAppId: isExternal ? appId : '',
                version: selectedDeploymentHistory.version,
            }

            if (installedAppInfo) {
                requestPayload.installedAppId = installedAppInfo.installedAppId
            }

            const { result, errors } = await rollbackApplicationDeployment(requestPayload)
            setDeploying(false)
            setShowRollbackConfirmation(false)

            if (result?.success) {
                toast.success('Deployment initiated')
                history.push(`${url.split('/').slice(0, -1).join('/')}/${URLS.APP_DETAILS}?refetchData=true`)
            } else if (errors) {
                showError(errors)
            } else {
                toast.error('Some error occurred')
            }
        } catch (err) {
            showError(err)
            setDeploying(false)
            setShowRollbackConfirmation(false)
        }
    }

    function RollbackConfirmationDialog() {
        return (
            <ConfirmationDialog className="rollback-confirmation-dialog">
                <ConfirmationDialog.Body title={rollbackDialogTitle}>
                    <p className="fs-13 cn-7 lh-1-54">Are you sure you want to deploy a previous version?</p>
                </ConfirmationDialog.Body>
                <ConfirmationDialog.ButtonGroup>
                    <div className="flex right">
                        <button
                            type="button"
                            className="flex cta cancel"
                            onClick={() => setShowRollbackConfirmation(false)}
                            disabled={deploying}
                        >
                            Cancel
                        </button>
                        <button className="flex cta deploy-button" onClick={handleDeployClick} disabled={deploying}>
                            {deploying ? (
                                <Progressing />
                            ) : (
                                <>
                                    <DeployButton className="deploy-button-icon" />
                                    <span className="ml-8">Deploy</span>
                                </>
                            )}
                        </button>
                    </div>
                </ConfirmationDialog.ButtonGroup>
            </ConfirmationDialog>
        )
    }

    function renderData() {
        if (errorResponseCode && errorResponseCode !== 404) {
            return (
                <div className="dc__loading-wrapper">
                    <ErrorScreenManager code={errorResponseCode} />
                </div>
            )
        } else if (!deploymentHistoryArr || deploymentHistoryArr.length <= 0) {
            return (
                <CDEmptyState subtitle="Data for previous deployments is not available. History for any new deployment will be available here." />
            )
        }

        return (
            <div className="ci-details">
                <div className="ci-details__history deployment-cards">
                    <span className="pl-16 pr-16 dc__uppercase" data-testid="deployment-history-deployments-heading">
                        Deployments
                    </span>
                    <div className="flex column top left" style={{ overflowY: 'auto' }}>
                        {renderDeploymentCards()}
                    </div>
                </div>
                <div className="ci-details__body">{renderSelectedDeploymentDetail()}</div>
                {showRollbackConfirmation && <RollbackConfirmationDialog />}
            </div>
        )
    }

    return (
        <>
            {isLoading ? (
                <div className="dc__loading-wrapper">
                    <Progressing pageLoader />
                </div>
            ) : (
                renderData()
            )}
        </>
    )
}

export default ChartDeploymentHistory
