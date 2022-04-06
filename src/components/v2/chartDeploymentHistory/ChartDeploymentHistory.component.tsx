import React, { useState, useEffect } from 'react'
import { showError, Progressing, ErrorScreenManager, ConfirmationDialog } from '../../common'
import docker from '../../../assets/icons/misc/docker.svg'
import { ReactComponent as DeployButton } from '../../../assets/icons/ic-deploy.svg'
import { InstalledAppInfo } from '../../external-apps/ExternalAppService'
import { ServerErrors } from '../../../modals/commonTypes'
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
    const history = useHistory()
    const { url } = useRouteMatch()

    const deploymentTabs: string[] = isExternal
        ? ['Source', 'values.yaml', 'Helm generated manifest']
        : ['Source', 'values.yaml']

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

    function changeDeployment(index: number) {
        if (selectedDeploymentHistoryIndex == index) {
            return
        }

        setSelectedDeploymentHistoryIndex(index)

        // Resetting the deployment tab selection, loading & error states on version change.
        setSelectedDeploymentTabIndex(0)
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

    function changeDeploymentTab(index: number) {
        if (selectedDeploymentTabIndex === index) {
            return
        }

        if (index === 1 || index === 2) {
            const version = deploymentHistoryArr[selectedDeploymentHistoryIndex].version
            checkAndFetchDeploymentDetail(version)
        }

        setSelectedDeploymentTabIndex(index)
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
                                onClick={() => changeDeployment(index)}
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
                                        padding: '12px 0',
                                        gridColumnGap: '12px',
                                    }}
                                >
                                    <div className="app-summary__icon icon-dim-22 succeeded"></div>
                                    <div className="flex column left ellipsis-right">
                                        <div className="cn-9 fs-14">
                                            {moment(new Date(deployment.deployedAt.seconds * 1000)).format(
                                                Moment12HourFormat,
                                            )}
                                        </div>
                                        <div className="flex left cn-7 fs-12">
                                            {deployment.dockerImages && (
                                                <div className="app-commit__hash app-commit__hash--no-bg">
                                                    <img src={docker} className="commit-hash__icon grayscale" />
                                                    <span className="ml-3">
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
            <ul className="tab-list deployment-tab-list tab-list--borderd mr-20">
                {deploymentTabs.map((tab, index) => {
                    return (
                        <li onClick={() => changeDeploymentTab(index)} key={index} className="tab-list__tab">
                            <div
                                className={`tab-list__tab-link ${selectedDeploymentTabIndex == index ? 'active' : ''}`}
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
                <CDEmptyState
                    subtitle={`${deploymentTabs[selectedDeploymentTabIndex]} is not available for this deployment`}
                />
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
            <div className={`trigger-outputs-container ${selectedDeploymentTabIndex == 0 ? 'pt-20' : ''}`}>
                {selectedDeploymentTabIndex === 0 && (
                    <div
                        className="ml-20 w-100 p-16 bcn-0 br-4 en-2 bw-1 pb-12 mb-12"
                        style={{ width: 'min( 100%, 800px )' }}
                    >
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
                                <a
                                    rel="noreferrer noopener"
                                    target="_blank"
                                    href={chartMetadata.home}
                                    className="anchor"
                                >
                                    {chartMetadata.home}
                                </a>
                            </div>
                        </div>
                        <div className="source-detail border-btm pb-10 pt-10">
                            <div className="cn-7">Sources</div>
                            <div>
                                {chartMetadata.sources?.map((source) => {
                                    return (
                                        <div key={source}>
                                            {source ? (
                                                <a
                                                    rel="noreferrer noopener"
                                                    target="_blank"
                                                    href={source}
                                                    className="anchor"
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
                            <div className="cn-7">Description</div>
                            <div>{chartMetadata.description}</div>
                        </div>
                    </div>
                )}
                {(selectedDeploymentTabIndex === 1 || selectedDeploymentTabIndex === 2) && renderCodeEditor()}
            </div>
        )
    }

    function renderSelectedDeploymentDetailHeader() {
        const deployment = deploymentHistoryArr[selectedDeploymentHistoryIndex]

        return (
            <div className="trigger-details ml-20 mr-20 pb-20">
                <div className="flex content-space trigger-details__summary">
                    <div className="flex column left pt-10">
                        <div className="cn-9 fs-14 fw-6">Deployed at</div>
                        <div className="flex left">
                            <time className="cn-7 fs-12">
                                {moment(new Date(deployment.deployedAt.seconds * 1000), 'YYYY-MM-DDTHH:mm:ssZ').format(
                                    Moment12HourFormat,
                                )}
                            </time>
                            {deployment.dockerImages.map((dockerImage, index) => {
                                return (
                                    <div key={index} className="app-commit__hash ml-10">
                                        <Tippy arrow={true} className="default-tt" content={dockerImage}>
                                            <span>
                                                <img src={docker} className="commit-hash__icon grayscale" />
                                                <span className="ml-3">{dockerImage.split(':')[1] || dockerImage}</span>
                                            </span>
                                        </Tippy>
                                    </div>
                                )
                            })}
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
                <div className="loading-wrapper">
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
                    <span className="pl-16 pr-16 text-uppercase">Deployments</span>
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
                <div className="loading-wrapper">
                    <Progressing pageLoader />
                </div>
            ) : (
                renderData()
            )}
        </>
    )
}

export default ChartDeploymentHistory
