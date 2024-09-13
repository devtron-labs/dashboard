/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect, useState } from 'react'
import { useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'
import YAML from 'yaml'
import {
    Checkbox,
    CHECKBOX_VALUE,
    ConditionalWrap,
    DeploymentAppTypes,
    showError,
    useEffectAfterMount,
    ServerErrors,
    useMainContext,
    CodeEditor,
    ToastManager,
    ToastVariantType,
    TOAST_ACCESS_DENIED,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
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
import IndexStore from '../../../index.store'
import MessageUI, { MsgUIType } from '../../../../common/message.ui'
import { AppType, ManifestActionPropsType, NodeType } from '../../../appDetails.type'
import { appendRefetchDataToUrl } from '../../../../../util/URLUtil'
import {
    EA_MANIFEST_SECRET_EDIT_MODE_INFO_TEXT,
    EA_MANIFEST_SECRET_INFO_TEXT,
} from '../../../../../../config/constantMessaging'
import { MODES } from '../../../../../../config'
import {
    EMPTY_YAML_ERROR,
    SAVE_DATA_VALIDATION_ERROR_MSG,
} from '../../../../values/chartValuesDiff/ChartValuesView.constants'
import { getDecodedEncodedSecretManifestData, getTrimmedManifestData } from '../nodeDetail.util'

const ManifestComponent = ({
    selectedTab,
    hideManagedFields,
    toggleManagedFields,
    isDeleted,
    isResourceBrowserView,
    selectedResource,
    manifestViewRef,
    getComponentKey,
    isExternalApp,
}: ManifestActionPropsType) => {
    const location = useLocation()
    const history = useHistory()
    const [{ tabs, activeTab }, dispatch] = useTab(ManifestTabJSON)
    const { url } = useRouteMatch()
    /* TODO: can be unified later with resource browser */
    const params = useParams<{
        actionName: string
        podName: string
        nodeType: string
        node: string
        group: string
        namespace: string
    }>()
    const id = getComponentKey()
    const [error, setError] = useState(false)
    const [desiredManifest, setDesiredManifest] = useState('')
    const [manifest, setManifest] = useState('')
    const [activeManifestEditorData, setActiveManifestEditorData] = useState('')
    const [modifiedManifest, setModifiedManifest] = useState('')

    const [trimedManifestEditorData, setTrimedManifestEditorData] = useState('')
    const appDetails = IndexStore.getAppDetails()
    const [loading, setLoading] = useState(true)
    const [loadingMsg, setLoadingMsg] = useState('Fetching manifest')
    const [errorText, setErrorText] = useState('')
    const [isEditmode, setIsEditmode] = useState(false)
    const [showDesiredAndCompareManifest, setShowDesiredAndCompareManifest] = useState(false)
    const [isResourceMissing, setIsResourceMissing] = useState(false)
    const [showInfoText, setShowInfoText] = useState(false)
    const [showDecodedData, setShowDecodedData] = useState(false)

    const [secretViewAccess, setSecretViewAccess] = useState(false)
    const { isSuperAdmin } = useMainContext() // to show the cluster meta data at the bottom

    const handleDeriveStatesFromManifestRef = () => {
        setError(manifestViewRef.current.data.error)
        setSecretViewAccess(manifestViewRef.current.data.secretViewAccess)
        setDesiredManifest(manifestViewRef.current.data.desiredManifest)
        setManifest(manifestViewRef.current.data.manifest)
        switch (manifestViewRef.current.data.activeTab) {
            case 'Helm generated manifest':
                setActiveManifestEditorData(manifestViewRef.current.data.desiredManifest)
                break
            case 'Compare':
                setActiveManifestEditorData(manifestViewRef.current.data.manifest)
                break
            case 'Live manifest':
            default:
                setActiveManifestEditorData(manifestViewRef.current.data.modifiedManifest)
        }
        setModifiedManifest(manifestViewRef.current.data.modifiedManifest)
        setIsEditmode(manifestViewRef.current.data.isEditmode)
    }

    useEffectAfterMount(() => {
        manifestViewRef.current = {
            data: {
                error,
                secretViewAccess,
                desiredManifest,
                manifest,
                activeManifestEditorData,
                modifiedManifest,
                isEditmode,
                activeTab,
            },
            /* NOTE: id is unlikely to change but still kept as dep */
            id,
        }
    }, [
        error,
        secretViewAccess,
        desiredManifest,
        activeManifestEditorData,
        manifest,
        modifiedManifest,
        isEditmode,
        activeTab,
        id,
    ])

    useEffect(() => {
        selectedTab(NodeDetailTab.MANIFEST, url)
        if (isDeleted) {
            /* NOTE:(linting) useEffect callback should have uniform return values */
            return () => {}
        }
        const abortController = new AbortController()
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

        if (
            isResourceBrowserView ||
            appDetails.appType === AppType.EXTERNAL_HELM_CHART ||
            (appDetails.deploymentAppType === DeploymentAppTypes.GITOPS && appDetails.deploymentAppDeleteRequest)
        ) {
            markActiveTab(
                (manifestViewRef.current.id === id && manifestViewRef.current.data.activeTab) || 'Live manifest',
            )
        }

        /* NOTE: id helps discern data between manifests of different resources */
        if (manifestViewRef.current.data.manifest && manifestViewRef.current.id === id) {
            handleDeriveStatesFromManifestRef()
            setLoading(false)
        } else {
            setLoading(true)

            try {
                Promise.all([
                    !_isResourceMissing &&
                        getManifestResource(
                            appDetails,
                            params.podName,
                            params.nodeType,
                            isResourceBrowserView,
                            selectedResource,
                            abortController.signal,
                        ),
                    _showDesiredAndCompareManifest &&
                        getDesiredManifestResource(appDetails, params.podName, params.nodeType, abortController.signal),
                ])
                    .then((response) => {
                        setSecretViewAccess(response[0]?.result?.secretViewAccess || false)
                        const _manifest = JSON.stringify(response[0]?.result?.manifestResponse?.manifest || '')
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
                        /* NOTE: if the user switches tab after dismount don't set state */
                        /* if the user aborted using tab switch don't show error */
                        if (
                            err instanceof ServerErrors &&
                            Array.isArray(err.errors) &&
                            err.errors.find((_error) => _error.code === 0)
                        ) {
                            return
                        }
                        setLoading(false)
                        setError(true)
                        showError(err)
                    })
            } catch (err) {
                setLoading(false)
            }
        }

        return () => abortController.abort()
    }, [])

    useEffect(() => {
        if (!isDeleted && !isEditmode && activeManifestEditorData !== modifiedManifest) {
            setActiveManifestEditorData(modifiedManifest)
        }
        if (isEditmode) {
            try {
                const jsonManifestData = YAML.parse(activeManifestEditorData)
                if (jsonManifestData?.metadata?.managedFields) {
                    setTrimedManifestEditorData(getTrimmedManifestData(jsonManifestData, true) as string)
                }
            } catch {}
            toggleManagedFields(false)
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
            try {
                const jsonManifestData = YAML.parse(activeManifestEditorData)
                if (jsonManifestData?.metadata?.managedFields) {
                    toggleManagedFields(true)
                    if (hideManagedFields) {
                        setTrimedManifestEditorData(getTrimmedManifestData(jsonManifestData, true) as string)
                    }
                }
            } catch {}
        }
    }, [activeManifestEditorData, hideManagedFields, activeTab])

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
        setShowDecodedData(false)

        let manifestString
        try {
            if (!modifiedManifest) {
                setErrorText(`${SAVE_DATA_VALIDATION_ERROR_MSG} "${EMPTY_YAML_ERROR}"`)
                // Handled for blocking API call
                manifestString = ''
            } else {
                manifestString = JSON.stringify(YAML.parse(modifiedManifest))
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
                        ToastManager.showToast({
                            variant: ToastVariantType.notAuthorized,
                            description: TOAST_ACCESS_DENIED.SUBTITLE,
                        })
                    } else if (err.code === 400 || err.code === 409 || err.code === 422) {
                        const error = err['errors'] && err['errors'][0]
                        if (error && error.code && error.userMessage) {
                            setErrorText(`ERROR ${err.code} > Message: “${error.userMessage}”`)
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
        setShowDecodedData(false)
    }

    const markActiveTab = (_tabName: string) => {
        toggleManagedFields(_tabName === 'Live manifest' && !isEditmode)
        dispatch({
            type: TabActions.MarkActive,
            tabName: _tabName,
        })
    }

    const updateEditor = (_tabName: string) => {
        switch (_tabName) {
            case 'Compare':
                setActiveManifestEditorData(manifest)
                break
            case 'Helm generated manifest':
                setActiveManifestEditorData(desiredManifest)
                break
            case 'Live manifest':
            default:
                setActiveManifestEditorData(modifiedManifest)
        }
    }

    const handleTabClick = (_tab: iLink) => {
        if (_tab.isDisabled || loading) {
            return
        }
        markActiveTab(_tab.name)
        updateEditor(_tab.name)
    }

    const onChangeToggleShowDecodedValue = (jsonManifestData) => {
        if (!jsonManifestData?.data) {
            return
        }
        setShowDecodedData(!showDecodedData)
        if (!showDecodedData) {
            setTrimedManifestEditorData(
                getDecodedEncodedSecretManifestData(jsonManifestData, true, showDecodedData) as string,
            )
        } else {
            setTrimedManifestEditorData(getDecodedEncodedSecretManifestData(jsonManifestData, true, true) as string)
        }
    }

    const renderShowDecodedValueCheckbox = () => {
        const jsonManifestData = YAML.parse(trimedManifestEditorData)
        if (jsonManifestData?.kind === 'Secret' && !isEditmode && secretViewAccess) {
            return (
                <ConditionalWrap
                    condition={!jsonManifestData?.data}
                    wrap={(children) => (
                        <Tippy
                            className="default-tt w-200"
                            arrow={false}
                            placement="top-start"
                            content="Nothing to decode, data field not found."
                        >
                            {children}
                        </Tippy>
                    )}
                >
                    <div
                        className={`${
                            !jsonManifestData?.data ? 'dc__opacity-0_5 cursor-not-allowed' : ''
                        } flex left ml-8`}
                    >
                        <Checkbox
                            rootClassName={`${
                                !jsonManifestData?.data ? 'dc__opacity-0_5 cursor-not-allowed' : 'cursor'
                            } mb-0-imp h-18`}
                            id="showDecodedValue"
                            isChecked={showDecodedData}
                            onChange={() => onChangeToggleShowDecodedValue(jsonManifestData)}
                            value={CHECKBOX_VALUE.CHECKED}
                        />
                        Show decoded Value
                    </div>
                </ConditionalWrap>
            )
        }
    }

    return isDeleted ? (
        <div className="h-100 flex-grow-1">
            <MessageUI
                msg="This resource no longer exists"
                size={32}
                minHeight={isResourceBrowserView ? 'calc(100vh - 126px)' : ''}
            />
        </div>
    ) : (
        <div
            className={`${isSuperAdmin && !isResourceBrowserView ? 'pb-28' : ' '} manifest-container flex-grow-1`}
            data-testid="app-manifest-container"
            style={{ background: '#0B0F22' }}
        >
            {error && !loading && (
                <MessageUI
                    msg="Manifest not available"
                    size={24}
                    minHeight={isResourceBrowserView ? 'calc(100vh - 126px)' : ''}
                />
            )}
            {!error && (
                <div className="bcn-0 h-100">
                    {(isExternalApp ||
                        isResourceBrowserView ||
                        (appDetails.deploymentAppType === DeploymentAppTypes.GITOPS &&
                            appDetails.deploymentAppDeleteRequest)) && (
                        <div
                            className={`flex left pl-20 pr-20 dc__border-bottom manifest-tabs-row ${!isResourceBrowserView ? 'manifest-tabs-row__position-sticky' : ''}`}
                        >
                            {tabs.map((tab: iLink, index) => {
                                return (!showDesiredAndCompareManifest &&
                                    (tab.name == 'Helm generated manifest' || tab.name == 'Compare')) ||
                                    (isResourceMissing && tab.name == 'Compare') ? (
                                    <></>
                                ) : (
                                    <div
                                        key={`${index}tab`}
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
                            height={isResourceBrowserView ? 'calc(100vh - 151px)' : 'calc(100vh - 77px)'}
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
                                    minHeight={isResourceBrowserView ? 'calc(100vh - 151px)' : ''}
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
                                    className="flex left"
                                >
                                    {renderShowDecodedValueCheckbox()}
                                </CodeEditor.Information>
                            )}
                            {activeTab === 'Compare' && (
                                <CodeEditor.Header hideDefaultSplitHeader>
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
            )}
        </div>
    )
}

export default ManifestComponent
