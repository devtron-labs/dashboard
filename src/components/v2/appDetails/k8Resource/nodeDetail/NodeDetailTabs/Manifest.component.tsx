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

import { useEffect, useMemo, useState } from 'react'
import { useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import YAML from 'yaml'

import {
    AppThemeType,
    Checkbox,
    CHECKBOX_VALUE,
    CodeEditor,
    ConditionalWrap,
    ConfigurationType,
    DeploymentAppTypes,
    FormProps,
    InfoBlock,
    logExceptionToSentry,
    noop,
    ServerErrors,
    showError,
    TOAST_ACCESS_DENIED,
    ToastManager,
    ToastVariantType,
    useEffectAfterMount,
    useMainContext,
    YAMLStringify,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import { DEFAULT_CLUSTER_ID } from '@Components/cluster/cluster.type'
import { importComponentFromFELibrary } from '@Components/common'

import { MODES } from '../../../../../../config'
import {
    EA_MANIFEST_SECRET_EDIT_MODE_INFO_TEXT,
    EA_MANIFEST_SECRET_INFO_TEXT,
} from '../../../../../../config/constantMessaging'
import { appendRefetchDataToUrl } from '../../../../../util/URLUtil'
import MessageUI, { MsgUIType } from '../../../../common/message.ui'
import {
    EMPTY_YAML_ERROR,
    SAVE_DATA_VALIDATION_ERROR_MSG,
} from '../../../../values/chartValuesDiff/ChartValuesView.constants'
import {
    AppType,
    ManifestActionPropsType,
    ManifestCodeEditorMode,
    ManifestViewRefType,
    Node,
    NodeType,
} from '../../../appDetails.type'
import IndexStore from '../../../index.store'
import {
    createResource,
    getDesiredManifestResource,
    getManifestResource,
    getResourceRequestPayload,
    updateManifestResourceHelmApps,
} from '../nodeDetail.api'
import { NodeDetailTab } from '../nodeDetail.type'
import { getDecodedEncodedSecretManifestData, getTrimmedManifestData, manifestBorderConfig } from '../nodeDetail.util'

const renderOutOfSyncWarning = importComponentFromFELibrary('renderOutOfSyncWarning', null, 'function')
const getManifestGUISchema = importComponentFromFELibrary('getManifestGUISchema', null, 'function')
const getLockedManifestKeys = importComponentFromFELibrary('getLockedManifestKeys', null, 'function')
const ManifestGUIView = importComponentFromFELibrary('ManifestGUIView', null, 'function')
const checkForIneligibleChanges = importComponentFromFELibrary('checkForIneligibleChanges', null, 'function')
const ShowIneligibleChangesModal = importComponentFromFELibrary('ShowIneligibleChangesModal', null, 'function')

const ManifestComponent = ({
    selectedTab,
    hideManagedFields,
    toggleManagedFields,
    isDeleted,
    isResourceBrowserView,
    isDynamicTabsStuck,
    selectedResource,
    manifestViewRef,
    getComponentKey,
    showManifestCompareView,
    setShowManifestCompareView,
    manifestCodeEditorMode,
    setManifestCodeEditorMode,
    manifestFormConfigurationType,
    handleSwitchToYAMLMode,
    handleUpdateUnableToParseManifest,
    handleManifestGUIErrors,
    manifestGUIFormRef,
    isManifestEditable,
    handleStickDynamicTabsToTop,
}: ManifestActionPropsType) => {
    const location = useLocation()
    const history = useHistory()
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
    const [normalizedLiveManifest, setNormalizedLiveManifest] = useState<string>('')
    const [activeManifestEditorData, setActiveManifestEditorData] = useState('')
    const [modifiedManifest, setModifiedManifest] = useState('')

    const [trimedManifestEditorData, setTrimedManifestEditorData] = useState('')
    const appDetails = IndexStore.getAppDetails()
    const [loading, setLoading] = useState(true)
    const [loadingMsg, setLoadingMsg] = useState('Fetching manifest')
    const [errorText, setErrorText] = useState('')
    const [showDesiredAndCompareManifest, setShowDesiredAndCompareManifest] = useState(false)
    const [isResourceMissing, setIsResourceMissing] = useState(false)
    const [showInfoText, setShowInfoText] = useState(false)
    const [showDecodedData, setShowDecodedData] = useState(false)

    const [secretViewAccess, setSecretViewAccess] = useState(false)
    const [guiSchema, setGUISchema] = useState<ManifestViewRefType['data']['guiSchema']>({})

    const [lockedKeys, setLockedKeys] = useState<string[]>(null)
    const [showLockedDiffModal, setShowLockedDiffModal] = useState(false)

    const { isSuperAdmin } = useMainContext() // to show the cluster meta data at the bottom
    // Cancel is an intermediate state wherein edit is true
    const isEditMode =
        manifestCodeEditorMode === ManifestCodeEditorMode.EDIT ||
        manifestCodeEditorMode === ManifestCodeEditorMode.CANCEL

    const handleDeriveStatesFromManifestRef = () => {
        setError(manifestViewRef.current.data.error)
        setSecretViewAccess(manifestViewRef.current.data.secretViewAccess)
        setDesiredManifest(manifestViewRef.current.data.desiredManifest)
        setManifest(manifestViewRef.current.data.manifest)
        setModifiedManifest(manifestViewRef.current.data.modifiedManifest)
        setNormalizedLiveManifest(manifestViewRef.current.data.normalizedLiveManifest)
        setGUISchema(manifestViewRef.current.data.guiSchema)
        setLockedKeys(manifestViewRef.current.data.lockedKeys)

        if (showManifestCompareView) {
            setActiveManifestEditorData(manifestViewRef.current.data.manifest)
        } else {
            setActiveManifestEditorData(manifestViewRef.current.data.modifiedManifest)
        }
    }

    const isConfigDriftEnabled = window._env_.FEATURE_CONFIG_DRIFT_ENABLE

    const _selectedResource = isResourceBrowserView
        ? selectedResource
        : appDetails.resourceTree.nodes.filter(
              (data) => data.name === params.podName && data.kind.toLowerCase() === params.nodeType,
          )[0]

    const isReadOnlyView = showManifestCompareView || !isEditMode

    const showGUIView = !isReadOnlyView && manifestFormConfigurationType === ConfigurationType.GUI

    useEffectAfterMount(() => {
        // eslint-disable-next-line no-param-reassign
        manifestViewRef.current = {
            data: {
                error,
                secretViewAccess,
                desiredManifest,
                manifest,
                activeManifestEditorData,
                modifiedManifest,
                normalizedLiveManifest,
                guiSchema,
                lockedKeys,
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
        normalizedLiveManifest,
        id,
        guiSchema,
        lockedKeys,
    ])

    const handleInitializeGUISchema = async (abortSignal: AbortSignal) => {
        if (!getManifestGUISchema || !isManifestEditable) {
            return
        }

        const resourceRequestPayload = getResourceRequestPayload({
            appDetails,
            nodeName: params.podName,
            nodeType: params.nodeType,
            isResourceBrowserView,
            selectedResource,
        })

        const guiSchemaResponse = await getManifestGUISchema({
            clusterId: DEFAULT_CLUSTER_ID,
            gvk: resourceRequestPayload.k8sRequest.resourceIdentifier.groupVersionKind,
            signal: abortSignal,
        })

        setGUISchema(guiSchemaResponse)
    }

    const handleInitializeLockedManifestKeys = async (signal: AbortSignal) => {
        // NOTE: this feature is only applicable to non-superadmins
        if (!getLockedManifestKeys || !isManifestEditable || isSuperAdmin) {
            return
        }

        const resourceRequestPayload = getResourceRequestPayload({
            appDetails,
            nodeName: params.podName,
            nodeType: params.nodeType,
            isResourceBrowserView,
            selectedResource,
        })

        const lockedKeysResponse = await getLockedManifestKeys({
            clusterId: DEFAULT_CLUSTER_ID,
            gvk: resourceRequestPayload.k8sRequest.resourceIdentifier.groupVersionKind,
            signal,
        })

        setLockedKeys(lockedKeysResponse)
    }

    useEffect(() => {
        selectedTab(NodeDetailTab.MANIFEST, url)
        if (isDeleted) {
            /* NOTE:(linting) useEffect callback should have uniform return values */
            return () => {}
        }
        const abortController = new AbortController()
        setShowInfoText(
            _selectedResource &&
                !_selectedResource.group &&
                _selectedResource.kind === NodeType.Secret &&
                (isResourceBrowserView || appDetails.appType === AppType.EXTERNAL_HELM_CHART),
        )

        const _isResourceMissing =
            appDetails.appType === AppType.EXTERNAL_HELM_CHART &&
            (_selectedResource as unknown as Node)?.health?.status === 'Missing'
        setIsResourceMissing(_isResourceMissing)
        const _showDesiredAndCompareManifest =
            !isResourceBrowserView &&
            appDetails.appType === AppType.EXTERNAL_HELM_CHART &&
            !(_selectedResource as unknown as Node)?.parentRefs?.length
        setShowDesiredAndCompareManifest(_showDesiredAndCompareManifest)

        if (
            isResourceBrowserView ||
            appDetails.appType === AppType.EXTERNAL_HELM_CHART ||
            (appDetails.deploymentAppType === DeploymentAppTypes.GITOPS && appDetails.deploymentAppDeleteRequest)
        ) {
            setShowManifestCompareView(false)
            toggleManagedFields(!isEditMode)
        }

        /* NOTE: id helps discern data between manifests of different resources */
        if (manifestViewRef.current.data.manifest && manifestViewRef.current.id === id) {
            handleDeriveStatesFromManifestRef()
            setLoading(false)
            setManifestCodeEditorMode(ManifestCodeEditorMode.READ)
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
                    handleInitializeGUISchema(abortController.signal),
                    handleInitializeLockedManifestKeys(abortController.signal),
                ])
                    .then((response) => {
                        setSecretViewAccess(response[0]?.result?.secretViewAccess || false)
                        const _manifest = JSON.stringify(
                            response[0]?.result?.liveState || response[0]?.result?.manifestResponse?.manifest || '',
                        )
                        setDesiredManifest(
                            JSON.stringify(response[0]?.result?.predictedLiveState) ||
                                response[1]?.result?.manifest ||
                                '',
                        )
                        setNormalizedLiveManifest(JSON.stringify(response[0]?.result?.normalizedLiveState) || '')

                        if (_manifest) {
                            setManifest(_manifest)
                            setActiveManifestEditorData(_manifest)
                            setModifiedManifest(_manifest)
                        }
                        setLoading(false)
                        setManifestCodeEditorMode(ManifestCodeEditorMode.READ)

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
            } catch {
                setLoading(false)
            }
        }

        return () => {
            abortController.abort()
            setShowManifestCompareView(false)
            setManifestCodeEditorMode(null)
        }
    }, [])

    useEffect(() => {
        if (!isDeleted && !isEditMode && activeManifestEditorData !== modifiedManifest) {
            setActiveManifestEditorData(modifiedManifest)
        }
        if (isEditMode) {
            try {
                const jsonManifestData = YAML.parse(modifiedManifest)
                if (jsonManifestData?.metadata?.managedFields) {
                    setTrimedManifestEditorData(getTrimmedManifestData(jsonManifestData, true) as string)
                }
            } catch {
                noop()
            }
            toggleManagedFields(false)
        }
    }, [isEditMode, modifiedManifest])

    useEffect(() => {
        setTrimedManifestEditorData(activeManifestEditorData)
        if (!showManifestCompareView) {
            try {
                const jsonManifestData = YAML.parse(activeManifestEditorData)
                if (jsonManifestData?.metadata?.managedFields) {
                    toggleManagedFields(true)
                    if (hideManagedFields) {
                        setTrimedManifestEditorData(getTrimmedManifestData(jsonManifestData, true) as string)
                    }
                }
            } catch {
                noop()
            }
        }
    }, [activeManifestEditorData, hideManagedFields, showManifestCompareView])

    useEffect(() => {
        if (showManifestCompareView) {
            toggleManagedFields(false)
            setActiveManifestEditorData(manifest)
        } else {
            setActiveManifestEditorData(modifiedManifest)
        }
    }, [showManifestCompareView])

    const handleEditorValueChange = (codeEditorData: string) => {
        if (!showManifestCompareView && isEditMode) {
            setModifiedManifest(codeEditorData)
            // Question: Should we directly set this in case of errored string?
            setTrimedManifestEditorData(codeEditorData)

            try {
                YAML.parse(codeEditorData)
                handleUpdateUnableToParseManifest(false)
            } catch {
                handleUpdateUnableToParseManifest(true)
            }
        }
    }

    const handleGUIViewValueChange: FormProps['onChange'] = (data) => {
        handleManifestGUIErrors(data.errors || [])
        handleEditorValueChange(YAMLStringify(data.formData))
    }

    const handleEditLiveManifest = () => {
        toggleManagedFields(false)
        setActiveManifestEditorData(modifiedManifest)
    }

    const handleCallApplyChangesAPI = (manifestString: string): Promise<void> =>
        new Promise<void>((resolve) => {
            updateManifestResourceHelmApps(
                appDetails,
                params.podName,
                params.nodeType,
                manifestString,
                isResourceBrowserView,
                selectedResource,
            )
                .then((response) => {
                    setManifestCodeEditorMode(ManifestCodeEditorMode.READ)
                    const _manifest = JSON.stringify(response?.result?.manifest)
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Manifest is updated',
                    })
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
                    setManifestCodeEditorMode(ManifestCodeEditorMode.EDIT)
                    if (err.code === 403) {
                        ToastManager.showToast({
                            variant: ToastVariantType.notAuthorized,
                            description: TOAST_ACCESS_DENIED.SUBTITLE,
                        })
                    } else if (err.code === 400 || err.code === 409 || err.code === 422) {
                        const er = err.errors && err.errors[0]
                        if (er && er.code && er.userMessage) {
                            setErrorText(`ERROR ${err.code} > Message: “${er.userMessage}”`)
                        } else {
                            showError(err)
                        }
                    } else {
                        showError(err)
                    }
                })
                .finally(resolve)
        })

    const uneditedManifest = useMemo(() => {
        try {
            const object = YAML.parse(manifest)

            return object?.metadata?.managedFields && hideManagedFields ? getTrimmedManifestData(object) : object
        } catch (err) {
            logExceptionToSentry(new Error(`Error: in parsing manifest - ${err.message}`))

            return {}
        }
    }, [manifest, hideManagedFields])

    const handleApplyChanges = async () => {
        setLoading(true)
        setLoadingMsg('Applying changes')
        setShowDecodedData(false)
        setManifestCodeEditorMode(null)

        let modifiedManifestString: string = ''
        let modifiedManifestDocument: object = null

        try {
            if (!modifiedManifest) {
                setErrorText(`${SAVE_DATA_VALIDATION_ERROR_MSG} "${EMPTY_YAML_ERROR}"`)
                // Handled for blocking API call
                modifiedManifestString = ''
            } else {
                modifiedManifestDocument = YAML.parse(modifiedManifest)
                modifiedManifestString = JSON.stringify(modifiedManifestDocument)
            }
        } catch (err2) {
            setErrorText(`${SAVE_DATA_VALIDATION_ERROR_MSG} “${err2}”`)
        }
        if (!modifiedManifestString) {
            setLoading(false)
            setManifestCodeEditorMode(ManifestCodeEditorMode.EDIT)
        } else if (
            !isSuperAdmin &&
            checkForIneligibleChanges &&
            lockedKeys &&
            checkForIneligibleChanges(uneditedManifest, modifiedManifestDocument, lockedKeys)
        ) {
            setLoading(false)
            setShowLockedDiffModal(true)
            setManifestCodeEditorMode(ManifestCodeEditorMode.EDIT)
        } else {
            await handleCallApplyChangesAPI(modifiedManifestString)
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
        setManifestCodeEditorMode(ManifestCodeEditorMode.READ)
        setModifiedManifest(manifest)
        setActiveManifestEditorData('')
        setErrorText('')
        setShowDecodedData(false)
        toggleManagedFields(true)
    }

    useEffectAfterMount(() => {
        switch (manifestCodeEditorMode) {
            case ManifestCodeEditorMode.CANCEL:
                handleCancel()
                break
            case ManifestCodeEditorMode.EDIT:
                handleEditLiveManifest()
                break
            case ManifestCodeEditorMode.APPLY_CHANGES:
                handleApplyChanges().catch(noop)
                break
            default:
            // DO NOTHING
        }
    }, [manifestCodeEditorMode])

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

    const handleDesiredManifestClose = () => setShowManifestCompareView(false)
    const handleDesiredManifestOpen = () => setShowManifestCompareView(true)

    const handleCloseShowLockedDiffModal = () => {
        setShowLockedDiffModal(false)
    }

    const renderNoContentToDecodeTippy = (children) => (
        <Tippy
            className="default-tt w-200"
            arrow={false}
            placement="top-start"
            content="Nothing to decode, data field not found."
        >
            {children}
        </Tippy>
    )

    const renderShowDecodedValueCheckbox = () => {
        let jsonManifestData

        try {
            jsonManifestData = YAML.parse(trimedManifestEditorData)
        } catch {
            return null
        }

        if (jsonManifestData?.kind !== 'Secret' || isEditMode || !secretViewAccess) {
            return null
        }

        return (
            <ConditionalWrap condition={!jsonManifestData?.data} wrap={renderNoContentToDecodeTippy}>
                <div
                    className={`${!jsonManifestData?.data ? 'dc__opacity-0_5 cursor-not-allowed' : ''} flex left ml-8`}
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

    const getCodeEditorValue = () => {
        // In case of devtron apps we compare normalized values
        if (isConfigDriftEnabled && appDetails?.appType === AppType.DEVTRON_APP && showManifestCompareView) {
            return normalizedLiveManifest
        }

        return trimedManifestEditorData
    }

    const renderEditorInfo = (isCodeEditorView: boolean = false) => {
        if (!showInfoText) {
            return null
        }

        const message =
            isEditMode && !showManifestCompareView
                ? EA_MANIFEST_SECRET_EDIT_MODE_INFO_TEXT
                : EA_MANIFEST_SECRET_INFO_TEXT

        if (isCodeEditorView) {
            return (
                <CodeEditor.Information text={message} className="flex left">
                    {renderShowDecodedValueCheckbox()}
                </CodeEditor.Information>
            )
        }

        return <InfoBlock description={message} {...manifestBorderConfig} />
    }

    const renderErrorBar = (isCodeEditorView: boolean = false) => {
        if (showManifestCompareView || !errorText) {
            return null
        }

        if (isCodeEditorView) {
            return <CodeEditor.ErrorBar text={errorText} />
        }

        return <InfoBlock variant="error" description={errorText} {...manifestBorderConfig} />
    }

    const renderContent = () => {
        if (showGUIView) {
            return (
                <>
                    {renderEditorInfo()}
                    {renderErrorBar()}
                    <ManifestGUIView
                        manifestGUIFormRef={manifestGUIFormRef}
                        guiSchema={guiSchema}
                        handleChange={handleGUIViewValueChange}
                        // For uniformity have called method but as of now in this case it will always be trimedManifestEditorData
                        manifestYAMLString={getCodeEditorValue()}
                        handleSwitchToYAMLMode={handleSwitchToYAMLMode}
                    />
                </>
            )
        }

        return (
            <div className="flex-grow-1 flexbox-col">
                <CodeEditor
                    cleanData={showManifestCompareView}
                    diffView={showManifestCompareView}
                    mode={MODES.YAML}
                    readOnly={isReadOnlyView}
                    loading={loading}
                    customLoader={<MessageUI msg={loadingMsg} icon={MsgUIType.LOADING} size={24} />}
                    theme={AppThemeType.dark}
                    height={isResourceBrowserView || isDynamicTabsStuck ? 'fitToParent' : '100%'}
                    onOpenSearchPanel={isResourceBrowserView ? noop : handleStickDynamicTabsToTop}
                    {...(showManifestCompareView
                        ? {
                              diffView: true,
                              originalValue: desiredManifest,
                              modifiedValue: getCodeEditorValue(),
                              onModifiedValueChange: handleEditorValueChange,
                          }
                        : {
                              diffView: false,
                              value: getCodeEditorValue(),
                              onChange: handleEditorValueChange,
                              autoFocus: isEditMode,
                          })}
                >
                    {renderEditorInfo(true)}

                    {!loading &&
                        !error &&
                        isConfigDriftEnabled &&
                        'hasDrift' in _selectedResource &&
                        _selectedResource.hasDrift &&
                        !showManifestCompareView &&
                        renderOutOfSyncWarning &&
                        renderOutOfSyncWarning(handleDesiredManifestOpen)}
                    {showManifestCompareView && (
                        <CodeEditor.Header hideDefaultSplitHeader>
                            <div className="flex dc__content-space dc__gap-8 pr-16">
                                <p className="m-0 cn-9">Desired manifest</p>
                                <button
                                    type="button"
                                    className="dc__unset-button-styles flex"
                                    aria-label="Close Desired Manifest"
                                    onClick={handleDesiredManifestClose}
                                >
                                    <ICClose className="icon-dim-16 scn-0" />
                                </button>
                            </div>
                            <p className="m-0 cn-9 pl-16">Live manifest</p>
                        </CodeEditor.Header>
                    )}

                    {renderErrorBar(true)}
                </CodeEditor>
            </div>
        )
    }

    return isDeleted ? (
        <div className="h-100 flex-grow-1">
            <MessageUI msg="This resource no longer exists" size={32} />
        </div>
    ) : (
        <div
            className="flexbox-col flex-grow-1"
            data-testid="app-manifest-container"
            style={{
                background: 'var(--terminal-bg)',
            }}
        >
            {error && !loading && <MessageUI msg="Manifest not available" size={24} />}
            {!error && (
                <div
                    className={`${
                        manifestFormConfigurationType === ConfigurationType.GUI ? 'bg__primary' : ''
                    } flexbox-col flex-grow-1 ${isResourceBrowserView ? 'dc__overflow-hidden' : ''}`}
                >
                    {isResourceMissing && !loading && !showManifestCompareView ? (
                        <MessageUI
                            msg="Manifest not available"
                            size={24}
                            isShowActionButton={showDesiredAndCompareManifest}
                            actionButtonText="Recreate this resource"
                            onActionButtonClick={recreateResource}
                        />
                    ) : (
                        renderContent()
                    )}
                </div>
            )}

            {showLockedDiffModal && ShowIneligibleChangesModal && (
                <ShowIneligibleChangesModal
                    handleCallApplyChangesAPI={handleCallApplyChangesAPI}
                    uneditedManifest={uneditedManifest}
                    // NOTE: a check on modifiedManifest is made before this component is rendered
                    editedManifest={YAML.parse(modifiedManifest)}
                    handleModalClose={handleCloseShowLockedDiffModal}
                    lockedKeys={lockedKeys}
                />
            )}
        </div>
    )
}

export default ManifestComponent
