import React, { useEffect, useState } from 'react'
import { useHistory, useLocation, useParams, useRouteMatch } from 'react-router'
import { ManifestTabJSON } from '../../../../utils/tabUtils/tab.json'
import { iLink } from '../../../../utils/tabUtils/link.type'
import { TabActions, useTab } from '../../../../utils/tabUtils/useTab'
import { ReactComponent as Edit } from '../../../../assets/icons/ic-edit.svg'
import { NodeDetailTab } from '../nodeDetail.type'
import {
    createResource,
    getDesiredManifestResource,
    getManifestResource,
    updateManifestResourceHelmApps,
} from '../nodeDetail.api'
import CodeEditor from '../../../../../CodeEditor/CodeEditor'
import IndexStore from '../../../index.store'
import MessageUI, { MsgUIType } from '../../../../common/message.ui'
import { AppType, ManifestActionPropsType, NodeType } from '../../../appDetails.type'
import YAML from 'yaml'
import { toast } from 'react-toastify'
import { DeploymentAppTypes, showError, ToastBody } from '@devtron-labs/devtron-fe-common-lib'
import { appendRefetchDataToUrl } from '../../../../../util/URLUtil'
import {
    EA_MANIFEST_SECRET_EDIT_MODE_INFO_TEXT,
    EA_MANIFEST_SECRET_INFO_TEXT,
} from '../../../../../../config/constantMessaging'
import { MANIFEST_KEY_FIELDS } from '../../../../../../config/constants'
import { MODES } from '../../../../../../config'
import { EMPTY_YAML_ERROR, SAVE_DATA_VALIDATION_ERROR_MSG } from '../../../../values/chartValuesDiff/ChartValuesView.constants'

