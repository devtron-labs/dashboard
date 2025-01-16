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

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { NavLink, Redirect, Route, Switch, useParams, useRouteMatch, useLocation } from 'react-router-dom'
import {
    showError,
    Checkbox,
    CHECKBOX_VALUE,
    OptionType,
    DeploymentAppTypes,
    TabGroup,
    TabProps,
    ComponentSizeType,
    capitalizeFirstLetter,
    ConfigurationType,
    FormProps,
    ToastManager,
    ToastVariantType,
    OptionsBase
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICArrowsLeftRight } from '@Icons/ic-arrows-left-right.svg'
import { ReactComponent as ICPencil } from '@Icons/ic-pencil.svg'
import { ReactComponent as ICCheck } from '@Icons/ic-check.svg'
import EventsComponent from './NodeDetailTabs/Events.component'
import LogsComponent from './NodeDetailTabs/Logs.component'
import ManifestComponent from './NodeDetailTabs/Manifest.component'
import TerminalComponent from './NodeDetailTabs/Terminal.component'
import SummaryComponent from './NodeDetailTabs/Summary.component'
import { NodeDetailTab, ParamsType } from './nodeDetail.type'
import {
    AppType,
    ManifestActionPropsType,
    ManifestCodeEditorMode,
    ManifestViewRefType,
    NodeDetailPropsType,
    NodeType,
    Options,
} from '../../appDetails.type'
import AppDetailsStore from '../../appDetails.store'
import { useSharedState } from '../../../utils/useSharedState'
import IndexStore from '../../index.store'
import { getManifestResource } from './nodeDetail.api'
import MessageUI, { MsgUIType } from '../../../common/message.ui'
import { Nodes } from '../../../../app/types'
import './nodeDetail.css'
import { getContainersData, getNodeDetailTabs } from './nodeDetail.util'
import EphemeralContainerDrawer from './EphemeralContainerDrawer'
import { ReactComponent as EphemeralIcon } from '../../../../../assets/icons/ic-ephemeral.svg'
import { ReactComponent as DeleteIcon } from '../../../../../assets/icons/ic-delete-interactive.svg'
import { CLUSTER_NODE_ACTIONS_LABELS } from '../../../../ClusterNodes/constants'
import DeleteResourcePopup from '../../../../ResourceBrowser/ResourceList/DeleteResourcePopup'
import { EDITOR_VIEW } from '@Config/constants'
import { importComponentFromFELibrary } from '@Components/common'

const isFELibAvailable = importComponentFromFELibrary('isFELibAvailable', false, 'function')
const ToggleManifestConfigurationMode = importComponentFromFELibrary(
    'ToggleManifestConfigurationMode',
    null,
    'function',
)

