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

import { lazy, Suspense, useEffect, useState, useRef, useMemo, FunctionComponent } from 'react'
import {
    useUserEmail,
    showError,
    Host,
    Reload,
    useAsync,
    DevtronProgressing,
    useMainContext,
    MainContextProvider,
    ImageSelectionUtilityProvider,
    URLS as CommonURLS,
    AppListConstants,
    getEnvironmentData,
    DEVTRON_BASE_MAIN_ID,
    MainContext,
    getHashedValue,
    ServerErrors,
    ViewIsPipelineRBACConfiguredRadioTabs,
    EnvironmentDataValuesDTO,
    UserPreferencesType,
    getUserPreferences,
    MODES,
    useTheme,
    AppThemeType,
    LicenseInfoDialogType,
} from '@devtron-labs/devtron-fe-common-lib'
import { Route, Switch, useRouteMatch, useHistory, useLocation } from 'react-router-dom'
import * as Sentry from '@sentry/browser'
import ReactGA from 'react-ga4'
import TagManager from 'react-gtm-module'
import Navigation from './Navigation'
import { ErrorBoundary, AppContext } from '..'
import { URLS, ViewType, SERVER_MODE, ModuleNameMap } from '../../../config'
import { Security } from '../../security/Security'
import {
    dashboardLoggedIn,
    getAppListMin,
    getClusterListMinWithoutAuth,
    getLoginData,
    updateLoginCount,
} from '../../../services/service'
import { Configurations } from '@Pages/Releases/Detail'
import { EnvType } from '../../v2/appDetails/appDetails.type'
import { ModuleStatus } from '../../v2/devtronStackManager/DevtronStackManager.type'
import {
    getAllModulesInfo,
    getModuleInfo,
    getServerInfo,
} from '../../v2/devtronStackManager/DevtronStackManager.service'
import { importComponentFromFELibrary, setActionWithExpiry } from '../helpers/Helpers'
import { AppRouterType } from '../../../services/service.types'
import { getUserRole } from '../../../Pages/GlobalConfigurations/Authorization/authorization.service'
import { LOGIN_COUNT, MAX_LOGIN_COUNT } from '../../onboardingGuide/onboarding.utils'
import { HelmAppListResponse } from '../../app/list-new/AppListType'
import { ExternalFluxAppDetailsRoute } from '../../../Pages/App/Details/ExternalFlux'

// Monaco Editor worker dependency
import 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import YamlWorker from '../../../yaml.worker.js?worker'
import { TAB_DATA_LOCAL_STORAGE_KEY } from '../DynamicTabs/constants'
import { DEFAULT_GIT_OPS_FEATURE_FLAGS } from './constants'
import { ParsedTabsData, ParsedTabsDataV1 } from '../DynamicTabs/types'
import { SwitchThemeDialog } from '@Pages/Shared'
import { SwitchThemeDialogProps } from '@Pages/Shared/SwitchThemeDialog/types'

// Monaco Editor worker initialization
self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === MODES.YAML) {
            return new YamlWorker()
        }
        return new editorWorker()
    },
}

const Charts = lazy(() => import('../../charts/Charts'))
const ExternalApps = lazy(() => import('../../external-apps/ExternalApps'))
const ExternalArgoApps = lazy(() => import('../../externalArgoApps/ExternalArgoApp'))
const AppDetailsPage = lazy(() => import('../../app/details/main'))
const NewAppList = lazy(() => import('../../app/list-new/AppList'))
const V2Details = lazy(() => import('../../v2/index'))
const GlobalConfig = lazy(() => import('../../globalConfigurations/GlobalConfiguration'))
const BulkEdit = lazy(() => import('../../bulkEdits/BulkEdits'))
const ResourceBrowser = lazy(() => import('../../ResourceBrowser/ResourceBrowserRouter'))
const OnboardingGuide = lazy(() => import('../../onboardingGuide/OnboardingGuide'))
const DevtronStackManager = lazy(() => import('../../v2/devtronStackManager/DevtronStackManager'))
const AppGroupRoute = lazy(() => import('../../ApplicationGroup/AppGroupRoute'))
const Jobs = lazy(() => import('../../Jobs/Jobs'))

