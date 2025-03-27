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

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Redirect, Route, RouteComponentProps, Router, Switch, useHistory, useLocation } from 'react-router-dom'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    DevtronProgressing,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'
import { ModuleNameMap, SERVER_MODE, URLS } from '../../../config'
import { ErrorBoundary, useInterval } from '../../common'
import AboutDevtronView from './AboutDevtronView'
import {
    handleError,
    ModuleDetailsView,
    ModulesListingView,
    NavItem,
    StackPageHeader,
} from './DevtronStackManager.component'
import { getAllModules, getLogPodName, getModuleInfo, getReleasesNotes } from './DevtronStackManager.service'
import {
    AllModuleInfoResponse,
    InstallationType,
    LogPodNameResponse,
    ModuleDetails,
    ModuleInfo,
    ModuleStatus,
    ReleaseNotesResponse,
    ServerInfo,
    StackDetailsType,
} from './DevtronStackManager.type'
import './devtronStackManager.scss'
import { isGitopsConfigured } from '../../../services/service'
import AppStatusDetailModal from '../appDetails/sourceInfo/environmentStatus/AppStatusDetailModal'
import { AppStatusClass, buildResourceStatusModalData } from './DevtronStackManager.utils'

export default function DevtronStackManager({
    serverInfo,
    getCurrentServerInfo,
    isSuperAdmin,
}: {
    serverInfo: ServerInfo
    getCurrentServerInfo: () => Promise<void>
    isSuperAdmin: boolean
}) {
    const { serverMode, moduleInInstallingState, setModuleInInstallingState, installedModuleMap } = useMainContext()
    const history: RouteComponentProps['history'] = useHistory()
    const location: RouteComponentProps['location'] = useLocation()
    const [stackDetails, setStackDetails] = useState<StackDetailsType>({
        isLoading: false,
        discoverModulesList: [],
        installedModulesList: [],
        releaseNotes: [],
        errorStatusCode: 0,
    })
    const [logPodName, setLogPodName] = useState('')
    const [selectedModule, setSelectedModule] = useState<ModuleDetails>()
    const [actionTriggered, setActionTriggered] = useState<Record<string, boolean>>({
        serverAction: false,
    })
    const [detailsMode, setDetailsMode] = useState('')
    const [selectedTabIndex, setSelectedTabIndex] = useState(
        location.pathname.includes(URLS.STACK_MANAGER_ABOUT_RELEASES) ? 1 : 0,
    )
    const stackManagerRef = useRef<HTMLElement>()
    const queryParams = new URLSearchParams(location.search)

    const [showPreRequisiteConfirmationModal, setShowPreRequisiteConfirmationModal] = useState<boolean>(false)
    const [preRequisiteChecked, setPreRequisiteChecked] = useState<boolean>(false)
    const [showResourceStatusModal, setShowResourceStatusModal] = useState(false)
    const [dialog, setDialog] = useState<boolean>(false)
    const [retryState, setRetryState] = useState<boolean>(false)
    const [successState, setSuccessState] = useState<boolean>(false)
    const [toggled, setToggled] = useState<boolean>(false)
    useEffect(() => {
        getModuleDetails()
        getCurrentServerInfo()
    }, [])

    useEffect(() => {
        buildResourceStatusModalData(selectedModule?.moduleResourcesStatus)
    }, [selectedModule])

    /**
     * Activate polling for latest server info, module details & logPodName
     * only on stack manager page & only when installationType is OSS_HELM.
     */
    useInterval(
        () => {
            getCurrentServerInfo()
            _getDetailsForAllModules(stackDetails.discoverModulesList, stackDetails)
            _getLogPodName()
        },
        serverInfo?.installationType === InstallationType.OSS_HELM ? 30000 : null,
    )

    /**
     * To reset detailsMode when switching to "About devtron" using "Help option" (side nav)
     * or "Check for updates" after successful installtion from module details view/page
     */
    useEffect(() => {
        if (location.pathname.includes('/stack-manager') && !queryParams.has('id')) {
            setDetailsMode('')
        }
    }, [location.pathname])

    // To fetch the latest module/server details, right after triggering the install/update action.
    useEffect(() => {
        if (queryParams.get('actionTriggered') === 'true') {
            getLatestInfo()
            queryParams.delete('actionTriggered')
            history.push(`${location.pathname}?${queryParams.toString()}`)
        } else if (location.pathname.includes(URLS.DETAILS) && selectedModule) {
            const moduleId = queryParams.get('id')
            if (moduleId && selectedModule.name.toLowerCase() !== moduleId.toLowerCase()) {
                const _selectedModule = stackDetails.discoverModulesList.find(
                    (module) => module.name.toLowerCase() === moduleId.toLowerCase(),
                )

                if (_selectedModule) {
                    setSelectedModule(_selectedModule)
                }
            }
        }
    }, [location.search])

    /**
     * To update the installation status for seleted module after fetching latest details
     * when on module details view
     */
    useEffect(() => {
        if (stackDetails.discoverModulesList.length > 0) {
            if (
                location.pathname.includes(URLS.STACK_MANAGER_INSTALLED_MODULES_DETAILS) &&
                stackDetails.installedModulesList.length === 0
            ) {
                history.push(URLS.STACK_MANAGER_INSTALLED_MODULES)
            } else if (location.pathname.includes(URLS.DETAILS) && queryParams.get('id')) {
                const _selectedModule = stackDetails.discoverModulesList.find(
                    (module) => module.name.toLowerCase() === queryParams.get('id').toLowerCase(),
                )

                if (!_selectedModule) {
                    history.push(
                        location.pathname.includes(URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS)
                            ? URLS.STACK_MANAGER_DISCOVER_MODULES
                            : URLS.STACK_MANAGER_INSTALLED_MODULES,
                    )
                }

                setSelectedModule(_selectedModule)
                if (!detailsMode) {
                    setDetailsMode(
                        location.pathname.includes(URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS)
                            ? 'discover'
                            : 'installed',
                    )
                }
            }
        }
    }, [stackDetails.discoverModulesList])

    useEffect(() => {
        if (serverMode === SERVER_MODE.FULL) {
            return
        }
        // Check for CICD status to update SERVER_MODE on every route change if Current SERVER_MODE is EA_ONLY
        getModuleInfo(ModuleNameMap.CICD)
    }, [location])

    const setModuleStatusInContext = (moduleName: string, moduleStatus: ModuleStatus) => {
        if (moduleStatus === ModuleStatus.INSTALLING) {
            setModuleInInstallingState(moduleName)
        } else if (moduleInInstallingState === moduleName) {
            setModuleInInstallingState('')
            if (moduleStatus === ModuleStatus.INSTALLED) {
                installedModuleMap.current = { ...installedModuleMap.current, [moduleName]: true }
            }
        }
    }

    /**
     * 1. If query params has 'id' then module installation action has been triggered
     * so fetch the specific module info.
     * 2. Else it's the server/stack upgrade action so fetch the server info
     */
    const getLatestInfo = async () => {
        try {
            if (queryParams.has('id')) {
                const { result } = await getModuleInfo(queryParams.get('id'))

                if (result) {
                    const _stackDetails: StackDetailsType = stackDetails
                    const currentModuleIndex = _stackDetails.discoverModulesList.findIndex(
                        (_module) => _module.name === result.name,
                    )
                    const currentModule = {
                        ..._stackDetails.discoverModulesList[currentModuleIndex],
                        installationStatus: result.status,
                        moduleResourcesStatus: result.moduleResourcesStatus,
                    }
                    setSelectedModule({
                        ...currentModule,
                        installationStatus: result.status,
                        moduleType: result.moduleType,
                        enabled: result.enabled,
                    })
                    setModuleStatusInContext(result.name, result.status)
                    _stackDetails.discoverModulesList[currentModuleIndex] = currentModule
                    setStackDetails(_stackDetails)
                }
            } else {
                getCurrentServerInfo()
            }
        } catch (e) {
            showError(e)
        } finally {
            setActionTriggered({
                ...actionTriggered,
                [location.pathname.includes(URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS)
                    ? `moduleAction-${queryParams.get('id')?.toLowerCase()}`
                    : 'serverAction']: false,
            })
        }
    }

    const _getLogPodName = async (): Promise<void> => {
        try {
            const { result } = await getLogPodName()
            setLogPodName(result?.podName)
        } catch (e) {
            console.error('Error in fetching pod name')
        }
    }

    const _getGitOpsConfigurationStatus = async (): Promise<void> => {
        try {
            if (location.pathname.includes(URLS.DETAILS) && queryParams.get('id') === ModuleNameMap.ARGO_CD) {
                const { result } = await isGitopsConfigured()
                const currentModule = stackDetails.discoverModulesList.find(
                    (_module) => _module.name === ModuleNameMap.ARGO_CD,
                )
                if (currentModule) {
                    currentModule.isModuleConfigurable = true
                    currentModule.isModuleConfigured = result?.exists || false
                    setSelectedModule(currentModule)
                }
            }
        } catch (e) {
            console.error('Error in fetching pod name')
        }
    }

    const _getDetailsForAllModules = (_modulesList: ModuleDetails[], _stackDetails: StackDetailsType): void => {
        /**
         * 1. Create array of promises to fetch module details
         * - If in full mode then resolve all modules as INSTALLED which has isIncludedInLegacyFullPackage as true
         * - Else create a promise to fetch the details
         */
        const _moduleDetailsPromiseList = _modulesList?.map((module: ModuleDetails) =>
            getModuleInfo(
                module.name,
                module.name === ModuleNameMap.SECURITY_CLAIR || module.name === ModuleNameMap.SECURITY_TRIVY,
            ),
        )

        const _discoverModulesList: ModuleDetails[] = []
        const _installedModulesList: ModuleDetails[] = []

        Promise.allSettled(_moduleDetailsPromiseList)
            .then((responses: { status: string; value?: any; reason?: any }[]) => {
                responses.forEach((res, index) => {
                    if (!res.value && res.reason) {
                        const _moduleDetails: ModuleDetails = {
                            ..._modulesList[index],
                            installationStatus: ModuleStatus.UNKNOWN,
                        }
                        _discoverModulesList.push(_moduleDetails)
                    } else {
                        const result: ModuleInfo = res.value?.result
                        const currentModule = _modulesList?.find((_module) => _module.name === result?.name)

                        // 2. Populate the module details using current module details & new installation status
                        const _moduleDetails: ModuleDetails = {
                            ...currentModule,
                            installationStatus: result?.status,
                            moduleResourcesStatus: result?.moduleResourcesStatus,
                            enabled: result?.enabled,
                            moduleType: result?.moduleType,
                        }

                        /**
                         * 3. Push all modules details to discoverModulesList & only modules whose status is "installed" to installedModulesList
                         */
                        _discoverModulesList.push(_moduleDetails)

                        if (_moduleDetails.installationStatus === ModuleStatus.INSTALLED) {
                            if (_moduleDetails.name === ModuleNameMap.ARGO_CD) {
                                _getGitOpsConfigurationStatus()
                            }
                            _installedModulesList.push(_moduleDetails)
                        }
                        setModuleStatusInContext(result.name, result.status)
                    }
                })

                _stackDetails.discoverModulesList = _discoverModulesList
                _stackDetails.installedModulesList = _installedModulesList

                // 4. Update the stackDetails
                setStackDetails(_stackDetails)
            })
            .catch((e) => {
                console.error('Error in fetching some integrations details')
            })
    }

    const getModuleDetails = () => {
        setStackDetails({
            ...stackDetails,
            isLoading: true,
        })

        // 1. Execute all APIs - get all modules, get logPodName & releaseNotes
        Promise.allSettled([getAllModules(), getLogPodName(), getReleasesNotes(serverInfo.installationType)])
            .then((responses: { status: string; value?: any; reason?: any }[]) => {
                const allModulesRes: AllModuleInfoResponse = responses[0].value
                const allModulesErrorRes = responses[0].reason

                /**
                 * 2. If get all modules API fails then set the error code to be used by
                 * ErrorScreenManager to handle & show an appropriate error & return
                 */
                if (allModulesErrorRes?.code >= 0) {
                    setStackDetails({
                        ...stackDetails,
                        isLoading: false,
                        errorStatusCode: allModulesErrorRes.code,
                    })
                    return
                }

                const logPodNameRes: LogPodNameResponse = responses[1].value
                const releaseNotesRes: ReleaseNotesResponse = responses[2].value

                const _stackDetails: StackDetailsType = {
                    ...stackDetails,
                    isLoading: false,
                    releaseNotes: releaseNotesRes?.result,
                }

                setLogPodName(logPodNameRes?.result?.podName)
                _getDetailsForAllModules(allModulesRes?.result, _stackDetails)
            })
            .catch((err) => {
                handleError(err)
                setStackDetails({
                    ...stackDetails,
                    isLoading: false,
                })
            })
    }

    const closeCheckResourceStatusModal = () => {
        setShowResourceStatusModal(false)
    }

    /**
     * This is to handle the module selection
     */
    const handleModuleSelection = (moduleDetails: ModuleDetails, fromDiscoverModules?: boolean) => {
        queryParams.set('id', moduleDetails.name)
        setDetailsMode(fromDiscoverModules ? 'discover' : 'installed')
        setSelectedModule(moduleDetails)

        history.push(
            `${
                fromDiscoverModules
                    ? URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS
                    : URLS.STACK_MANAGER_INSTALLED_MODULES_DETAILS
            }?${queryParams.toString()}`,
        )
    }

    const handleBreadcrumbClick = () => {
        setDetailsMode('')
        setSelectedModule(undefined)
    }

    const handleTabChange = useCallback(
        (tabIndex: number) => {
            setSelectedTabIndex(tabIndex)
        },
        [selectedTabIndex],
    )

    const handleActionTrigger = useCallback(
        (actionName: string, actionState: boolean) => {
            setActionTriggered({
                ...actionTriggered,
                [actionName]: actionState,
            })
        },
        [actionTriggered],
    )

    const Body = () => {
        return (
            <Switch location={location}>
                <Route path={URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS}>
                    <ModuleDetailsView
                        modulesList={stackDetails.discoverModulesList}
                        moduleDetails={selectedModule}
                        setDetailsMode={setDetailsMode}
                        serverInfo={serverInfo}
                        upgradeVersion={stackDetails.releaseNotes[0]?.releaseName}
                        logPodName={logPodName}
                        fromDiscoverModules
                        isActionTriggered={actionTriggered[`moduleAction-${selectedModule?.name?.toLowerCase()}`]}
                        handleActionTrigger={handleActionTrigger}
                        history={history}
                        location={location}
                        setShowResourceStatusModal={setShowResourceStatusModal}
                        isSuperAdmin={isSuperAdmin}
                        setSelectedModule={setSelectedModule}
                        setStackDetails={setStackDetails}
                        stackDetails={stackDetails}
                        dialog={dialog}
                        setDialog={setDialog}
                        retryState={retryState}
                        setRetryState={setRetryState}
                        successState={successState}
                        setSuccessState={setSuccessState}
                        setToggled={setToggled}
                        toggled={toggled}
                    />
                </Route>
                <Route path={URLS.STACK_MANAGER_INSTALLED_MODULES_DETAILS}>
                    <ModuleDetailsView
                        modulesList={stackDetails.installedModulesList}
                        moduleDetails={selectedModule}
                        setDetailsMode={setDetailsMode}
                        serverInfo={serverInfo}
                        upgradeVersion={stackDetails.releaseNotes[0]?.releaseName}
                        logPodName={logPodName}
                        isActionTriggered={actionTriggered[`moduleAction-${selectedModule?.name?.toLowerCase()}`]}
                        handleActionTrigger={handleActionTrigger}
                        history={history}
                        location={location}
                        setShowResourceStatusModal={setShowResourceStatusModal}
                        setSelectedModule={setSelectedModule}
                        isSuperAdmin={isSuperAdmin}
                        setStackDetails={setStackDetails}
                        stackDetails={stackDetails}
                        dialog={dialog}
                        setDialog={setDialog}
                        retryState={retryState}
                        setRetryState={setRetryState}
                        successState={successState}
                        setSuccessState={setSuccessState}
                        setToggled={setToggled}
                        toggled={toggled}
                    />
                </Route>
                <Route path={URLS.STACK_MANAGER_DISCOVER_MODULES}>
                    <ModulesListingView
                        modulesList={stackDetails.discoverModulesList}
                        isDiscoverModulesView
                        handleModuleCardClick={handleModuleSelection}
                    />
                </Route>
                <Route path={URLS.STACK_MANAGER_INSTALLED_MODULES}>
                    <ModulesListingView
                        modulesList={stackDetails.installedModulesList}
                        handleModuleCardClick={handleModuleSelection}
                    />
                </Route>
                <Route path={URLS.STACK_MANAGER_ABOUT}>
                    <AboutDevtronView
                        parentRef={stackManagerRef}
                        releaseNotes={stackDetails.releaseNotes}
                        serverInfo={serverInfo}
                        canViewLogs={serverMode === SERVER_MODE.FULL}
                        logPodName={logPodName}
                        selectedTabIndex={selectedTabIndex}
                        handleTabChange={handleTabChange}
                        isActionTriggered={actionTriggered.serverAction}
                        handleActionTrigger={handleActionTrigger}
                        showPreRequisiteConfirmationModal={showPreRequisiteConfirmationModal}
                        setShowPreRequisiteConfirmationModal={setShowPreRequisiteConfirmationModal}
                        preRequisiteChecked={preRequisiteChecked}
                        setPreRequisiteChecked={setPreRequisiteChecked}
                    />
                </Route>
                <Route path={URLS.STACK_MANAGER_ABOUT_RELEASES}>
                    <AboutDevtronView
                        parentRef={stackManagerRef}
                        releaseNotes={stackDetails.releaseNotes}
                        serverInfo={serverInfo}
                        canViewLogs={serverMode === SERVER_MODE.FULL}
                        logPodName={logPodName}
                        selectedTabIndex={selectedTabIndex}
                        handleTabChange={handleTabChange}
                        isActionTriggered={actionTriggered.serverAction}
                        handleActionTrigger={handleActionTrigger}
                        showPreRequisiteConfirmationModal={showPreRequisiteConfirmationModal}
                        setShowPreRequisiteConfirmationModal={setShowPreRequisiteConfirmationModal}
                        preRequisiteChecked={preRequisiteChecked}
                        setPreRequisiteChecked={setPreRequisiteChecked}
                    />
                </Route>
                <Redirect to={URLS.STACK_MANAGER_DISCOVER_MODULES} />
            </Switch>
        )
    }

    return (
        <main
            ref={stackManagerRef}
            className={`stack-manager ${
                stackDetails.isLoading || detailsMode || stackDetails.errorStatusCode > 0
                    ? `full-view-mode ${stackDetails.errorStatusCode > 0 ? '' : 'white-background'}`
                    : ''
            }`}
        >
            <StackPageHeader
                detailsMode={detailsMode}
                selectedModule={selectedModule}
                handleBreadcrumbClick={handleBreadcrumbClick}
            />
            {stackDetails.isLoading ? (
                <DevtronProgressing parentClasses="h-100 flex bg__primary" classes="icon-dim-80" />
            ) : stackDetails.errorStatusCode > 0 ? (
                <div className="flex">
                    <ErrorScreenManager code={stackDetails.errorStatusCode} />
                </div>
            ) : (
                <Router history={history}>
                    {!detailsMode && (
                        <section className="stack-manager__navigation">
                            <NavItem
                                installedModulesCount={stackDetails.installedModulesList.length}
                                installationStatus={serverInfo?.status}
                                currentVersion={serverInfo?.currentVersion}
                                newVersion={stackDetails.releaseNotes[0]?.releaseName}
                                handleTabChange={handleTabChange}
                                showInitializing={!logPodName && serverMode === SERVER_MODE.FULL}
                                showVersionInfo={
                                    serverInfo?.currentVersion &&
                                    serverInfo.installationType === InstallationType.OSS_HELM
                                }
                            />
                        </section>
                    )}
                    <section
                        className={`stack-manager__component-wrapper ${
                            detailsMode ? `flex column top ${detailsMode}` : ''
                        }`}
                    >
                        <Suspense fallback={<Progressing pageLoader />}>
                            <ErrorBoundary>
                                <Body />
                                {showResourceStatusModal && selectedModule && (
                                    <AppStatusDetailModal
                                        close={closeCheckResourceStatusModal}
                                        showAppStatusMessage
                                        title="Integration installation status"
                                        appStatusText={selectedModule.installationStatus}
                                        appStatus={AppStatusClass[selectedModule.installationStatus] || ''}
                                        showFooter
                                    />
                                )}
                            </ErrorBoundary>
                        </Suspense>
                    </section>
                </Router>
            )}
        </main>
    )
}