const NodeDetailComponent = ({
    loadingResources,
    isResourceBrowserView,
    lowercaseKindToResourceGroupMap,
    logSearchTerms,
    setLogSearchTerms,
    removeTabByIdentifier,
    updateTabUrl,
    isExternalApp,
    clusterName = '',
}: NodeDetailPropsType) => {
    const location = useLocation()
    const [applicationObjectTabs] = useSharedState(
        AppDetailsStore.getAppDetailsTabs(),
        AppDetailsStore.getAppDetailsTabsObservable(),
    )
    const appDetails = IndexStore.getAppDetails()
    const params = useParams<ParamsType>()
    const [tabs, setTabs] = useState([])
    const [selectedTabName, setSelectedTabName] = useState('')
    const [resourceContainers, setResourceContainers] = useState<OptionsBase[]>([])
    const [isResourceDeleted, setResourceDeleted] = useState(false)
    const [isManagedFields, setManagedFields] = useState(false)
    const [hideManagedFields, setHideManagedFields] = useState(true)
    const [fetchingResource, setFetchingResource] = useState(
        isResourceBrowserView && params.nodeType === Nodes.Pod.toLowerCase(),
    )
    const [selectedContainer, setSelectedContainer] = useState<Map<string, string>>(new Map())
    const [showEphemeralContainerDrawer, setShowEphemeralContainerDrawer] = useState<boolean>(false)
    const [ephemeralContainerType, setEphemeralContainerType] = useState<string>(EDITOR_VIEW.BASIC)
    const [targetContainerOption, setTargetContainerOption] = useState<OptionType[]>([])
    const [imageListOption, setImageListOption] = useState<OptionType[]>([])
    const podMetaData = !isResourceBrowserView && IndexStore.getMetaDataForPod(params.podName)
    const { path, url } = useRouteMatch()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showManifestCompareView, setShowManifestCompareView] = useState(false)
    const [manifestCodeEditorMode, setManifestCodeEditorMode] = useState<ManifestCodeEditorMode>(null)

    const toggleManagedFields = (managedFieldsExist: boolean) => {
        if (selectedTabName === NodeDetailTab.MANIFEST && managedFieldsExist) {
            setManagedFields(true)
        } else {
            setManagedFields(false)
        }
    }

    const _selectedResource = useMemo(
        () => lowercaseKindToResourceGroupMap[params.nodeType.toLowerCase()],
        [lowercaseKindToResourceGroupMap, params.nodeType],
    )

    const resourceName = isResourceBrowserView ? params.node : params.podName

    const selectedResource = {
        clusterId: +params.clusterId,
        clusterName,
        kind: _selectedResource?.gvk.Kind as string,
        version: _selectedResource?.gvk.Version,
        group: _selectedResource?.gvk.Group,
        namespace: params.namespace,
        name: resourceName,
        containers: [],
    }

    const currentResource = isResourceBrowserView
        ? selectedResource
        : appDetails.resourceTree.nodes.filter(
              (data) => data.name === params.podName && data.kind.toLowerCase() === params.nodeType,
          )[0]

    const showDesiredAndCompareManifest =
        !isResourceBrowserView &&
        (appDetails.appType === AppType.EXTERNAL_HELM_CHART ||
            (window._env_.FEATURE_CONFIG_DRIFT_ENABLE &&
                appDetails.appType === AppType.DEVTRON_APP &&
                isFELibAvailable)) &&
        !currentResource?.['parentRefs']?.length

    const isResourceMissing =
        appDetails.appType === AppType.EXTERNAL_HELM_CHART && currentResource?.['health']?.status === 'Missing'

    const [containers, setContainers] = useState<Options[]>(
        (isResourceBrowserView ? selectedResource?.containers ?? [] : getContainersData(podMetaData)) as Options[],
    )
    const [startTerminal, setStartTerminal] = useState<boolean>(false)

    const selectedContainerValue = isResourceBrowserView ? selectedResource?.name : podMetaData?.name
    const _selectedContainer = selectedContainer.get(selectedContainerValue) || containers?.[0]?.name || ''
    const [selectedContainerName, setSelectedContainerName] = useState<OptionType>({
        label: _selectedContainer,
        value: _selectedContainer,
    })
    const [hideDeleteButton, setHideDeleteButton] = useState(false)
    const [manifestFormConfigurationType, setManifestFormConfigurationType] = useState<ConfigurationType>(
        ConfigurationType.YAML,
    )
    const [manifestErrors, setManifestErrors] = useState<Parameters<FormProps['onError']>[0]>([])
    const [unableToParseManifest, setUnableToParseManifest] = useState<boolean>(false)

    // States uplifted from Manifest Component
    const manifestViewRef = useRef<ManifestViewRefType>({
        data: {
            error: false,
            secretViewAccess: false,
            desiredManifest: '',
            manifest: '',
            activeManifestEditorData: '',
            modifiedManifest: '',
            normalizedLiveManifest: '',
            guiSchema: {},
            lockedKeys: null,
        },
        id: '',
    })

    const manifestGUIFormRef: FormProps['ref'] = useRef(null)

    useEffect(() => setManagedFields((prev) => prev && selectedTabName === NodeDetailTab.MANIFEST), [selectedTabName])

    useEffect(() => {
        if (location.pathname.endsWith('/terminal') && params.nodeType === Nodes.Pod.toLowerCase()) {
            setStartTerminal(true)
        }
    }, [location])

    useEffect(() => {
        if (params.nodeType) {
            const _tabs = getNodeDetailTabs(params.nodeType as NodeType, true)
            setTabs(_tabs)
        }
    }, [params.nodeType])

    useEffect(() => {
        if (
            isResourceBrowserView &&
            !loadingResources &&
            selectedResource &&
            resourceName &&
            params.nodeType === Nodes.Pod.toLowerCase()
        ) {
            getContainersFromManifest()
        }
    }, [loadingResources, resourceName, params.namespace])

    const getContainersFromManifest = async () => {
        try {
            const nullCaseName = isResourceBrowserView && params.nodeType === 'pod' ? resourceName : ''
            const { result } = await getManifestResource(
                appDetails,
                resourceName,
                params.nodeType,
                isResourceBrowserView,
                {
                    ...selectedResource,
                    name: selectedResource.name ? selectedResource.name : nullCaseName,
                    namespace: selectedResource.namespace ? selectedResource.namespace : params.namespace,
                },
            ) as any
            const _resourceContainers = []
            if (result?.manifestResponse?.manifest?.spec) {
                if (Array.isArray(result.manifestResponse.manifest.spec.containers)) {
                    _resourceContainers.push(
                        ...result.manifestResponse.manifest.spec.containers.map((_container) => ({
                            name: _container.name,
                            isInitContainer: false,
                            isEphemeralContainer: false,
                        })),
                    )
                }

                if (Array.isArray(result.manifestResponse.manifest.spec.initContainers)) {
                    _resourceContainers.push(
                        ...result.manifestResponse.manifest.spec.initContainers.map((_container) => ({
                            name: _container.name,
                            isInitContainer: true,
                            isEphemeralContainer: false,
                        })),
                    )
                }
            }

            if (result?.manifestResponse?.ephemeralContainers) {
                _resourceContainers.push(
                    ...result.manifestResponse.ephemeralContainers.map((_container) => ({
                        name: _container.name,
                        isInitContainer: false,
                        isEphemeralContainer: true,
                        isExternal: _container.isExternal,
                    })),
                )
            }

            setResourceContainers(_resourceContainers)
            if (isResourceBrowserView) {
                setContainers(_resourceContainers ?? [])
            }
            // Clear out error on node change
            if (isResourceDeleted) {
                setResourceDeleted(false)
            }
        } catch (err) {
            // when resource is deleted
            if (Array.isArray(err['errors']) && err['errors'].some((_err) => _err.code === '404')) {
                setResourceDeleted(true)
                setHideDeleteButton(true)
                // when user is not authorized to view resource
            } else if (err['code'] === 403) {
                setHideDeleteButton(true)
                showError(err)
            } else {
                showError(err)

                // Clear out error on node change
                if (isResourceDeleted) {
                    setResourceDeleted(false)
                }
            }
        } finally {
            setFetchingResource(false)
        }
    }

    const handleManifestGUIError: ManifestActionPropsType['handleManifestGUIErrors'] = (errors = []) => {
        setManifestErrors(errors)
    }

    const handleSelectedTab = (_tabName: string, _url: string) => {
        setSelectedTabName(_tabName)
        updateTabUrl?.({
            url: _url
        })

        /**
         * NOTE: resource browser handles creation of missing tabs;
         * Need to remove this whole function and not keep missing tab creation
         * logic here. Instead it should be the concern on this component & should
         * only be done on component mount */
        if (isResourceBrowserView) {
            return
        }

        /* NOTE: this setTimeout is dangerous; Need to refactor later */
        if (!AppDetailsStore.markAppDetailsTabActiveByIdentifier(params.podName, params.nodeType, _url)) {
            setTimeout(() => {
                let _urlToCreate = _url

                const query = new URLSearchParams(window.location.search)

                if (query.get('container')) {
                    _urlToCreate = `${_urlToCreate}?container=${query.get('container')}`
                }

                AppDetailsStore.addAppDetailsTab(params.nodeType, params.podName, _urlToCreate)
            }, 500)
        }
    }

    const currentTab = applicationObjectTabs.filter((tab) => {
        return tab.name.toLowerCase() === `${params.nodeType}/...${resourceName?.slice(-6)}`
    })
    const isDeleted =
        (currentTab?.[0] ? currentTab[0].isDeleted : false) ||
        (isResourceBrowserView && isResourceDeleted) ||
        (!isResourceBrowserView &&
            !(
                appDetails.resourceTree.nodes?.findIndex(
                    (node) => node.name === params.podName && node.kind.toLowerCase() === params.nodeType,
                ) >= 0
            ))

    const doesManifestGUIContainsError = manifestErrors.length > 0

    // Assign extracted containers to selected resource before passing further
    if (selectedResource) {
        selectedResource.containers = resourceContainers
    }

    const handleChanges = (): void => {
        setHideManagedFields(!hideManagedFields)
    }

    const onClickShowLaunchEphemeral = (): void => {
        setShowEphemeralContainerDrawer(!showEphemeralContainerDrawer)
        if (showEphemeralContainerDrawer) {
            setEphemeralContainerType(EDITOR_VIEW.BASIC)
        }
    }

    const switchSelectedContainer = (containerName: string) => {
        setSelectedContainerName({ label: containerName, value: containerName })
        setSelectedContainer(selectedContainer.set(selectedContainerValue, containerName))
    }

    const toggleDeleteDialog = () => {
        setShowDeleteDialog((prevState) => !prevState)
    }

    const getComponentKeyFromParams = () => {
        return Object.values(params).join('/')
    }

    const handleManifestApplyChanges = () => {
        const isFormValid = !manifestGUIFormRef.current?.validateForm || manifestGUIFormRef.current.validateForm()

        if (!isFormValid) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Validation failed for some input fields, please rectify and apply changes again.',
            })

            return
        }

        setManifestCodeEditorMode(ManifestCodeEditorMode.APPLY_CHANGES)
    }

    const handleManifestCancel = () => {
        handleManifestGUIError([])
        handleUpdateUnableToParseManifest(false)
        setManifestCodeEditorMode(ManifestCodeEditorMode.CANCEL)
    }

    const handleManifestEdit = () => setManifestCodeEditorMode(ManifestCodeEditorMode.EDIT)

    const handleManifestCompareWithDesired = () => setShowManifestCompareView(true)

    const renderPodTerminal = (): JSX.Element => {
        if (!startTerminal) {
            return null
        }
        return (
            <TerminalComponent
                key={getComponentKeyFromParams()}
                showTerminal={location.pathname.endsWith('/terminal')}
                selectedTab={handleSelectedTab}
                isDeleted={isDeleted}
                isResourceBrowserView={isResourceBrowserView}
                selectedResource={selectedResource}
                selectedContainer={selectedContainer}
                setSelectedContainer={setSelectedContainer}
                containers={containers}
                setContainers={setContainers}
                selectedContainerName={selectedContainerName}
                setSelectedContainerName={setSelectedContainerName}
                switchSelectedContainer={switchSelectedContainer}
            />
        )
    }

    const handleToggleManifestConfigurationMode = (e: React.ChangeEvent<HTMLInputElement>) => {
        setManifestFormConfigurationType(e.target.value as ConfigurationType)
    }

    const handleSwitchToYAMLMode = () => {
        setManifestFormConfigurationType(ConfigurationType.YAML)
    }

    const handleUpdateUnableToParseManifest: ManifestActionPropsType['handleUpdateUnableToParseManifest'] = (
        value: boolean,
    ) => {
        setUnableToParseManifest(value)
    }

    const renderManifestTabHeader = () => (
        <>
            {(isExternalApp ||
                isResourceBrowserView ||
                (appDetails.deploymentAppType === DeploymentAppTypes.GITOPS &&
                    appDetails.deploymentAppDeleteRequest)) &&
                manifestCodeEditorMode &&
                !showManifestCompareView &&
                !isResourceMissing && (
                    <>
                        <div className="ml-12 mr-12 tab-cell-border" />
                        {manifestCodeEditorMode === ManifestCodeEditorMode.EDIT ? (
                            <div className="flex dc__gap-12">
                                {ToggleManifestConfigurationMode && !isExternalApp && (
                                    <ToggleManifestConfigurationMode
                                        mode={manifestFormConfigurationType}
                                        handleToggle={handleToggleManifestConfigurationMode}
                                        isDisabled={unableToParseManifest || doesManifestGUIContainsError}
                                    />
                                )}

                                <button
                                    type="button"
                                    className={`dc__unset-button-styles cb-5 fs-12 lh-1-5 fw-6 flex dc__gap-4 ${doesManifestGUIContainsError ? 'dc__disabled' : ''}`}
                                    onClick={handleManifestApplyChanges}
                                    disabled={doesManifestGUIContainsError}
                                >
                                    <>
                                        <ICCheck className="icon-dim-16 scb-5" />
                                        <span>Apply changes</span>
                                    </>
                                </button>
                                <button
                                    type="button"
                                    className="dc__unset-button-styles fs-12 lh-1-5 fw-6 flex cn-6"
                                    onClick={handleManifestCancel}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="dc__unset-button-styles cb-5 fs-12 lh-1-5 fw-6 flex dc__gap-4"
                                onClick={handleManifestEdit}
                            >
                                <>
                                    <ICPencil className="icon-dim-16 scb-5" />
                                    <span>Edit live manifest</span>
                                </>
                            </button>
                        )}
                    </>
                )}
            {manifestCodeEditorMode === ManifestCodeEditorMode.READ &&
                !showManifestCompareView &&
                (showDesiredAndCompareManifest || isResourceMissing) && (
                    <>
                        <div className="ml-12 mr-12 tab-cell-border" />
                        <button
                            type="button"
                            className="dc__unset-button-styles cb-5 fs-12 lh-1-5 fw-6 flex dc__gap-4"
                            onClick={handleManifestCompareWithDesired}
                        >
                            <ICArrowsLeftRight className="icon-dim-16 scb-5" />
                            <span>Compare with desired</span>
                        </button>
                    </>
                )}
        </>
    )

    const TAB_GROUP_CONFIG: TabProps[] = tabs?.map((tab: string, idx: number) => {
        return {
            id: `${idx}resourceTreeTab`,
            label: capitalizeFirstLetter(tab),
            tabType: 'navLink',
            props: {
                to: `${url}/${tab.toLowerCase()}${location.search}`,
                ['data-testid']: `${tab.toLowerCase()}-nav-link`,
            }
        }
    })

    return (
        <>
            <div
                className={`w-100 pr-20 pl-20 bcn-0 flex dc__border-bottom dc__content-space ${!isResourceBrowserView ? 'node-detail__sticky' : ''}`}
            >
                <div className="flex left">
                    <TabGroup tabs={TAB_GROUP_CONFIG} size={ComponentSizeType.medium} alignActiveBorderWithContainer />
                    {selectedTabName === NodeDetailTab.TERMINAL && (
                        <>
                            <div className="ml-12 mr-5 tab-cell-border" />
                            <div className="cursor cb-5 fw-6 flex" onClick={onClickShowLaunchEphemeral}>
                                <EphemeralIcon className="mr-4 icon-dim-16 scb-5" />
                                Launch Ephemeral Container
                            </div>
                        </>
                    )}
                    {isManagedFields && (
                        <>
                            <div className="ml-12 mr-5 tab-cell-border" />
                            <div className="pt-6 pb-6 pl-8 pr-8 top">
                                <Checkbox
                                    rootClassName="mb-0-imp h-20"
                                    isChecked={hideManagedFields}
                                    value={CHECKBOX_VALUE.CHECKED}
                                    onChange={handleChanges}
                                >
                                    <span className="mr-5 cn-9 fs-12" data-testid="hide-managed-fields">
                                        Hide Managed Fields
                                    </span>
                                </Checkbox>
                            </div>
                        </>
                    )}
                    {selectedTabName === NodeDetailTab.MANIFEST && renderManifestTabHeader()}
                </div>
                {isResourceBrowserView &&
                    !hideDeleteButton && ( // hide delete button if resource is deleted or user is not authorized
                        <span className="flex left fw-6 cr-5 ml-16 fs-12 cursor" onClick={toggleDeleteDialog}>
                            <DeleteIcon className="icon-dim-16 mr-5 scr-5" />
                            {CLUSTER_NODE_ACTIONS_LABELS.delete}
                        </span>
                    )}
            </div>
            {renderPodTerminal()}

            {fetchingResource || (isResourceBrowserView && (loadingResources || !selectedResource)) ? (
                <MessageUI msg="" icon={MsgUIType.LOADING} size={24} />
            ) : (
                <Switch>
                    <Route path={`${path}/${NodeDetailTab.MANIFEST}`}>
                        <ManifestComponent
                            key={getComponentKeyFromParams()}
                            selectedTab={handleSelectedTab}
                            isDeleted={isDeleted}
                            toggleManagedFields={toggleManagedFields}
                            hideManagedFields={hideManagedFields}
                            isResourceBrowserView={isResourceBrowserView}
                            selectedResource={selectedResource}
                            manifestViewRef={manifestViewRef}
                            getComponentKey={getComponentKeyFromParams}
                            showManifestCompareView={showManifestCompareView}
                            setShowManifestCompareView={setShowManifestCompareView}
                            manifestCodeEditorMode={manifestCodeEditorMode}
                            setManifestCodeEditorMode={setManifestCodeEditorMode}
                            handleSwitchToYAMLMode={handleSwitchToYAMLMode}
                            manifestFormConfigurationType={manifestFormConfigurationType}
                            handleUpdateUnableToParseManifest={handleUpdateUnableToParseManifest}
                            handleManifestGUIErrors={handleManifestGUIError}
                            manifestGUIFormRef={manifestGUIFormRef}
                            isExternalApp={isExternalApp}
                        />
                    </Route>
                    <Route path={`${path}/${NodeDetailTab.EVENTS}`}>
                        <EventsComponent
                            key={getComponentKeyFromParams()}
                            selectedTab={handleSelectedTab}
                            isDeleted={isDeleted}
                            isResourceBrowserView={isResourceBrowserView}
                            selectedResource={selectedResource}
                        />
                    </Route>
                    <Route path={`${path}/${NodeDetailTab.LOGS}`}>
                        <div className="flex-grow-1 flexbox-col">
                            <LogsComponent
                                key={getComponentKeyFromParams()}
                                selectedTab={handleSelectedTab}
                                isDeleted={isDeleted}
                                logSearchTerms={logSearchTerms}
                                setLogSearchTerms={setLogSearchTerms}
                                isResourceBrowserView={isResourceBrowserView}
                                selectedResource={selectedResource}
                                ephemeralContainerType={ephemeralContainerType}
                                targetContainerOption={targetContainerOption}
                                imageListOption={imageListOption}
                                isExternalApp={isExternalApp}
                            />
                        </div>
                    </Route>
                    {/* NOTE: this seems like an obsolete component? since it can't be reached through UI */}
                    {!isResourceBrowserView && (
                        <Route path={`${path}/${NodeDetailTab.SUMMARY}`}>
                            <SummaryComponent selectedTab={handleSelectedTab} />
                        </Route>
                    )}
                    {!location.pathname.endsWith('/terminal') && (
                        <Redirect to={`${path}/${NodeDetailTab.MANIFEST.toLowerCase()}`} />
                    )}
                </Switch>
            )}
            {showEphemeralContainerDrawer && (
                <EphemeralContainerDrawer
                    setShowEphemeralContainerDrawer={setShowEphemeralContainerDrawer}
                    onClickShowLaunchEphemeral={onClickShowLaunchEphemeral}
                    params={params}
                    setResourceContainers={setResourceContainers}
                    setEphemeralContainerType={setEphemeralContainerType}
                    ephemeralContainerType={ephemeralContainerType}
                    setImageListOption={setImageListOption}
                    imageListOption={imageListOption}
                    setTargetContainerOption={setTargetContainerOption}
                    targetContainerOption={targetContainerOption}
                    isResourceBrowserView={isResourceBrowserView}
                    containers={containers}
                    setContainers={setContainers}
                    switchSelectedContainer={switchSelectedContainer}
                    selectedNamespaceByClickingPod={selectedResource?.namespace}
                     {...isResourceBrowserView ? {handleSuccess: getContainersFromManifest} : {}}
                />
            )}
            {isResourceBrowserView && showDeleteDialog && (
                <DeleteResourcePopup
                    clusterId={`${selectedResource.clusterId}`}
                    resourceData={selectedResource}
                    selectedResource={{
                        gvk: {
                            Group: selectedResource.group,
                            Version: selectedResource.version,
                            Kind: selectedResource.kind as NodeType,
                        },
                        namespaced: false,
                    }}
                    getResourceListData={getContainersFromManifest}
                    toggleDeleteDialog={toggleDeleteDialog}
                    removeTabByIdentifier={removeTabByIdentifier}
                />
            )}
        </>
    )
}

export default React.memo(NodeDetailComponent)