const ResourceWatcherRouter = importComponentFromFELibrary('ResourceWatcherRouter')
const SoftwareDistributionHub = importComponentFromFELibrary('SoftwareDistributionHub', null, 'function')
const NetworkStatusInterface = importComponentFromFELibrary('NetworkStatusInterface', null, 'function')
const SoftwareDistributionHubRenderProvider = importComponentFromFELibrary(
    'SoftwareDistributionHubRenderProvider',
    null,
    'function',
)
const migrateUserPreferences: (userPreferences: UserPreferencesType) => Promise<UserPreferencesType> =
    importComponentFromFELibrary('migrateUserPreferences', null, 'function')

const ViewIsPipelineRBACConfigured: FunctionComponent<{
    userPreferences: UserPreferencesType
    userPreferencesError: ServerErrors
    handleUpdatePipelineRBACViewSelectedTab: (selectedTab: ViewIsPipelineRBACConfiguredRadioTabs) => void
}> = importComponentFromFELibrary('ViewIsPipelineRBACConfigured', null, 'function')
const LicenseInfoDialog = importComponentFromFELibrary('LicenseInfoDialog', null, 'function')
const EnterpriseLicenseBar = importComponentFromFELibrary('EnterpriseLicenseBar', null, 'function')

export default function NavigationRoutes() {
    const history = useHistory()
    const location = useLocation()
    const match = useRouteMatch()
    const [serverMode, setServerMode] = useState<MainContext['serverMode']>(undefined)
    const [pageState, setPageState] = useState(ViewType.LOADING)
    const [currentServerInfo, setCurrentServerInfo] = useState<MainContext['currentServerInfo']>({
        serverInfo: undefined,
        fetchingServerInfo: false,
    })
    const { email } = useUserEmail()
    const [isHelpGettingStartedClicked, setHelpGettingStartedClicked] = useState(false)
    const [loginCount, setLoginCount] = useState(0)
    const [isSuperAdmin, setSuperAdmin] = useState(false)
    const [appListCount, setAppListCount] = useState(0)
    const [showGettingStartedCard, setShowGettingStartedCard] = useState(true)
    const [isGettingStartedClicked, setGettingStartedClicked] = useState(false)
    const [moduleInInstallingState, setModuleInInstallingState] = useState('')
    const [showLicenseData, setShowLicenseData] = useState<boolean>(false)
    const installedModuleMap = useRef<Record<string, boolean>>({})
    const showCloseButtonAfterGettingStartedClicked = () => {
        setHelpGettingStartedClicked(true)
    }
    const [environmentId, setEnvironmentId] = useState(null)
    const contextValue = useMemo(() => ({ environmentId, setEnvironmentId }), [environmentId])
    const [environmentDataState, setEnvironmentDataState] = useState<
        Pick<
            MainContext,
            'isAirgapped' | 'isManifestScanningEnabled' | 'canOnlyViewPermittedEnvOrgLevel' | 'featureGitOpsFlags'
        >
    >({
        isAirgapped: false,
        isManifestScanningEnabled: false,
        canOnlyViewPermittedEnvOrgLevel: false,
        featureGitOpsFlags: structuredClone(DEFAULT_GIT_OPS_FEATURE_FLAGS),
    })
    const [userPreferences, setUserPreferences] = useState<UserPreferencesType>(null)
    const [userPreferencesError, setUserPreferencesError] = useState<ServerErrors>(null)
    const [licenseInfoDialogType, setLicenseInfoDialogType] = useState<LicenseInfoDialogType>(null)
    const {
        showThemeSwitcherDialog,
        handleThemeSwitcherDialogVisibilityChange,
        handleThemePreferenceChange,
        appTheme,
    } = useTheme()

    const { isAirgapped, isManifestScanningEnabled, canOnlyViewPermittedEnvOrgLevel } = environmentDataState

    const handleCloseLicenseInfoDialog = () => {
        setLicenseInfoDialogType(null)
    }

    const getInit = async (_serverMode: string) => {
        const [userRole, appList, loginData] = await Promise.all([
            getUserRole(),
            _serverMode === SERVER_MODE.FULL ? getAppListMin() : null,
            getLoginData(),
        ])
        const superAdmin = userRole?.result?.roles?.includes('role:super-admin___')
        setSuperAdmin(superAdmin)
        const appCount = appList?.result?.length || 0
        setAppListCount(appCount)
        await processLoginData(loginData, superAdmin, appCount)
    }

    const processLoginData = async (response, superAdmin, appListCount) => {
        const count = response.result?.value ? parseInt(response.result.value) : 0
        setLoginCount(count)
        if (
            typeof Storage !== 'undefined' &&
            (localStorage.getItem('isSSOLogin') || localStorage.getItem('isAdminLogin'))
        ) {
            localStorage.removeItem('isSSOLogin')
            localStorage.removeItem('isAdminLogin')
            if (count < MAX_LOGIN_COUNT) {
                const updatedPayload = {
                    key: LOGIN_COUNT,
                    value: `${count + 1}`,
                }
                updateLoginCount(updatedPayload)
            }
        }

        // Check for external app count also before redirecting user on GETTING STARTED page
        if (!count && superAdmin && appListCount === 0) {
            try {
                const { result } = await getClusterListMinWithoutAuth()
                if (Array.isArray(result) && result.length === 1) {
                    const _sseConnection = new EventSource(`${Host}/application?clusterIds=${result[0].id}`, {
                        withCredentials: true,
                    })
                    _sseConnection.onmessage = (message) => {
                        const externalAppData: HelmAppListResponse = JSON.parse(message.data)
                        if (externalAppData.result?.helmApps?.length <= 1) {
                            history.push(`/${URLS.GETTING_STARTED}`)
                        }
                        _sseConnection.close()
                    }
                    _sseConnection.onerror = (err) => {
                        _sseConnection.close()
                        history.push(`/${URLS.GETTING_STARTED}`)
                    }
                }
            } catch (e) {
                history.push(`/${URLS.GETTING_STARTED}`)
            }
        }
    }

    const handleCloseSwitchThemeDialog: SwitchThemeDialogProps['handleClose'] = () => {
        handleThemeSwitcherDialogVisibilityChange(false)
    }

    useEffect(() => {
        if (!email) {
            return
        }

        if (import.meta.env.VITE_NODE_ENV === 'production' && window._env_) {
            if (window._env_.SENTRY_ERROR_ENABLED) {
                Sentry.configureScope(function (scope) {
                    scope.setUser({ email })
                })
            }
            if (window._env_.GA_ENABLED) {
                const path = location.pathname
                // Using .then to use in useEffect
                getHashedValue(email).then((hashedEmail) => {
                    ReactGA.initialize(window._env_.GA_TRACKING_ID, {
                        gaOptions: {
                            userId: hashedEmail,
                        },
                    })
                    ReactGA.send({ hitType: 'pageview', page: path })
                    ReactGA.event({
                        category: `Page ${path}`,
                        action: 'First Land',
                    })
                    history.listen((location) => {
                        let path = location.pathname
                        path = path.replace(new RegExp('[0-9]', 'g'), '')
                        path = path.replace(new RegExp('//', 'g'), '/')
                        ReactGA.send({ hitType: 'pageview', page: path })
                        ReactGA.event({
                            category: `Page ${path}`,
                            action: 'First Land',
                        })
                    })
                })
            }

            if (window._env_.GTM_ENABLED) {
                const tagManagerArgs = {
                    gtmId: window._env_.GTM_ID,
                }
                TagManager.initialize(tagManagerArgs)
            }
        }

        if (typeof Storage !== 'undefined') {
            setActionWithExpiry('dashboardLoginTime', 0)
            if (localStorage.isDashboardLoggedIn) {
                return
            }
            dashboardLoggedIn()
                .then((response) => {
                    if (response.result) {
                        localStorage.isDashboardLoggedIn = true
                    }
                })
                .catch((errors) => {})
        }
    }, [email])

    const getServerMode = async (): Promise<SERVER_MODE> => {
        const response = await getAllModulesInfo()
        const isFullMode =
            response[ModuleNameMap.CICD] && response[ModuleNameMap.CICD].status === ModuleStatus.INSTALLED
        return isFullMode ? SERVER_MODE.FULL : SERVER_MODE.EA_ONLY
    }

    const getCurrentServerInfo = async (section?: string) => {
        if (
            currentServerInfo.fetchingServerInfo ||
            (section === 'navigation' && currentServerInfo.serverInfo && location.pathname.includes('/stack-manager'))
        ) {
            return
        }

        setCurrentServerInfo({
            serverInfo: currentServerInfo.serverInfo,
            fetchingServerInfo: true,
        })

        try {
            const { result } = await getServerInfo(!location.pathname.includes('/stack-manager'), false)
            setCurrentServerInfo({
                serverInfo: result,
                fetchingServerInfo: false,
            })
        } catch (err) {
            setCurrentServerInfo({
                serverInfo: currentServerInfo.serverInfo,
                fetchingServerInfo: false,
            })
            console.error('Error in fetching server info')
        }
    }

    const getEnvironmentDataValues = async (): Promise<EnvironmentDataValuesDTO> => {
        const fallbackResponse: EnvironmentDataValuesDTO = {
            isAirGapEnvironment: false,
            isManifestScanningEnabled: false,
            canOnlyViewPermittedEnvOrgLevel: false,
            featureGitOpsFlags: structuredClone(DEFAULT_GIT_OPS_FEATURE_FLAGS),
        }

        if (!getEnvironmentData) {
            return fallbackResponse
        }

        try {
            const { result } = await getEnvironmentData()
            const parsedFeatureGitOpsFlags: typeof fallbackResponse.featureGitOpsFlags = {
                isFeatureArgoCdMigrationEnabled: result.featureGitOpsFlags?.isFeatureArgoCdMigrationEnabled || false,
                isFeatureGitOpsEnabled: result.featureGitOpsFlags?.isFeatureGitOpsEnabled || false,
                isFeatureUserDefinedGitOpsEnabled:
                    result.featureGitOpsFlags?.isFeatureUserDefinedGitOpsEnabled || false,
            }
            return {
                isAirGapEnvironment: result.isAirGapEnvironment,
                isManifestScanningEnabled: result.isManifestScanningEnabled,
                canOnlyViewPermittedEnvOrgLevel: result.canOnlyViewPermittedEnvOrgLevel,
                featureGitOpsFlags: parsedFeatureGitOpsFlags,
            }
        } catch {
            return fallbackResponse
        }
    }

    const handleInitializeUserPreferencesFromResponse = (userPreferencesResponse: UserPreferencesType) => {
        if (window._env_.FEATURE_EXPERIMENTAL_THEMING_ENABLE && !userPreferencesResponse?.themePreference) {
            handleThemeSwitcherDialogVisibilityChange(true)
        } else if (userPreferencesResponse?.themePreference) {
            handleThemePreferenceChange(userPreferencesResponse?.themePreference)
        }

        setUserPreferences(userPreferencesResponse)
    }

    const handleFetchUserPreferences = async () => {
        try {
            setUserPreferencesError(null)
            const userPreferencesResponse = await getUserPreferences()
            if (migrateUserPreferences) {
                const migratedUserPreferences = await migrateUserPreferences(userPreferencesResponse)
                handleInitializeUserPreferencesFromResponse(migratedUserPreferences)
            } else {
                handleInitializeUserPreferencesFromResponse(userPreferencesResponse)
            }
        } catch (error) {
            setUserPreferencesError(error)
        }
    }

    const handleFetchInitialData = async () => {
        try {
            const [serverModeResponse, environmentDataResponse] = await Promise.all([
                getServerMode(),
                getEnvironmentDataValues(),
                getCurrentServerInfo(),
                handleFetchUserPreferences(),
            ])

            await getInit(serverModeResponse)

            setEnvironmentDataState({
                isAirgapped: environmentDataResponse.isAirGapEnvironment,
                isManifestScanningEnabled: environmentDataResponse.isManifestScanningEnabled,
                canOnlyViewPermittedEnvOrgLevel: environmentDataResponse.canOnlyViewPermittedEnvOrgLevel,
                featureGitOpsFlags: environmentDataResponse.featureGitOpsFlags,
            })

            setServerMode(serverModeResponse)
            setPageState(ViewType.FORM)
        } catch (error) {
            showError(error)
            setPageState(ViewType.ERROR)
        }
    }

    useEffect(() => {
        if (window._env_.K8S_CLIENT) {
            setPageState(ViewType.FORM)
            setServerMode(SERVER_MODE.EA_ONLY)
        } else {
            handleFetchInitialData()
        }
    }, [])

    useEffect(() => {
        const persistedTabs = localStorage.getItem(TAB_DATA_LOCAL_STORAGE_KEY)
        if (persistedTabs) {
            try {
                const parsedTabsData: ParsedTabsData | ParsedTabsDataV1 = JSON.parse(persistedTabs)
                if (parsedTabsData.version === 'v1') {
                    if (
                        location.pathname === parsedTabsData.key ||
                        !location.pathname.startsWith(`${parsedTabsData.key}/`)
                    ) {
                        localStorage.removeItem(TAB_DATA_LOCAL_STORAGE_KEY)
                    }
                } else {
                    const keys = Object.keys(parsedTabsData.data)
                    if (keys.every((key) => location.pathname !== key && !location.pathname.startsWith(`${key}/`))) {
                        localStorage.removeItem(TAB_DATA_LOCAL_STORAGE_KEY)
                    }
                }
            } catch {
                localStorage.removeItem(TAB_DATA_LOCAL_STORAGE_KEY)
            }
        }
    }, [location.pathname])

    const isOnboardingPage = () => {
        const _pathname = location.pathname.endsWith('/') ? location.pathname.slice(0, -1) : location.pathname
        return _pathname === `/${URLS.GETTING_STARTED}` || _pathname === `/dashboard/${URLS.GETTING_STARTED}`
    }

    // To handle in case through browser prompt user cancelled the refresh
    const handleUpdatePipelineRBACViewSelectedTab = (selectedTab: ViewIsPipelineRBACConfiguredRadioTabs) => {
        setUserPreferences((prev) => ({
            ...prev,
            pipelineRBACViewSelectedTab: selectedTab,
        }))
    }

    const handleUpdateUserThemePreference = (themePreference: UserPreferencesType['themePreference']) => {
        setUserPreferences((prev) => ({
            ...prev,
            themePreference,
        }))
    }

    if (pageState === ViewType.LOADING) {
        return (
            <div className="full-height-width">
                <DevtronProgressing parentClasses="h-100 flex bg__primary" classes="icon-dim-80" />
            </div>
        )
    }
    if (pageState === ViewType.ERROR) {
        // 100vh is required for covering the full height of the page as this is the top level component
        return <Reload className="h-100vh bg__tertiary" />
    }
    const _isOnboardingPage = isOnboardingPage()

    const handleOpenLicenseInfoDialog = (initialDialogTab?: LicenseInfoDialogType.ABOUT | LicenseInfoDialogType.LICENSE) => {
        setLicenseInfoDialogType(initialDialogTab || LicenseInfoDialogType.ABOUT)
    }

    return (
        <MainContextProvider
            value={{
                serverMode,
                setServerMode,
                isHelpGettingStartedClicked,
                showCloseButtonAfterGettingStartedClicked,
                loginCount,
                setLoginCount,
                showGettingStartedCard,
                setShowGettingStartedCard,
                isGettingStartedClicked,
                setGettingStartedClicked,
                moduleInInstallingState,
                setModuleInInstallingState,
                installedModuleMap,
                currentServerInfo,
                isSuperAdmin,
                isAirgapped,
                isManifestScanningEnabled,
                featureGitOpsFlags: environmentDataState.featureGitOpsFlags,
                canOnlyViewPermittedEnvOrgLevel,
                viewIsPipelineRBACConfiguredNode:
                    serverMode === SERVER_MODE.FULL &&
                    ViewIsPipelineRBACConfigured &&
                    !canOnlyViewPermittedEnvOrgLevel &&
                    !isSuperAdmin ? (
                        <ViewIsPipelineRBACConfigured
                            userPreferences={userPreferences}
                            userPreferencesError={userPreferencesError}
                            handleUpdatePipelineRBACViewSelectedTab={handleUpdatePipelineRBACViewSelectedTab}
                        />
                    ) : null,
                handleOpenLicenseInfoDialog,
                showLicenseData,
                setShowLicenseData,
            }}
        >
            <main className={_isOnboardingPage ? 'no-nav' : ''} id={DEVTRON_BASE_MAIN_ID}>
                {window._env_.FEATURE_EXPERIMENTAL_THEMING_ENABLE && showThemeSwitcherDialog && (
                    <SwitchThemeDialog
                        initialThemePreference={userPreferences?.themePreference}
                        handleClose={handleCloseSwitchThemeDialog}
                        currentUserPreferences={userPreferences}
                        handleUpdateUserThemePreference={handleUpdateUserThemePreference}
                    />
                )}
                {licenseInfoDialogType && LicenseInfoDialog && (
                    <LicenseInfoDialog
                        handleCloseLicenseInfoDialog={handleCloseLicenseInfoDialog}
                        currentVersion={currentServerInfo.serverInfo?.currentVersion}
                        initialDialogType={licenseInfoDialogType}
                    />
                )}
                {!_isOnboardingPage && (
                    <Navigation
                        currentServerInfo={currentServerInfo}
                        history={history}
                        match={match}
                        location={location}
                        serverMode={serverMode}
                        moduleInInstallingState={moduleInInstallingState}
                        installedModuleMap={installedModuleMap}
                        isSuperAdmin={isSuperAdmin}
                        isAirgapped={isAirgapped}
                    />
                )}
                {serverMode && (
                    <div
                        className={`main flexbox-col bg__primary ${appTheme === AppThemeType.light ? 'dc__no-border' : 'border__primary-translucent'} m-8 br-6 dc__overflow-hidden`}
                    >
                        {/* To be replaced with Announcement Banner */}
                        {EnterpriseLicenseBar && <EnterpriseLicenseBar />}
                        <div className="flexbox-col flex-grow-1 dc__overflow-auto">
                            <Suspense
                                fallback={
                                    <DevtronProgressing parentClasses="h-100 flex bg__primary" classes="icon-dim-80" />
                                }
                            >
                                <ErrorBoundary>
                                    <Switch>
                                        <Route key={URLS.RESOURCE_BROWSER} path={URLS.RESOURCE_BROWSER}>
                                            <ResourceBrowser />
                                        </Route>
                                        <Route
                                            path={URLS.GLOBAL_CONFIG}
                                            render={(props) => <GlobalConfig {...props} isSuperAdmin={isSuperAdmin} />}
                                        />
                                        {!window._env_.K8S_CLIENT && [
                                            <Route
                                                key={URLS.APP}
                                                path={URLS.APP}
                                                render={() => (
                                                    <AppRouter
                                                        isSuperAdmin={isSuperAdmin}
                                                        appListCount={appListCount}
                                                        loginCount={loginCount}
                                                    />
                                                )}
                                            />,
                                            <Route key={URLS.APPLICATION_GROUP} path={URLS.APPLICATION_GROUP}>
                                                <AppGroupRoute isSuperAdmin={isSuperAdmin} />
                                            </Route>,
                                            <Route
                                                key={URLS.CHARTS}
                                                path={URLS.CHARTS}
                                                render={() => <Charts isSuperAdmin={isSuperAdmin} />}
                                            />,
                                            <Route
                                                key={URLS.BULK_EDITS}
                                                path={URLS.BULK_EDITS}
                                                render={(props) => <BulkEdit {...props} serverMode={serverMode} />}
                                            />,
                                            <Route
                                                key={URLS.SECURITY}
                                                path={URLS.SECURITY}
                                                render={(props) => <Security {...props} serverMode={serverMode} />}
                                            />,
                                            ...(!window._env_.HIDE_RESOURCE_WATCHER && ResourceWatcherRouter
                                                ? [
                                                      <Route key={URLS.RESOURCE_WATCHER} path={URLS.RESOURCE_WATCHER}>
                                                          <ResourceWatcherRouter />
                                                      </Route>,
                                                  ]
                                                : []),
                                            ...(!window._env_.HIDE_RELEASES && SoftwareDistributionHub
                                                ? [
                                                      <Route
                                                          key={URLS.SOFTWARE_DISTRIBUTION_HUB}
                                                          path={URLS.SOFTWARE_DISTRIBUTION_HUB}
                                                      >
                                                          <ImageSelectionUtilityProvider
                                                              value={{
                                                                  getModuleInfo,
                                                              }}
                                                          >
                                                              <SoftwareDistributionHubRenderProvider
                                                                  renderers={{
                                                                      ReleaseConfigurations: Configurations,
                                                                  }}
                                                              >
                                                                  <SoftwareDistributionHub />
                                                              </SoftwareDistributionHubRenderProvider>
                                                          </ImageSelectionUtilityProvider>
                                                      </Route>,
                                                  ]
                                                : []),
                                            ...(!window._env_.HIDE_NETWORK_STATUS_INTERFACE && NetworkStatusInterface
                                                ? [
                                                      <Route
                                                          key={CommonURLS.NETWORK_STATUS_INTERFACE}
                                                          path={CommonURLS.NETWORK_STATUS_INTERFACE}
                                                      >
                                                          <NetworkStatusInterface />
                                                      </Route>,
                                                  ]
                                                : []),
                                            ...(currentServerInfo.serverInfo?.installationType !== 'enterprise'
                                                ? [
                                                      <Route key={URLS.STACK_MANAGER} path={URLS.STACK_MANAGER}>
                                                          <DevtronStackManager
                                                              serverInfo={currentServerInfo.serverInfo}
                                                              getCurrentServerInfo={getCurrentServerInfo}
                                                              isSuperAdmin={isSuperAdmin}
                                                          />
                                                      </Route>,
                                                  ]
                                                : []),
                                            <Route key={URLS.GETTING_STARTED} exact path={`/${URLS.GETTING_STARTED}`}>
                                                <OnboardingGuide
                                                    loginCount={loginCount}
                                                    isSuperAdmin={isSuperAdmin}
                                                    serverMode={serverMode}
                                                    isGettingStartedClicked={isGettingStartedClicked}
                                                />
                                            </Route>,
                                        ]}
                                        {/* TODO: Check why its coming as empty in case route is in other library */}
                                        {!window._env_.K8S_CLIENT && (
                                            <Route path={URLS.JOB} key={URLS.JOB}>
                                                <AppContext.Provider value={contextValue}>
                                                    <Jobs />
                                                </AppContext.Provider>
                                            </Route>
                                        )}
                                        <Route>
                                            <RedirectUserWithSentry
                                                isFirstLoginUser={
                                                    isSuperAdmin && loginCount === 0 && appListCount === 0
                                                }
                                            />
                                        </Route>
                                    </Switch>
                                </ErrorBoundary>
                            </Suspense>
                        </div>
                    </div>
                )}
            </main>
        </MainContextProvider>
    )
}