function ManifestComponent({
    selectedTab,
    hideManagedFields,
    toggleManagedFields,
    isDeleted,
    isResourceBrowserView,
    selectedResource,
}: ManifestActionPropsType) {
    const location = useLocation()
    const history = useHistory()
    const [{ tabs, activeTab }, dispatch] = useTab(ManifestTabJSON)
    const { url } = useRouteMatch()
    const params = useParams<{ actionName: string; podName: string; nodeType: string; node: string; group: string, namespace: string }>()
    const [manifest, setManifest] = useState('')
    const [modifiedManifest, setModifiedManifest] = useState('')
    const [activeManifestEditorData, setActiveManifestEditorData] = useState('')
    const [trimedManifestEditorData, setTrimedManifestEditorData] = useState('')
    const [desiredManifest, setDesiredManifest] = useState('')
    const appDetails = IndexStore.getAppDetails()
    const [loading, setLoading] = useState(true)
    const [loadingMsg, setLoadingMsg] = useState('Fetching manifest')
    const [error, setError] = useState(false)
    const [errorText, setErrorText] = useState('')
    const [isEditmode, setIsEditmode] = useState(false)
    const [showDesiredAndCompareManifest, setShowDesiredAndCompareManifest] = useState(false)
    const [isResourceMissing, setIsResourceMissing] = useState(false)
    const [showInfoText, setShowInfoText] = useState(false)

    useEffect(() => {
        selectedTab(NodeDetailTab.MANIFEST, url)
        if (isDeleted) return
        toggleManagedFields(false)
        const _selectedResource = isResourceBrowserView
            ? selectedResource
            : appDetails.resourceTree.nodes.filter(
                  (data) => data.name === params.podName && data.kind.toLowerCase() === params.nodeType,
              )[0]
        setShowInfoText(
            _selectedResource &&
                !_selectedResource.group &&
                _selectedResource.kind === NodeType.Secret &&
                (isResourceBrowserView || appDetails.appType === AppType.EXTERNAL_HELM_CHART),
        )

        const _isResourceMissing =
            appDetails.appType === AppType.EXTERNAL_HELM_CHART && _selectedResource?.['health']?.status === 'Missing'
        setIsResourceMissing(_isResourceMissing)
        const _showDesiredAndCompareManifest =
            !isResourceBrowserView &&
            appDetails.appType === AppType.EXTERNAL_HELM_CHART &&
            !_selectedResource?.['parentRefs']?.length
        setShowDesiredAndCompareManifest(_showDesiredAndCompareManifest)
        setLoading(true)

        if (
            isResourceBrowserView ||
            appDetails.appType === AppType.EXTERNAL_HELM_CHART ||
            (appDetails.deploymentAppType === DeploymentAppTypes.GITOPS &&
            appDetails.deploymentAppDeleteRequest)
        ) {
            markActiveTab('Live manifest')
        }
        try {
            Promise.all([
                !_isResourceMissing &&
                    getManifestResource(
                        appDetails,
                        params.podName,
                        params.nodeType,
                        isResourceBrowserView,
                        selectedResource,
                    ),
                _showDesiredAndCompareManifest &&
                    getDesiredManifestResource(appDetails, params.podName, params.nodeType),
            ])
                .then((response) => {
                    let _manifest: string

                    _manifest = JSON.stringify(response[0]?.result?.manifest)
                    setDesiredManifest(response[1]?.result?.manifest || '')

                    if (_manifest) {
                        setManifest(_manifest)
                        setActiveManifestEditorData(_manifest)
                        setModifiedManifest(_manifest)
                    }
                    setLoading(false)

                    // Clear out error on pod/node change
                    if (error) {
                        setError(false)
                    }
                })
                .catch((err) => {
                    setError(true)
                    showError(err)
                    setLoading(false)
                })
        } catch (err) {
            setLoading(false)
        }
    }, [params.podName, params.node, params.nodeType, params.group, params.namespace])

    useEffect(() => {
        if (!isDeleted && !isEditmode && activeManifestEditorData !== modifiedManifest) {
            setActiveManifestEditorData(modifiedManifest)
        }
        if (isEditmode) {
            toggleManagedFields(false)
            const jsonManifestData = YAML.parse(activeManifestEditorData)
            if (jsonManifestData?.metadata?.managedFields) {
                setTrimedManifestEditorData(trimManifestData(jsonManifestData))
            }
        }
    }, [isEditmode])

    useEffect(() => {
        if (params.actionName) {
            markActiveTab(params.actionName)
        }
    }, [params.actionName])

    useEffect(() => {
        setTrimedManifestEditorData(activeManifestEditorData)
        if (activeTab === 'Live manifest') {
            let jsonManifestData = YAML.parse(activeManifestEditorData)
            if (jsonManifestData?.metadata?.managedFields) {
                toggleManagedFields(true)
                if (hideManagedFields) {
                    setTrimedManifestEditorData(trimManifestData(jsonManifestData))
                }
            }
        }
    }, [activeManifestEditorData, hideManagedFields, activeTab])

    //For External
    const trimManifestData = (jsonManifestData: object): string => {
        const _trimedManifestData = JSON.stringify(jsonManifestData, (key, value) => {
            if (key === MANIFEST_KEY_FIELDS.METADATA) {
                value[MANIFEST_KEY_FIELDS.MANAGED_FIELDS] = undefined
            }
            return value
        })
        return _trimedManifestData
    }

    const handleEditorValueChange = (codeEditorData: string) => {
        if (activeTab === 'Live manifest' && isEditmode) {
            setModifiedManifest(codeEditorData)
        }
    }

    const handleEditLiveManifest = () => {
        setIsEditmode(true)
        markActiveTab('Live manifest')
        setActiveManifestEditorData(modifiedManifest)
    }

    const handleApplyChanges = () => {
        setLoading(true)
        setLoadingMsg('Applying changes')

        let manifestString
        try {
            manifestString = JSON.stringify(YAML.parse(modifiedManifest))
            if (!modifiedManifest) {
                setErrorText(`${SAVE_DATA_VALIDATION_ERROR_MSG} "${EMPTY_YAML_ERROR}"`)
                // Handled for blocking API call
                manifestString = ""
            }
        } catch (err2) {
            setErrorText(`${SAVE_DATA_VALIDATION_ERROR_MSG} “${err2}”`)
        }
        if (!manifestString) {
            setLoading(false)
        } else {
            updateManifestResourceHelmApps(
                appDetails,
                params.podName,
                params.nodeType,
                manifestString,
                isResourceBrowserView,
                selectedResource,
            )
                .then((response) => {
                    setIsEditmode(false)
                    const _manifest = JSON.stringify(response?.result?.manifest)
                    if (_manifest) {
                        setManifest(_manifest)
                        setActiveManifestEditorData(_manifest)
                        setModifiedManifest(_manifest)
                        setErrorText('')
                    }
                    setLoading(false)
                })
                .catch((err) => {
                    setLoading(false)
                    if (err.code === 403) {
                        toast.info(
                            <ToastBody
                                title="Access denied"
                                subtitle="You don't have access to perform this action."
                            />,
                            {
                                className: 'devtron-toast unauthorized',
                            },
                        )
                    } else if (err.code === 500) {
                        const error = err['errors'] && err['errors'][0]
                        if (error && error.code && error.userMessage) {
                            setErrorText(`ERROR ${error.code} > Message: “${error.userMessage}”`)
                        } else {
                            showError(err)
                        }
                    } else {
                        showError(err)
                    }
                })
        }
    }

    const recreateResource = () => {
        setLoading(true)
        setActiveManifestEditorData('')
        createResource(appDetails, params.podName, params.nodeType, isResourceBrowserView, selectedResource)
            .then((response) => {
                const _manifest = JSON.stringify(response?.result?.manifest)
                if (_manifest) {
                    setManifest(_manifest)
                    setActiveManifestEditorData(_manifest)
                    setModifiedManifest(_manifest)
                    setIsResourceMissing(false)
                }
                setLoading(false)
                appendRefetchDataToUrl(history, location)
            })
            .catch((err) => {
                setLoading(false)
                showError(err)
            })
    }

    const handleCancel = () => {
        setIsEditmode(false)
        setModifiedManifest(manifest)
        setActiveManifestEditorData('')
        setErrorText('')
    }

    const markActiveTab = (_tabName: string) => {
        if (_tabName !== 'Live manifest') {
            toggleManagedFields(false)
        }
        dispatch({
            type: TabActions.MarkActive,
            tabName: _tabName,
        })
    }

    const updateEditor = (_tabName: string) => {
        switch (_tabName) {
            case 'Live manifest':
                setActiveManifestEditorData(modifiedManifest)
                break
            case 'Compare':
                setActiveManifestEditorData(manifest)
                break
            case 'Helm generated manifest':
                return setTimeout(() => {
                    setActiveManifestEditorData(desiredManifest)
                }, 0)
        }
    }

    const handleTabClick = (_tab: iLink) => {
        if (_tab.isDisabled || loading) {
            return
        }
        markActiveTab(_tab.name)
        updateEditor(_tab.name)
    }

    return isDeleted ? (
        <div>
            <MessageUI
                msg="This resource no longer exists"
                size={32}
                minHeight={isResourceBrowserView ? 'calc(100vh - 126px)' : ''}
            />
        </div>
    ) : (
        <div
            className="manifest-container"
            data-testid="app-manifest-container"
            style={{ background: '#0B0F22', flex: 1, minHeight: isResourceBrowserView ? '200px' : '600px' }}
        >
            {error && !loading && (
                <MessageUI
                    msg="Manifest not available"
                    size={24}
                    minHeight={isResourceBrowserView ? 'calc(100vh - 126px)' : ''}
                />
            )}
            {!error && (
                <>
                    <div className="bcn-0">
                        {(appDetails.appType === AppType.EXTERNAL_HELM_CHART ||
                            isResourceBrowserView ||
                            (appDetails.deploymentAppType === DeploymentAppTypes.GITOPS &&
                                appDetails.deploymentAppDeleteRequest)) && (
                            <div className="flex left pl-20 pr-20 dc__border-bottom manifest-tabs-row">
                                {tabs.map((tab: iLink, index) => {
                                    return (!showDesiredAndCompareManifest &&
                                        (tab.name == 'Helm generated manifest' || tab.name == 'Compare')) ||
                                        (isResourceMissing && tab.name == 'Compare') ? (
                                        <></>
                                    ) : (
                                        <div
                                            key={index + 'tab'}
                                            className={` ${
                                                tab.isDisabled || loading ? 'no-drop' : 'cursor'
                                            } pl-4 pt-8 pb-8 pr-4`}
                                        >
                                            <div
                                                className={`${
                                                    tab.isSelected ? 'selected-manifest-tab cn-0' : ' bcn-1'
                                                } bw-1 pl-6 pr-6 br-4 en-2 dc__no-decor flex left`}
                                                onClick={() => handleTabClick(tab)}
                                                data-testid={tab.name}
                                            >
                                                {tab.name}
                                            </div>
                                        </div>
                                    )
                                })}

                                {activeTab === 'Live manifest' && !loading && !isResourceMissing && (
                                    <>
                                        <div className="pl-16 pr-16">|</div>
                                        {!isEditmode ? (
                                            <div
                                                className="flex left cb-5 cursor"
                                                onClick={handleEditLiveManifest}
                                                data-testid="edit-live-manifest"
                                            >
                                                <Edit className="icon-dim-16 pr-4 fc-5 edit-icon" /> Edit Live manifest
                                            </div>
                                        ) : (
                                            <div>
                                                <button className="apply-change" onClick={handleApplyChanges}>
                                                    Apply Changes
                                                </button>
                                                <button className="cancel-change" onClick={handleCancel}>
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                        {isResourceMissing && !loading && activeTab === 'Live manifest' ? (
                            <MessageUI
                                msg="Manifest not available"
                                size={24}
                                isShowActionButton={showDesiredAndCompareManifest}
                                actionButtonText="Recreate this resource"
                                onActionButtonClick={recreateResource}
                            />
                        ) : (
                            <CodeEditor
                                defaultValue={activeTab === 'Compare' && desiredManifest}
                                cleanData={activeTab === 'Compare'}
                                diffView={activeTab === 'Compare'}
                                theme="vs-dark--dt"
                                height={isResourceBrowserView ? 'calc(100vh - 116px)' : '100vh'}
                                value={trimedManifestEditorData}
                                mode={MODES.YAML}
                                readOnly={activeTab !== 'Live manifest' || !isEditmode}
                                onChange={handleEditorValueChange}
                                loading={loading}
                                customLoader={
                                    <MessageUI
                                        msg={loadingMsg}
                                        icon={MsgUIType.LOADING}
                                        size={24}
                                        minHeight={isResourceBrowserView ? 'calc(100vh - 116px)' : ''}
                                    />
                                }
                                focus={isEditmode}
                            >
                                {showInfoText && (
                                    <CodeEditor.Information
                                        text={
                                            isEditmode && activeTab === 'Live manifest'
                                                ? EA_MANIFEST_SECRET_EDIT_MODE_INFO_TEXT
                                                : EA_MANIFEST_SECRET_INFO_TEXT
                                        }
                                    />
                                )}
                                {activeTab === 'Compare' && (
                                    <CodeEditor.Header hideDefaultSplitHeader={true}>
                                        <div className="dc__split-header">
                                            <div className="dc__left-pane">Helm generated manifest </div>
                                            <div className="dc__right-pane">Live manifest</div>
                                        </div>
                                    </CodeEditor.Header>
                                )}
                                {activeTab === 'Live manifest' && errorText && <CodeEditor.ErrorBar text={errorText} />}
                            </CodeEditor>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default ManifestComponent
