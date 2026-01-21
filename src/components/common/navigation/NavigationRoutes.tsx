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

import { FunctionComponent, lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import ReactGA from 'react-ga4'
import TagManager from 'react-gtm-module'
import { Route, Switch, useHistory, useLocation } from 'react-router-dom'
import * as Sentry from '@sentry/browser'

import {
    AboutDevtronDialog,
    animate,
    AppThemeType,
    BaseConfirmationModal,
    ConfirmationModalProvider,
    CostVisibilityRenderProviderProps,
    DEVTRON_BASE_MAIN_ID,
    DevtronLicenseInfo,
    DevtronProgressing,
    EnvironmentDataValuesDTO,
    ErrorScreenManager,
    getEnvironmentData,
    getHashedValue,
    Host,
    ImageSelectionUtilityProvider,
    InstallationType,
    IntelligenceConfig,
    LicenseInfoDialogType,
    logExceptionToSentry,
    MainContext,
    MainContextProvider,
    ModuleNameMap,
    ModuleStatus,
    motion,
    noop,
    ServerErrors,
    showError,
    SidePanelConfig,
    SwitchThemeDialog,
    SwitchThemeDialogProps,
    TempAppWindow,
    TempAppWindowConfig,
    ToastManager,
    ToastVariantType,
    URLS as CommonURLS,
    useMotionTemplate,
    useMotionValue,
    UserPreferencesType,
    useTheme,
    useUserEmail,
    useUserPreferences,
    ViewIsPipelineRBACConfiguredRadioTabs,
} from '@devtron-labs/devtron-fe-common-lib'

import { Navigation } from '@Components/Navigation'
import AppConfig from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig'
import { getUserRole } from '@Pages/GlobalConfigurations/Authorization/authorization.service'
import EditClusterDrawerContent from '@Pages/GlobalConfigurations/ClustersAndEnvironments/EditClusterDrawerContent'
import { OffendingPipelineModalAppView } from '@Pages/GlobalConfigurations/PluginPolicy/OffendingPipelineModal'
import { Configurations } from '@Pages/Releases/Detail'
import { ApplicationManagementConfigurationsRouter } from '@PagesDevtron2.0/ApplicationManagement'
import { ApplicationManagementOverview } from '@PagesDevtron2.0/ApplicationManagement/Overview'
import { InfraOverview } from '@PagesDevtron2.0/InfrastructureManagement'

import { SERVER_MODE, URLS, ViewType } from '../../../config'
import {
    dashboardLoggedIn,
    getAppListMin,
    getClusterListMinWithoutAuth,
    getLoginData,
    updateLoginCount,
} from '../../../services/service'
import { LoginCountType } from '../../../services/service.types'
import { HelmAppListResponse } from '../../app/list-new/AppListType'
import { LOGIN_COUNT, MAX_LOGIN_COUNT } from '../../onboardingGuide/onboarding.utils'
import { Security } from '../../security/Security'
import {
    getAllModulesInfo,
    getModuleInfo,
    getServerInfo,
} from '../../v2/devtronStackManager/DevtronStackManager.service'
import { Banner } from '../Banner/Banner'
import { TAB_DATA_LOCAL_STORAGE_KEY } from '../DynamicTabs/constants'
import { ParsedTabsData } from '../DynamicTabs/types'
import { importComponentFromFELibrary, setActionWithExpiry } from '../helpers/Helpers'
import { SidePanel } from '../SidePanel'
import { AppContext, ErrorBoundary } from '..'
import { ENVIRONMENT_DATA_FALLBACK, INITIAL_ENV_DATA_STATE, NAVBAR_WIDTH } from './constants'
import { AppRouter, InfraAppsRouter, RedirectUserWithSentry } from './NavRoutes.components'
import { EnvironmentDataStateType, NavigationRoutesTypes } from './types'

import './navigation.scss'

const Charts = lazy(() => import('../../charts/Charts'))

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
const isFELibAvailable = importComponentFromFELibrary('isFELibAvailable', null, 'function')

const ViewIsPipelineRBACConfigured: FunctionComponent<{
    userPreferences: UserPreferencesType
    userPreferencesError: ServerErrors
    handleUpdatePipelineRBACViewSelectedTab: (selectedTab: ViewIsPipelineRBACConfiguredRadioTabs) => void
}> = importComponentFromFELibrary('ViewIsPipelineRBACConfigured', null, 'function')
const LicenseInfoDialog = importComponentFromFELibrary('LicenseInfoDialog', null, 'function')
const AIResponseWidget = importComponentFromFELibrary('AIResponseWidget', null, 'function')
const EnterpriseRouter = importComponentFromFELibrary('EnterpriseRouter', null, 'function')
const CostVisibilityRenderProvider: FunctionComponent<CostVisibilityRenderProviderProps> | null =
    importComponentFromFELibrary('CostVisibilityRenderProvider', null, 'function')

const NavigationRoutes = ({ reloadVersionConfig }: Readonly<NavigationRoutesTypes>) => {
    const history = useHistory()
    const location = useLocation()
    const navRouteRef = useRef<HTMLDivElement>()
    const [aiAgentContext, setAIAgentContext] = useState<MainContext['aiAgentContext']>(null)
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
    // licenseData is only set if showLicenseData is received as true
    const [licenseData, setLicenseData] = useState<DevtronLicenseInfo | null>(null)
    const installedModuleMap = useRef<Record<string, boolean>>({})
    const showCloseButtonAfterGettingStartedClicked = () => {
        setHelpGettingStartedClicked(true)
    }
    // We use this to determine if we can show resource recommender, since we do not allow users to feed prometheus url if grafana module is not installed
    const [isGrafanaModuleInstalled, setIsGrafanaModuleInstalled] = useState(false)
    const [environmentId, setEnvironmentId] = useState(null)
    const contextValue = useMemo(() => ({ environmentId, setEnvironmentId }), [environmentId])

    const { showThemeSwitcherDialog, handleThemeSwitcherDialogVisibilityChange, appTheme } = useTheme()

    const [environmentDataState, setEnvironmentDataState] = useState<EnvironmentDataStateType>(INITIAL_ENV_DATA_STATE)
    const [licenseInfoDialogType, setLicenseInfoDialogType] = useState<LicenseInfoDialogType>(null)
    const [intelligenceConfig, setIntelligenceConfig] = useState<IntelligenceConfig>(null)

    const [sidePanelConfig, setSidePanelConfig] = useState<SidePanelConfig>({
        state: 'closed',
        docLink: null,
        reinitialize: false,
    })
    const asideWidth = useMotionValue(0)
    const navBarWidth = useMotionValue(0)

    useEffect(() => {
        if (pageState === ViewType.FORM) {
            const controls = animate(navBarWidth, NAVBAR_WIDTH, {
                duration: 0.3,
                ease: 'easeOut',
                delay: 0.6,
            })

            return controls.stop
        }
        return noop
    }, [pageState])

    const [tempAppWindowConfig, setTempAppWindowConfig] = useState<TempAppWindowConfig>({
        open: false,
        title: null,
        url: null,
    })

    const {
        userPreferences,
        userPreferencesError,
        handleFetchUserPreferences,
        handleUpdateUserThemePreference,
        handleUpdatePipelineRBACViewSelectedTab,
    } = useUserPreferences({ migrateUserPreferences })

    const { isAirgapped, isManifestScanningEnabled, canOnlyViewPermittedEnvOrgLevel, devtronManagedLicensingEnabled } =
        environmentDataState

    const handleCloseLicenseInfoDialog = () => {
        setLicenseInfoDialogType(null)
    }

    const processLoginData = async (response: LoginCountType, superAdmin: boolean, appCount: number) => {
        // eslint-disable-next-line radix
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
                await updateLoginCount(updatedPayload)
            }
        }

        // Check for external app count also before redirecting user on GETTING STARTED page
        if (!count && superAdmin && appCount === 0) {
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
                    _sseConnection.onerror = () => {
                        _sseConnection.close()
                        history.push(`/${URLS.GETTING_STARTED}`)
                    }
                }
            } catch {
                history.push(`/${URLS.GETTING_STARTED}`)
            }
        }
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

    const handleCloseSwitchThemeDialog: SwitchThemeDialogProps['handleClose'] = () => {
        handleThemeSwitcherDialogVisibilityChange(false)
    }

    useEffect(() => {
        if (!email) {
            return
        }

        if (import.meta.env.VITE_NODE_ENV === 'production' && window._env_) {
            if (window._env_.SENTRY_ERROR_ENABLED) {
                Sentry.configureScope((scope) => {
                    scope.setUser({ email })
                })
            }
            if (window._env_.GA_ENABLED) {
                const path = location.pathname
                // Using .then to use in useEffect
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
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
                    history.listen((locationObj) => {
                        let { pathname } = locationObj
                        pathname = pathname.replace(/\d/g, '')
                        pathname = pathname.replace(/\/\//g, '/')
                        ReactGA.send({ hitType: 'pageview', page: pathname })
                        ReactGA.event({
                            category: `Page ${pathname}`,
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
                .catch(() => {})
        }
    }, [email])

    const getServerMode = async (): Promise<SERVER_MODE> => {
        const response = await getAllModulesInfo()

        Object.values(response).forEach(({ name, status }) => {
            installedModuleMap.current = {
                ...installedModuleMap.current,
                [name]: status === ModuleStatus.INSTALLED,
            }
        })

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
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Error in fetching server info',
            })
            logExceptionToSentry(err, { data: 'Error in fetching server info' })
        }
    }

    const getEnvironmentDataValues = async (): Promise<EnvironmentDataValuesDTO> => {
        if (!getEnvironmentData) {
            return ENVIRONMENT_DATA_FALLBACK
        }

        try {
            const { result } = await getEnvironmentData()
            const parsedFeatureGitOpsFlags: typeof ENVIRONMENT_DATA_FALLBACK.featureGitOpsFlags = {
                isFeatureArgoCdMigrationEnabled: result.featureGitOpsFlags?.isFeatureArgoCdMigrationEnabled || false,
                isFeatureGitOpsEnabled: result.featureGitOpsFlags?.isFeatureGitOpsEnabled || false,
                isFeatureUserDefinedGitOpsEnabled:
                    result.featureGitOpsFlags?.isFeatureUserDefinedGitOpsEnabled || false,
            }
            return {
                isAirGapEnvironment: result.isAirGapEnvironment ?? ENVIRONMENT_DATA_FALLBACK.isAirGapEnvironment,
                isManifestScanningEnabled:
                    result.isManifestScanningEnabled ?? ENVIRONMENT_DATA_FALLBACK.isManifestScanningEnabled,
                canOnlyViewPermittedEnvOrgLevel:
                    result.canOnlyViewPermittedEnvOrgLevel ?? ENVIRONMENT_DATA_FALLBACK.canOnlyViewPermittedEnvOrgLevel,
                featureGitOpsFlags: parsedFeatureGitOpsFlags,
                canFetchHelmAppStatus: result.canFetchHelmAppStatus ?? ENVIRONMENT_DATA_FALLBACK.canFetchHelmAppStatus,
                devtronManagedLicensingEnabled:
                    result.devtronManagedLicensingEnabled ?? ENVIRONMENT_DATA_FALLBACK.devtronManagedLicensingEnabled,
                isResourceRecommendationEnabled:
                    result.isResourceRecommendationEnabled ?? ENVIRONMENT_DATA_FALLBACK.isResourceRecommendationEnabled,
            }
        } catch {
            return ENVIRONMENT_DATA_FALLBACK
        }
    }

    const getGrafanaModuleStatus = () => getModuleInfo(ModuleNameMap.GRAFANA)

    const handleFetchInitialData = async () => {
        try {
            const [serverModeResponse, environmentDataResponse, grafanaModuleStatus] = await Promise.all([
                getServerMode(),
                getEnvironmentDataValues(),
                getGrafanaModuleStatus(),
                getCurrentServerInfo(),
                handleFetchUserPreferences(),
            ])

            await getInit(serverModeResponse)

            setIsGrafanaModuleInstalled(grafanaModuleStatus?.result?.status === ModuleStatus.INSTALLED)
            setEnvironmentDataState({
                isAirgapped: environmentDataResponse.isAirGapEnvironment,
                isManifestScanningEnabled: environmentDataResponse.isManifestScanningEnabled,
                canOnlyViewPermittedEnvOrgLevel: environmentDataResponse.canOnlyViewPermittedEnvOrgLevel,
                featureGitOpsFlags: environmentDataResponse.featureGitOpsFlags,
                canFetchHelmAppStatus: environmentDataResponse.canFetchHelmAppStatus,
                devtronManagedLicensingEnabled: environmentDataResponse.devtronManagedLicensingEnabled,
                isResourceRecommendationEnabled: environmentDataResponse.isResourceRecommendationEnabled,
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
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            handleFetchInitialData()
        }
    }, [])

    useEffect(() => {
        const persistedTabs = localStorage.getItem(TAB_DATA_LOCAL_STORAGE_KEY)
        if (persistedTabs) {
            try {
                const parsedTabsData: ParsedTabsData = JSON.parse(persistedTabs)
                const keys = Object.keys(parsedTabsData.data)
                if (keys.every((key) => location.pathname !== key && !location.pathname.startsWith(`${key}/`))) {
                    localStorage.removeItem(TAB_DATA_LOCAL_STORAGE_KEY)
                }
            } catch {
                localStorage.removeItem(TAB_DATA_LOCAL_STORAGE_KEY)
            }
        }
    }, [location.pathname])

    const getIsOnboardingPage = () => {
        const _pathname = location.pathname.endsWith('/') ? location.pathname.slice(0, -1) : location.pathname
        return _pathname === `/${URLS.GETTING_STARTED}` || _pathname === `/dashboard/${URLS.GETTING_STARTED}`
    }

    const isOnboardingPage = getIsOnboardingPage()

    const gridTemplateColumns = !isOnboardingPage
        ? useMotionTemplate`${navBarWidth}px 1fr ${asideWidth}px`
        : useMotionTemplate`1fr ${asideWidth}px`

    const handleOpenLicenseInfoDialog = (
        initialDialogTab?: LicenseInfoDialogType.ABOUT | LicenseInfoDialogType.LICENSE,
    ) => {
        setLicenseInfoDialogType(initialDialogTab || LicenseInfoDialogType.ABOUT)
    }

    const showStackManager = !devtronManagedLicensingEnabled

    const renderAboutDevtronDialog = () => {
        if (!licenseInfoDialogType) {
            return null
        }
        return licenseData && LicenseInfoDialog ? (
            <LicenseInfoDialog
                handleCloseLicenseInfoDialog={handleCloseLicenseInfoDialog}
                initialDialogType={licenseInfoDialogType}
            />
        ) : (
            <AboutDevtronDialog handleCloseLicenseInfoDialog={handleCloseLicenseInfoDialog} />
        )
    }

    const renderClusterForm: CostVisibilityRenderProviderProps['renderClusterForm'] = ({
        clusterDetails,
        handleClose,
        handleSuccess,
    }) => (
        <EditClusterDrawerContent
            handleModalClose={handleClose}
            sshTunnelConfig={clusterDetails.sshTunnelConfig}
            clusterId={clusterDetails.clusterId}
            clusterName={clusterDetails.clusterName}
            serverUrl={clusterDetails.serverUrl}
            reload={handleSuccess}
            prometheusUrl={clusterDetails.prometheusUrl}
            proxyUrl={clusterDetails.proxyUrl}
            toConnectWithSSHTunnel={clusterDetails.toConnectWithSSHTunnel}
            isProd={clusterDetails.isProd}
            installationId={clusterDetails.installationId}
            category={clusterDetails.category}
            insecureSkipTlsVerify={clusterDetails.insecureSkipTlsVerify}
            costModuleConfig={clusterDetails.costModuleConfig}
        />
    )

    const renderMainContent = () => {
        if (pageState === ViewType.LOADING) {
            return <DevtronProgressing parentClasses="flex flex-grow-1 bg__primary" classes="icon-dim-80" />
        }

        if (pageState === ViewType.ERROR) {
            return <ErrorScreenManager />
        }

        return (
            serverMode && (
                <>
                    <Banner />
                    <div className="flexbox-col flex-grow-1 dc__overflow-auto">
                        <Suspense
                            fallback={
                                <DevtronProgressing
                                    parentClasses="flex flex-grow-1 bg__primary"
                                    classes="icon-dim-80"
                                />
                            }
                        >
                            <ErrorBoundary>
                                <Switch>
                                    <Route
                                        key={CommonURLS.INFRASTRUCTURE_MANAGEMENT_RESOURCE_BROWSER}
                                        path={CommonURLS.INFRASTRUCTURE_MANAGEMENT_RESOURCE_BROWSER}
                                    >
                                        <ResourceBrowser />
                                    </Route>
                                    <Route
                                        key={CommonURLS.INFRASTRUCTURE_MANAGEMENT_APP}
                                        path={CommonURLS.INFRASTRUCTURE_MANAGEMENT_APP}
                                    >
                                        <InfraAppsRouter />
                                    </Route>
                                    <Route
                                        key={CommonURLS.INFRASTRUCTURE_MANAGEMENT_OVERVIEW}
                                        path={CommonURLS.INFRASTRUCTURE_MANAGEMENT_OVERVIEW}
                                    >
                                        <InfraOverview />
                                    </Route>
                                    <Route
                                        path={CommonURLS.GLOBAL_CONFIG}
                                        render={(props) => <GlobalConfig {...props} isSuperAdmin={isSuperAdmin} />}
                                    />
                                    {!window._env_.K8S_CLIENT && [
                                        ...(serverMode === SERVER_MODE.FULL
                                            ? [
                                                  <Route
                                                      key={CommonURLS.APPLICATION_MANAGEMENT_OVERVIEW}
                                                      path={CommonURLS.APPLICATION_MANAGEMENT_OVERVIEW}
                                                      exact
                                                  >
                                                      <ApplicationManagementOverview />
                                                  </Route>,
                                                  <Route
                                                      key={CommonURLS.APPLICATION_MANAGEMENT_APP}
                                                      path={CommonURLS.APPLICATION_MANAGEMENT_APP}
                                                      render={() => <AppRouter />}
                                                  />,
                                                  <Route
                                                      key={URLS.APPLICATION_MANAGEMENT_APPLICATION_GROUP}
                                                      path={URLS.APPLICATION_MANAGEMENT_APPLICATION_GROUP}
                                                  >
                                                      <AppGroupRoute isSuperAdmin={isSuperAdmin} />
                                                  </Route>,
                                                  <Route
                                                      key={URLS.APPLICATION_MANAGEMENT_BULK_EDIT}
                                                      path={URLS.APPLICATION_MANAGEMENT_BULK_EDIT}
                                                      render={() => <BulkEdit />}
                                                  />,
                                                  <Route path={CommonURLS.APPLICATION_MANAGEMENT_CONFIGURATIONS}>
                                                      <ApplicationManagementConfigurationsRouter />
                                                  </Route>,
                                                  <Route
                                                      key={CommonURLS.SECURITY_CENTER}
                                                      path={CommonURLS.SECURITY_CENTER}
                                                      render={() => <Security />}
                                                  />,
                                              ]
                                            : []),
                                        <Route
                                            key={URLS.INFRASTRUCTURE_MANAGEMENT_CHART_STORE}
                                            path={URLS.INFRASTRUCTURE_MANAGEMENT_CHART_STORE}
                                            render={() => <Charts isSuperAdmin={isSuperAdmin} />}
                                        />,
                                        ...(window._env_.FEATURE_RESOURCE_WATCHER_ENABLE && ResourceWatcherRouter
                                            ? [
                                                  <Route
                                                      key={CommonURLS.INFRASTRUCTURE_MANAGEMENT_RESOURCE_WATCHER}
                                                      path={CommonURLS.INFRASTRUCTURE_MANAGEMENT_RESOURCE_WATCHER}
                                                  >
                                                      <ResourceWatcherRouter />
                                                  </Route>,
                                              ]
                                            : []),
                                        ...(serverMode === SERVER_MODE.FULL &&
                                        window._env_.FEATURE_SOFTWARE_DISTRIBUTION_HUB_ENABLE &&
                                        SoftwareDistributionHub
                                            ? [
                                                  <Route
                                                      key={CommonURLS.SOFTWARE_RELEASE_MANAGEMENT}
                                                      path={CommonURLS.SOFTWARE_RELEASE_MANAGEMENT}
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
                                        ...(showStackManager
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
                                    {!window._env_.K8S_CLIENT && serverMode === SERVER_MODE.FULL && (
                                        <Route
                                            path={URLS.AUTOMATION_AND_ENABLEMENT_JOB}
                                            key={URLS.AUTOMATION_AND_ENABLEMENT_JOB}
                                        >
                                            <AppContext.Provider value={contextValue}>
                                                <Jobs />
                                            </AppContext.Provider>
                                        </Route>
                                    )}
                                    {EnterpriseRouter && CostVisibilityRenderProvider && (
                                        <Route
                                            path={[
                                                CommonURLS.COST_VISIBILITY,
                                                ...(serverMode === SERVER_MODE.FULL
                                                    ? [CommonURLS.APPLICATION_MANAGEMENT, CommonURLS.DATA_PROTECTION]
                                                    : []),
                                            ]}
                                        >
                                            <CostVisibilityRenderProvider renderClusterForm={renderClusterForm}>
                                                <EnterpriseRouter
                                                    AppConfig={AppConfig}
                                                    OfflinePipelineModalAppView={OffendingPipelineModalAppView}
                                                />
                                            </CostVisibilityRenderProvider>
                                        </Route>
                                    )}
                                    <RedirectUserWithSentry
                                        isFirstLoginUser={isSuperAdmin && loginCount === 0 && appListCount === 0}
                                    />
                                </Switch>
                                {AIResponseWidget && intelligenceConfig && <AIResponseWidget parentRef={navRouteRef} />}
                            </ErrorBoundary>
                        </Suspense>
                    </div>
                    <TempAppWindow />
                </>
            )
        )
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
                licenseData,
                setLicenseData,
                canFetchHelmAppStatus: environmentDataState.canFetchHelmAppStatus,
                reloadVersionConfig,
                intelligenceConfig,
                setIntelligenceConfig,
                aiAgentContext,
                setAIAgentContext,
                sidePanelConfig,
                setSidePanelConfig,
                isEnterprise: currentServerInfo?.serverInfo?.installationType === InstallationType.ENTERPRISE,
                isFELibAvailable: !!isFELibAvailable,
                isResourceRecommendationEnabled:
                    isGrafanaModuleInstalled && environmentDataState.isResourceRecommendationEnabled,
                tempAppWindowConfig,
                setTempAppWindowConfig,
            }}
        >
            <ConfirmationModalProvider>
                <BaseConfirmationModal />
                <motion.main id={DEVTRON_BASE_MAIN_ID} style={{ gridTemplateColumns }}>
                    {!isOnboardingPage && (
                        <Navigation
                            showStackManager={showStackManager}
                            isAirgapped={isAirgapped}
                            serverMode={serverMode}
                            moduleInInstallingState={moduleInInstallingState}
                            installedModuleMap={installedModuleMap}
                            pageState={pageState}
                        />
                    )}
                    <>
                        <motion.div
                            className={`main flexbox-col bg__primary dc__position-rel ${appTheme === AppThemeType.light ? 'dc__no-border' : 'border__primary-translucent'} br-6 dc__overflow-hidden mt-8 mb-8 ml-8 ${sidePanelConfig.state === 'closed' ? 'mr-8' : ''}`}
                            ref={navRouteRef}
                        >
                            {renderMainContent()}
                        </motion.div>
                        <SidePanel asideWidth={asideWidth} />
                    </>
                    {showThemeSwitcherDialog && (
                        <SwitchThemeDialog
                            initialThemePreference={userPreferences?.themePreference}
                            handleClose={handleCloseSwitchThemeDialog}
                            handleUpdateUserThemePreference={handleUpdateUserThemePreference}
                        />
                    )}
                    {renderAboutDevtronDialog()}
                </motion.main>
            </ConfirmationModalProvider>
        </MainContextProvider>
    )
}

export default NavigationRoutes