export const AppRouter = ({ isSuperAdmin, appListCount, loginCount }: AppRouterType) => {
    const { path } = useRouteMatch()
    const [environmentId, setEnvironmentId] = useState(null)
    const [currentAppName, setCurrentAppName] = useState<string>('')

    return (
        <ErrorBoundary>
            <AppContext.Provider value={{ environmentId, setEnvironmentId, currentAppName, setCurrentAppName }}>
                <Switch>
                    <Route
                        path={`${path}/${URLS.APP_LIST}`}
                        render={() => (
                            <AppListRouter
                                isSuperAdmin={isSuperAdmin}
                                appListCount={appListCount}
                                loginCount={loginCount}
                            />
                        )}
                    />
                    <Route path={`${path}/${URLS.EXTERNAL_APPS}/:appId/:appName`} render={() => <ExternalApps />} />
                    <Route
                        path={`${path}/${URLS.EXTERNAL_ARGO_APP}/:clusterId(\\d+)/:appName/:namespace`}
                        render={() => <ExternalArgoApps />}
                    />
                    {window._env_.FEATURE_EXTERNAL_FLUX_CD_ENABLE && (
                        <Route path={`${path}/${URLS.EXTERNAL_FLUX_APP}/:clusterId/:appName/:namespace/:templateType`}>
                            <ExternalFluxAppDetailsRoute />
                        </Route>
                    )}
                    <Route
                        path={`${path}/${URLS.DEVTRON_CHARTS}/deployments/:appId(\\d+)/env/:envId(\\d+)`}
                        render={(props) => <V2Details envType={EnvType.CHART} />}
                    />
                    <Route path={`${path}/:appId(\\d+)`} render={() => <AppDetailsPage isV2={false} />} />
                    <Route path={`${path}/v2/:appId(\\d+)`} render={() => <AppDetailsPage isV2 />} />

                    <Route exact path="">
                        <RedirectToAppList />
                    </Route>
                    <Route>
                        <RedirectUserWithSentry
                            isFirstLoginUser={isSuperAdmin && loginCount === 0 && appListCount === 0}
                        />
                    </Route>
                </Switch>
            </AppContext.Provider>
        </ErrorBoundary>
    )
}

export const AppListRouter = ({ isSuperAdmin, appListCount, loginCount }: AppRouterType) => {
    const { path } = useRouteMatch()
    const [, argoInfoData] = useAsync(() => getModuleInfo(ModuleNameMap.ARGO_CD))
    const isArgoInstalled: boolean = argoInfoData?.result?.status === ModuleStatus.INSTALLED

    return (
        <ErrorBoundary>
            <Switch>
                <Route path={`${path}/:appType`} render={() => <NewAppList isArgoInstalled={isArgoInstalled} />} />
                <Route exact path="">
                    <RedirectToAppList />
                </Route>
                <Route>
                    <RedirectUserWithSentry isFirstLoginUser={isSuperAdmin && loginCount === 0 && appListCount === 0} />
                </Route>
            </Switch>
        </ErrorBoundary>
    )
}

export const RedirectUserWithSentry = ({ isFirstLoginUser }) => {
    const { push } = useHistory()
    const { pathname } = useLocation()
    const { serverMode } = useMainContext()
    useEffect(() => {
        if (pathname && pathname !== '/') {
            Sentry.captureMessage(
                `redirecting to ${window._env_.HIDE_NETWORK_STATUS_INTERFACE ? 'app-list' : 'network status interface'} from ${pathname}`,
                'warning',
            )
        }

        if (!window._env_.HIDE_NETWORK_STATUS_INTERFACE && !!NetworkStatusInterface) {
            push(CommonURLS.NETWORK_STATUS_INTERFACE)
            return
        }

        if (window._env_.K8S_CLIENT) {
            push(URLS.RESOURCE_BROWSER)
        } else if (isFirstLoginUser) {
            push(URLS.GETTING_STARTED)
        } else if (serverMode === SERVER_MODE.EA_ONLY && window._env_.FEATURE_DEFAULT_LANDING_RB_ENABLE) {
            push(URLS.RESOURCE_BROWSER)
        } else {
            push(`${URLS.APP}/${URLS.APP_LIST}`)
        }
    }, [])
    return null
}

export const RedirectToAppList = () => {
    const { replace } = useHistory()
    const { serverMode } = useMainContext()
    useEffect(() => {
        const baseUrl = `${URLS.APP}/${URLS.APP_LIST}`
        if (serverMode == SERVER_MODE.FULL) {
            replace(`${baseUrl}/${AppListConstants.AppType.DEVTRON_APPS}`)
        } else {
            replace(`${baseUrl}/${AppListConstants.AppType.HELM_APPS}`)
        }
    }, [])
    return null
}
