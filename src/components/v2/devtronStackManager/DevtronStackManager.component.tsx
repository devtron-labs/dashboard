import React, { useEffect, useState } from 'react'
import { NavLink, RouteComponentProps, useHistory, useLocation } from 'react-router-dom'
import {
    ModuleDetailsCardType,
    ModuleStatus,
    ModuleDetailsViewType,
    ModuleListingViewType,
    StackManagerNavItemType,
    StackManagerNavLinkType,
    StackManagerPageHeaderType,
    ModuleInstallationStatusType,
    InstallationWrapperType,
    InstallationType,
    ModuleDetails,
} from './DevtronStackManager.type'
import EmptyState from '../../EmptyState/EmptyState'
import { ReactComponent as DiscoverIcon } from '../../../assets/icons/ic-compass.svg'
import { ReactComponent as InstalledIcon } from '../../../assets/icons/ic-check.svg'
import { ReactComponent as ErrorIcon } from '../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as InstallIcon } from '../../../assets/icons/ic-arrow-forward.svg'
import { ReactComponent as RetryInstallIcon } from '../../../assets/icons/ic-arrow-clockwise.svg'
import { ReactComponent as SuccessIcon } from '../../../assets/icons/appstatus/healthy.svg'
import { ReactComponent as UpToDateIcon } from '../../../assets/icons/ic-celebration.svg'
import { ReactComponent as Chat } from '../../../assets/icons/ic-chat-circle-dots.svg'
import { ReactComponent as Info } from '../../../assets/icons/info-filled.svg'
import { ReactComponent as Warning } from '../../../assets/icons/ic-warning.svg'
import { ReactComponent as Note } from '../../../assets/icons/ic-note.svg'
import { ReactComponent as CloseIcon } from '../../../assets/icons/ic-close.svg'
import {
    Checkbox,
    CHECKBOX_VALUE,
    ConditionalWrap,
    noop,
    Progressing,
    showError,
    ToastBody,
    VisibleModal,
} from '../../common'
import NoIntegrations from '../../../assets/img/empty-noresult@2x.png'
import LatestVersionCelebration from '../../../assets/gif/latest-version-celebration.gif'
import { DOCUMENTATION, ModuleNameMap, URLS } from '../../../config'
import Carousel from '../../common/Carousel/Carousel'
import { toast } from 'react-toastify'
import {
    AboutSection,
    DEVTRON_UPGRADE_MESSAGE,
    handleAction,
    isLatestVersionAvailable,
    ModulesSection,
    MODULE_CONFIGURATION_DETAIL_MAP,
    MORE_MODULE_DETAILS,
    PENDING_DEPENDENCY_MESSAGE,
} from './DevtronStackManager.utils'
import { MarkDown } from '../../charts/discoverChartDetail/DiscoverChartDetails'
import './devtronStackManager.component.scss'
import PageHeader from '../../common/header/PageHeader'
import Tippy from '@tippyjs/react'

const getInstallationStatusLabel = (installationStatus: ModuleStatus): JSX.Element => {
    if (installationStatus === ModuleStatus.INSTALLING) {
        return (
            <div className={`module-details__installation-status flex ${installationStatus}`}>
                <Progressing size={20} />
                <span className="fs-13 fw-6 ml-8">Installing</span>
            </div>
        )
    } else if (installationStatus === ModuleStatus.INSTALLED) {
        return (
            <div className={`module-details__installation-status flex ${installationStatus}`}>
                <InstalledIcon className="icon-dim-20" />
                <span className="fs-13 fw-6 ml-8">Installed</span>
            </div>
        )
    } else if (installationStatus === ModuleStatus.INSTALL_FAILED || installationStatus === ModuleStatus.TIMEOUT) {
        return (
            <div className={`module-details__installation-status flex installFailed`}>
                <ErrorIcon className="icon-dim-20" />
                <span className="fs-13 fw-6 ml-8">Failed</span>
            </div>
        )
    }

    return <></>
}

const ModuleDetailsCard = ({
    moduleDetails,
    className,
    handleModuleCardClick,
    fromDiscoverModules,
}: ModuleDetailsCardType): JSX.Element => {
  const handleOnClick = (): void => {
      if (moduleDetails.installationStatus === ModuleStatus.UNKNOWN) {
          toast.error(
              <ToastBody
                  title="Unknown integration status"
                  subtitle="There was an error fetching the integration status. Please try again later."
              />,
          )
      } else if (handleModuleCardClick) {
          handleModuleCardClick(moduleDetails, fromDiscoverModules)
      }
  }
  return (
      <div
          className={`module-details__card flex left column br-8 p-16 mr-20 mb-20 ${className || ''}`}
          onClick={handleOnClick}
      >
          {getInstallationStatusLabel(moduleDetails.installationStatus)}
          <img className="module-details__card-icon mb-16" src={moduleDetails.icon} alt={moduleDetails.title} />
          <div className="module-details__card-name fs-16 fw-6 cn-9 mb-4">{moduleDetails.title}</div>
          <div className="module-details__card-info fs-13 fw-4 cn-7 lh-20">
              {moduleDetails.name === MORE_MODULE_DETAILS.name ? (
                  <>
                      You can&nbsp;
                      <a
                          href="https://github.com/devtron-labs/devtron/issues/new/choose"
                          className="cb-5 fw-6"
                          target="_blank"
                          rel="noreferrer noopener"
                      >
                          submit a ticket
                      </a>
                      &nbsp;to request an integration
                  </>
              ) : (
                  moduleDetails.info
              )}
          </div>
      </div>
  )
}

export const ModulesListingView = ({
    modulesList,
    isDiscoverModulesView,
    handleModuleCardClick,
}: ModuleListingViewType): JSX.Element => {
    if (modulesList.length === 0 && !isDiscoverModulesView) {
        return <NoIntegrationsInstalledView />
    }

    return (
        <div className="flexbox flex-wrap left p-20">
            {modulesList.map((module, idx) => {
                return (
                    <ModuleDetailsCard
                        key={`module-details__card-${idx}`}
                        moduleDetails={module}
                        className="cursor"
                        handleModuleCardClick={handleModuleCardClick}
                        fromDiscoverModules={isDiscoverModulesView}
                    />
                )
            })}
            {isDiscoverModulesView && (
                <ModuleDetailsCard
                    moduleDetails={MORE_MODULE_DETAILS}
                    className="more-integrations__card"
                    fromDiscoverModules={isDiscoverModulesView}
                />
            )}
        </div>
    )
}

const getUpdateStatusLabel = (
    installationStatus: ModuleStatus,
    currentVersion: string,
    newVersion: string,
    showInitializing: boolean,
): JSX.Element | null => {
    let updateStatusLabel = null

    if (installationStatus === ModuleStatus.UPGRADING) {
        updateStatusLabel = <span className="loading-dots">{showInitializing ? 'Initializing' : 'Updating'}</span>
    } else if (installationStatus === ModuleStatus.UPGRADE_FAILED || installationStatus === ModuleStatus.TIMEOUT) {
        updateStatusLabel = 'Update failed'
    } else if (installationStatus !== ModuleStatus.UNKNOWN && isLatestVersionAvailable(currentVersion, newVersion)) {
        updateStatusLabel = 'Update available'
    }

    return updateStatusLabel ? (
        <>
            <span className="bullet ml-4 mr-4" />
            {updateStatusLabel}
        </>
    ) : null
}

export const NavItem = ({
    installedModulesCount,
    installationStatus,
    currentVersion,
    newVersion,
    handleTabChange,
    showInitializing,
    showVersionInfo,
}: StackManagerNavItemType): JSX.Element => {
    const getNavLink = (route: StackManagerNavLinkType): JSX.Element => {
        return (
            <NavLink
                to={`${route.href}`}
                key={route.href}
                className={`stack-manager__navlink ${route.className}`}
                activeClassName="active-route"
                {...(route.name === 'About Devtron' && { onClick: () => handleTabChange(0) })}
            >
                <div className="flex left">
                    <route.icon className={`stack-manager__navlink-icon icon-dim-20`} />
                    {route.name !== 'Installed' && route.name !== 'About Devtron' && (
                        <span className="fs-13 ml-12">{route.name}</span>
                    )}
                    {route.name === 'Installed' && (
                        <div className="installed-modules-link flex content-space ml-12" style={{ width: '175px' }}>
                            <span className="fs-13">{route.name}</span>
                            <span className="badge">{installedModulesCount || 0}</span>
                        </div>
                    )}
                    {route.name === 'About Devtron' && (
                        <div className="about-devtron ml-12">
                            <span className="fs-13">{route.name}</span>
                            <br />
                            {showVersionInfo && (
                                <span className="fs-11 fw-4 cn-9 flex left">
                                    {currentVersion}
                                    {getUpdateStatusLabel(
                                        installationStatus,
                                        currentVersion,
                                        newVersion,
                                        showInitializing,
                                    )}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </NavLink>
        )
    }

    return (
        <div className="flex column left">
            <div className="section-heading cn-6 fs-12 fw-6 pl-8 mb-8 text-uppercase">Integrations</div>
            {ModulesSection.map((route) => getNavLink(route))}
            <hr className="mt-8 mb-8 w-100 checklist__divider" />
            {getNavLink(AboutSection)}
        </div>
    )
}

export const StackPageHeader = ({
    detailsMode,
    selectedModule,
    handleBreadcrumbClick,
}: StackManagerPageHeaderType): JSX.Element => {
    const history = useHistory()

    const handleRedirectToModule = (detailsMode) => {
        let url =
            detailsMode === 'discover' ? URLS.STACK_MANAGER_DISCOVER_MODULES : URLS.STACK_MANAGER_INSTALLED_MODULES
        history.push(url)
    }

    const renderBreadcrumbs = (headerTitleName, detailsMode) => {
        return (
            <div className="m-0 flex left ">
                <div onClick={() => handleRedirectToModule(detailsMode)} className="devtron-breadcrumb__item">
                    <span className="cb-5 fs-16 cursor">{headerTitleName} </span>
                </div>
                <span className="fs-16 cn-9 ml-4 mr-4"> / </span>
                <span className="fs-16 cn-9">{selectedModule?.title}</span>
            </div>
        )
    }
    return (
        <>
            {!detailsMode && <PageHeader headerName="Devtron Stack Manager" />}
            {detailsMode === 'discover' && (
                <PageHeader
                    isBreadcrumbs={true}
                    breadCrumbs={() => renderBreadcrumbs('Discover integrations', 'discover')}
                />
            )}
            {detailsMode === 'installed' && (
                <PageHeader
                    isBreadcrumbs={true}
                    breadCrumbs={() => renderBreadcrumbs('Installed integrations', 'installed')}
                />
            )}
        </>
    )
}

const getProgressingLabel = (isUpgradeView: boolean, canViewLogs: boolean, logPodName: string): string => {
    if (isUpgradeView && (!canViewLogs || (canViewLogs && logPodName))) {
        return 'Updating'
    } else if (!isUpgradeView && logPodName) {
        return 'Installing'
    }

    return 'Initializing'
}

const InstallationStatus = ({
    installationStatus,
    appName,
    canViewLogs,
    logPodName,
    isUpgradeView,
    latestVersionAvailable,
    isCICDModule,
}: ModuleInstallationStatusType): JSX.Element => {
    return (
        <div
            className={`module-details__installtion-status cn-9 br-4 fs-13 fw-6 mb-16 status-${installationStatus} ${
                isUpgradeView ? 'upgrade' : ''
            }`}
        >
            {(installationStatus === ModuleStatus.INSTALLING || installationStatus === ModuleStatus.UPGRADING) && (
                <>
                    <Progressing size={24} />
                    <div className="mt-12 loading-dots">
                        {getProgressingLabel(isUpgradeView, canViewLogs, logPodName)}
                    </div>
                </>
            )}
            {(installationStatus === ModuleStatus.INSTALLED ||
                (installationStatus === ModuleStatus.HEALTHY && !latestVersionAvailable)) && (
                <>
                    {isUpgradeView ? (
                        <div className="module-details__upgrade-success flex column">
                            <img src={LatestVersionCelebration} />
                            <UpToDateIcon className="icon-dim-40" />
                            <span className="mt-12">You're using the latest version of Devtron.</span>
                        </div>
                    ) : (
                        <div className="module-details__installtion-success flex left">
                            <SuccessIcon className="icon-dim-20 mr-12" /> Installed
                        </div>
                    )}
                </>
            )}
            {(installationStatus === ModuleStatus.INSTALL_FAILED ||
                installationStatus === ModuleStatus.UPGRADE_FAILED ||
                installationStatus === ModuleStatus.TIMEOUT ||
                installationStatus === ModuleStatus.UNKNOWN) && (
                <div className="module-details__installtion-failed flex left">
                    <ErrorIcon className="icon-dim-20 mr-12" />
                    {installationStatus === ModuleStatus.UNKNOWN
                        ? 'Last update status: Unknown'
                        : `${isUpgradeView ? 'Update' : 'Installation'} ${
                              installationStatus === ModuleStatus.TIMEOUT ? 'request timed out' : 'failed'
                          }`}
                </div>
            )}
            {appName &&
                installationStatus !== ModuleStatus.NOT_INSTALLED &&
                installationStatus !== ModuleStatus.INSTALLED &&
                installationStatus !== ModuleStatus.HEALTHY && (
                    <div
                        className={`mt-4 ${
                            installationStatus !== ModuleStatus.INSTALLING &&
                            installationStatus !== ModuleStatus.UPGRADING
                                ? 'ml-33'
                                : ''
                        }`}
                    >
                        {isUpgradeView && !canViewLogs && (
                            <NavLink
                                to={`${URLS.APP}/${URLS.EXTERNAL_APPS}/1%7Cdevtroncd%7C${appName}/${appName}/${URLS.APP_DETAILS}`}
                                target="_blank"
                            >
                                View details
                            </NavLink>
                        )}
                        {((isUpgradeView && canViewLogs) || (!isUpgradeView && isCICDModule)) && logPodName && (
                            <NavLink
                                to={`${URLS.APP}/${URLS.EXTERNAL_APPS}/1%7Cdevtroncd%7C${appName}/${appName}/${URLS.APP_DETAILS}/${URLS.APP_DETAILS_K8}/pod/${logPodName}/logs`}
                                target="_blank"
                            >
                                View logs
                            </NavLink>
                        )}
                    </div>
                )}
            {(installationStatus === ModuleStatus.INSTALLING || installationStatus === ModuleStatus.UPGRADING) && (
                <p className="module-details__installtion-note fs-12 fw-4 bcn-1 br-4">
                    NOTE: You can continue using Devtron. The {isUpgradeView ? 'update' : 'installation'} will continue
                    in the background.
                </p>
            )}
        </div>
    )
}

const GetHelpCard = (): JSX.Element => {
    return (
        <div className="module-details__get-help flex column top left br-4 cn-9 fs-13 mb-16">
            <span className="fw-6 mb-10">Facing issues?</span>
            <a
                className="module-details__help-chat cb-5 flex left"
                href="https://discord.devtron.ai/"
                target="_blank"
                rel="noreferrer noopener"
            >
                <Chat className="icon-dim-20 mr-12" /> Chat with support
            </a>
        </div>
    )
}

const ModuleUpdateNote = (): JSX.Element => {
    return (
        <div className="module-details__update-note br-4 cn-9 fs-13 mb-16">
            <div className="fs-4 mb-8">Integrations are updated along with Devtron updates.</div>
            <div className="fs-6">
                <NavLink to={URLS.STACK_MANAGER_ABOUT} className="fw-6">
                    Check for Devtron updates
                </NavLink>
            </div>
        </div>
    )
}

export const handleError = (err: any, isUpgradeView?: boolean): void => {
    if (err.code === 403) {
        toast.info(
            <ToastBody
                title="Access denied"
                subtitle={`Only super-admin users can ${isUpgradeView ? 'update Devtron' : 'install integrations'}.`}
            />,
            {
                className: 'devtron-toast unauthorized',
            },
        )
    } else {
        showError(err)
    }
}

export const InstallationWrapper = ({
    modulesList,
    moduleDetails,
    moduleName,
    installationStatus,
    canViewLogs,
    logPodName,
    serverInfo,
    upgradeVersion,
    baseMinVersionSupported,
    isUpgradeView,
    isActionTriggered,
    releaseNotes,
    updateActionTrigger,
    showPreRequisiteConfirmationModal,
    setShowPreRequisiteConfirmationModal,
    preRequisiteChecked,
    setPreRequisiteChecked,
}: InstallationWrapperType): JSX.Element => {
    const history: RouteComponentProps['history'] = useHistory()
    const location: RouteComponentProps['location'] = useLocation()
    const latestVersionAvailable = isLatestVersionAvailable(serverInfo?.currentVersion, upgradeVersion)
    const dependentModuleList =
        modulesList?.filter((module) => moduleDetails.dependentModules.indexOf(Number(module.id)) >= 0) || []
    const isPendingDependency =
        !isUpgradeView && dependentModuleList.some((module) => module.installationStatus !== ModuleStatus.INSTALLED)
    const belowMinSupportedVersion = baseMinVersionSupported
        ? isLatestVersionAvailable(serverInfo?.currentVersion, baseMinVersionSupported)
        : false
    const [preRequisiteList, setPreRequisiteList] = useState<
        { version: string; prerequisiteMessage: string; tagLink: string }[]
    >([])
    useEffect(() => {
        if (releaseNotes) {
            fetchPreRequisiteListFromReleaseNotes()
        }
    }, [releaseNotes])

    const fetchPreRequisiteListFromReleaseNotes = () => {
        const _preRequisiteList = []
        for (let index = 0; index < releaseNotes.length; index++) {
            const element = releaseNotes[index]
            if (element.releaseName === serverInfo?.currentVersion) {
                break
            }
            if (element.prerequisite && element.prerequisiteMessage) {
                _preRequisiteList.push({
                    version: element.releaseName,
                    prerequisiteMessage: element.prerequisiteMessage,
                    tagLink: element.tagLink,
                })
            }
        }
        setPreRequisiteList(_preRequisiteList.reverse())
    }

    const handleActionButtonClick = () => {
        if (isActionTriggered) {
            return
        } else {
            if (!isUpgradeView || preRequisiteChecked || preRequisiteList.length === 0) {
                if (!isUpgradeView && (belowMinSupportedVersion || isPendingDependency)) {
                    return
                }
                setShowPreRequisiteConfirmationModal && setShowPreRequisiteConfirmationModal(false)
                updateActionTrigger(true)
                handleAction(moduleName, isUpgradeView, upgradeVersion, updateActionTrigger, history, location)
            } else {
                setShowPreRequisiteConfirmationModal(true)
            }
        }
    }

    const handlePrerequisiteCheckedChange = (): void => {
        setPreRequisiteChecked(!preRequisiteChecked)
    }

    const hidePrerequisiteConfirmationModal = (): void => {
        setShowPreRequisiteConfirmationModal(false)
        setPreRequisiteChecked(false)
    }

    const renderPrerequisiteConfirmationModal = (): JSX.Element | null => {
        if (!showPreRequisiteConfirmationModal) return null
        return (
            <VisibleModal className="transition-effect">
                <div className="modal__body upload-modal no-top-radius mt-0 p-0 w-600">
                    <div className="flexbox content-space pl-20 pr-20 pt-16 pb-16 border-bottom">
                        <div className="fw-6 fs-16 cn-9">
                            {`Pre-requisites for update to ${upgradeVersion.toLowerCase()}`}
                        </div>
                        <CloseIcon className="pointer mt-2" onClick={hidePrerequisiteConfirmationModal} />
                    </div>
                    <div className="p-20">
                        <div className="fw-6 fs-13 cn-9 mb-12">
                            Please ensure you follow below pre-requisites steps in order.
                        </div>
                        {preRequisiteList.map((preRequisite) => (
                            <div className="fw-4 fs-13 cn-7 mb-12">
                                <div>Pre-requisites for {preRequisite.version}:</div>
                                <MarkDown
                                    className="pre-requisite-modal__mark-down"
                                    breaks={true}
                                    markdown={preRequisite.prerequisiteMessage}
                                />
                                <a className="cb-5" href={preRequisite.tagLink} target="_blank">
                                    View full release note
                                </a>
                            </div>
                        ))}
                        <div className="en-2 bw-1 flexbox content-space pt-8 pr-12 pb-8 pl-12 br-4">
                            <span className="cn-9 fs-13 fw-6">Facing issues?</span>
                            <a
                                className="pre-requisite-modal__help-chat fs-13 cb-5 flex left"
                                href="https://discord.devtron.ai/"
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                <Chat className="icon-dim-20 mr-12" /> Chat with support
                            </a>
                        </div>
                    </div>
                    <div className="p-16 border-top flexbox content-space">
                        <Checkbox
                            isChecked={preRequisiteChecked}
                            value={CHECKBOX_VALUE.CHECKED}
                            onChange={handlePrerequisiteCheckedChange}
                        >
                            <span className="mr-5 cn-9 fw-4 fs-13">
                                I have completed all pre-requisite steps required for the upgrade
                            </span>
                        </Checkbox>
                        <button
                            onClick={handleActionButtonClick}
                            disabled={!preRequisiteChecked}
                            className="cta ml-12 no-decor"
                        >
                            Update
                        </button>
                    </div>
                </div>
            </VisibleModal>
        )
    }

    return (
        <>
            <div className="module-details__install-wrapper">
                {serverInfo?.installationType && serverInfo.installationType !== InstallationType.OSS_HELM ? (
                    <>
                        {serverInfo.installationType === InstallationType.OSS_KUBECTL && (
                            <NotSupportedNote isUpgradeView={isUpgradeView} />
                        )}
                        {serverInfo.installationType === InstallationType.ENTERPRISE && <ManagedByNote />}
                    </>
                ) : (
                    <>
                        {installationStatus !== ModuleStatus.INSTALLING &&
                            installationStatus !== ModuleStatus.UPGRADING &&
                            installationStatus !== ModuleStatus.INSTALLED &&
                            (installationStatus !== ModuleStatus.HEALTHY ||
                                (installationStatus === ModuleStatus.HEALTHY && latestVersionAvailable)) && (
                                <>
                                    <ConditionalWrap
                                        condition={!isUpgradeView && (belowMinSupportedVersion || isPendingDependency)}
                                        wrap={(children) => (
                                            <Tippy
                                                className="default-tt w-200"
                                                arrow={false}
                                                placement="top"
                                                content={
                                                    belowMinSupportedVersion
                                                        ? DEVTRON_UPGRADE_MESSAGE
                                                        : PENDING_DEPENDENCY_MESSAGE
                                                }
                                            >
                                                <div>{children}</div>
                                            </Tippy>
                                        )}
                                    >
                                        <button
                                            className={`module-details__install-button cta flex mb-16 ${
                                                !isUpgradeView && (belowMinSupportedVersion || isPendingDependency)
                                                    ? 'disabled-state'
                                                    : ''
                                            }`}
                                            onClick={handleActionButtonClick}
                                        >
                                            {isActionTriggered && <Progressing />}
                                            {!isActionTriggered &&
                                                (installationStatus === ModuleStatus.NOT_INSTALLED ||
                                                    (installationStatus === ModuleStatus.HEALTHY &&
                                                        latestVersionAvailable)) && (
                                                    <>
                                                        {isUpgradeView ? (
                                                            `Update to ${upgradeVersion.toLowerCase()}`
                                                        ) : (
                                                            <>
                                                                <InstallIcon className="module-details__install-icon icon-dim-16 mr-8" />
                                                                Install
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            {!isActionTriggered &&
                                                (installationStatus === ModuleStatus.INSTALL_FAILED ||
                                                    installationStatus === ModuleStatus.UPGRADE_FAILED ||
                                                    installationStatus === ModuleStatus.TIMEOUT ||
                                                    installationStatus === ModuleStatus.UNKNOWN) && (
                                                    <>
                                                        <RetryInstallIcon className="module-details__retry-install-icon icon-dim-16 mr-8" />
                                                        {`Retry ${isUpgradeView ? 'update' : 'install'}`}
                                                    </>
                                                )}
                                        </button>
                                    </ConditionalWrap>
                                    {isUpgradeView && preRequisiteList.length > 0 && (
                                        <div className="flexbox pt-10 pr-16 pb-10 pl-16 bcy-1 ey-2 bw-1 br-4 mb-16">
                                            <Note className="module-details__install-icon icon-dim-16 mt-4 mr-8" />
                                            <div>
                                                <div className="cn-9 fw-6 fs-13">Pre-requisites for this update</div>
                                                <div
                                                    className="cb-5 fw-6 fs-13 pointer"
                                                    onClick={handleActionButtonClick}
                                                >
                                                    View details
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {!isUpgradeView && belowMinSupportedVersion && <UpgradeNote />}
                                </>
                            )}
                        {((installationStatus !== ModuleStatus.NOT_INSTALLED &&
                            installationStatus !== ModuleStatus.HEALTHY) ||
                            (installationStatus === ModuleStatus.HEALTHY && !latestVersionAvailable)) && (
                            <InstallationStatus
                                installationStatus={installationStatus}
                                appName={serverInfo?.releaseName}
                                canViewLogs={canViewLogs}
                                logPodName={logPodName}
                                isUpgradeView={isUpgradeView}
                                latestVersionAvailable={latestVersionAvailable}
                                isCICDModule={moduleName === ModuleNameMap.CICD}
                            />
                        )}
                        {moduleDetails && moduleDetails.isModuleConfigurable && !moduleDetails.isModuleConfigured && (
                            <ModuleNotConfigured moduleName={moduleName} />
                        )}
                        {!isUpgradeView && installationStatus === ModuleStatus.INSTALLED && <ModuleUpdateNote />}
                    </>
                )}
                {serverInfo?.installationType &&
                    (serverInfo.installationType === InstallationType.OSS_KUBECTL ||
                        (serverInfo.installationType === InstallationType.OSS_HELM &&
                            (installationStatus === ModuleStatus.INSTALL_FAILED ||
                                installationStatus === ModuleStatus.UPGRADE_FAILED ||
                                installationStatus === ModuleStatus.TIMEOUT ||
                                installationStatus === ModuleStatus.UNKNOWN))) && <GetHelpCard />}
                {!isUpgradeView && modulesList && <DependentModuleList modulesList={dependentModuleList} />}
            </div>
            {renderPrerequisiteConfirmationModal()}
        </>
    )
}

export const ModuleDetailsView = ({
    modulesList,
    moduleDetails,
    setDetailsMode,
    serverInfo,
    upgradeVersion,
    logPodName,
    fromDiscoverModules,
    isActionTriggered,
    handleActionTrigger,
    history,
    location,
}: ModuleDetailsViewType): JSX.Element | null => {
    const queryParams = new URLSearchParams(location.search)
    useEffect(() => {
        if (!moduleDetails && !new URLSearchParams(location.search).get('id')) {
            setDetailsMode('')
            history.push(
                fromDiscoverModules ? URLS.STACK_MANAGER_DISCOVER_MODULES : URLS.STACK_MANAGER_INSTALLED_MODULES,
            )
        }
    }, [])

    return moduleDetails ? (
        <div className="module-details__view-container pb-40">
            <Carousel className="module-details__carousel" imageUrls={moduleDetails.assets} />
            <div className="module-details__view-wrapper mt-24">
                <div className="module-details__feature-wrapper">
                    <img className="module-details__feature-icon mb-8" src={moduleDetails.icon} alt={moduleDetails.title} />
                    <h2 className="module-details__feature-heading cn-9 fs-20 fw-6">{moduleDetails.title}</h2>
                    <div className="module-details__divider mt-24 mb-24" />
                    <MarkDown
                        className="module-details__feature-info fs-14 fw-4 cn-9"
                        breaks={true}
                        markdown={moduleDetails.description}
                    />
                </div>
                <InstallationWrapper
                    modulesList={modulesList}
                    moduleDetails={moduleDetails}
                    moduleName={moduleDetails.name}
                    installationStatus={moduleDetails.installationStatus}
                    serverInfo={serverInfo}
                    upgradeVersion={upgradeVersion}
                    baseMinVersionSupported={moduleDetails.baseMinVersionSupported}
                    logPodName={logPodName}
                    isActionTriggered={isActionTriggered}
                    updateActionTrigger={(isActionTriggered) =>
                        handleActionTrigger(`moduleAction-${moduleDetails.name?.toLowerCase()}`, isActionTriggered)
                    }
                />
            </div>
        </div>
    ) : null
}

export const NoIntegrationsInstalledView = (): JSX.Element => {
    const history: RouteComponentProps['history'] = useHistory()

    return (
        <div className="no-integrations__installed-view">
            <EmptyState>
                <EmptyState.Image>
                    <img src={NoIntegrations} width="250" height="200" alt="no results" />
                </EmptyState.Image>
                <EmptyState.Title>
                    <h2 className="fs-16 fw-4 c-9">No integrations installed</h2>
                </EmptyState.Title>
                <EmptyState.Subtitle>Installed integrations will be available here</EmptyState.Subtitle>
                <EmptyState.Button>
                    <button
                        type="button"
                        className="empty-state__discover-btn flex fs-13 fw-6 br-4"
                        onClick={() => history.push(URLS.STACK_MANAGER_DISCOVER_MODULES)}
                    >
                        <DiscoverIcon className="discover-icon" /> <span className="ml-8">Discover integrations</span>
                    </button>
                </EmptyState.Button>
            </EmptyState>
        </div>
    )
}

const ManagedByNote = (): JSX.Element => {
    return (
        <div className="managed-by__note-wrapper mb-16">
            <div className="managed-by__note flex top left br-4 cn-9 bcb-1">
                <div className="icon-dim-20 mr-12">
                    <Info className="icon-dim-20" />
                </div>
                <div>
                    <h2 className="managed-by__note-title m-0 p-0 fs-13 fw-6 lh-20">Managed by Devtron Labs</h2>
                    <p className="fs-13 fw-4 mb-0 mt-4 lh-20">
                        Devtron stack is managed by Devtron Labs.
                        <br />
                        For any support, please contact your Devtron representative.
                    </p>
                </div>
            </div>
        </div>
    )
}

const ModuleNotConfigured = ({ moduleName }: { moduleName: string }): JSX.Element | null => {
    const configNoteDetail = MODULE_CONFIGURATION_DETAIL_MAP[moduleName]
    return (
        <div className="mb-16">
            <div className="pt-10 pr 16 pb-10 pl-16 flex top left br-4 cn-9 bcy-1 ey-2">
                <div className="icon-dim-20 mr-12">
                  <Warning className="icon-dim-20 warning-icon-y7" />
                </div>
                <div>
                    <h2 className="fs-13 fw-6 lh-20 mb-4 mt-0">{configNoteDetail.title}</h2>
                    <NavLink
                        exact
                        to={configNoteDetail.link}
                        activeClassName="active"
                        className="mt-8 no-decor fs-13 fw-6"
                    >
                        {configNoteDetail.linkText}
                    </NavLink>
                </div>
            </div>
        </div>
    )
}

const UpgradeNote = (): JSX.Element => {
    return (
        <div className="mb-16">
            <div className="pt-10 pr 16 pb-10 pl-16 flex top left br-4 cn-9 bcb-1 eb-2">
                <div className="icon-dim-20 mr-12">
                    <Info className="icon-dim-20" />
                </div>
                <div>
                    <p className="fs-13 fw-4 mb-0 lh-20">{DEVTRON_UPGRADE_MESSAGE}</p>
                    <NavLink
                        exact
                        to={URLS.STACK_MANAGER_ABOUT}
                        activeClassName="active"
                        className="mt-8 no-decor fs-13 fw-6"
                    >
                        Check for Devtron updates
                    </NavLink>
                </div>
            </div>
        </div>
    )
}

export const NotSupportedNote = ({ isUpgradeView }: { isUpgradeView: boolean }): JSX.Element => {
    return (
        <div className="not-supported__note-wrapper mb-16">
            <div className="not-supported__note flex top left br-4 cn-9 bcy-1">
                <div className="icon-dim-20 mr-12">
                    <Warning className="not-supported__note-icon icon-dim-20" />
                </div>
                <div>
                    <h2 className="m-0 p-0 fs-13 fw-6 lh-20">
                        {isUpgradeView
                            ? 'Updates from UI are currently not supported for kubectl installations'
                            : 'Integrations are currently not supported for Devtron installed via kubectl'}
                    </h2>
                    <p className="fs-13 fw-4 mb-0 mt-4 lh-20">
                        {isUpgradeView ? (
                            <>
                                Please refer&nbsp;
                                <a className="cb-5 fw-6" href={DOCUMENTATION.DEVTRON_UPGRADE} target="_blank">
                                    steps to upgrade using CLI
                                </a>
                            </>
                        ) : (
                            'This functionality is available only for Devtron installed via Helm charts'
                        )}
                    </p>
                </div>
            </div>
        </div>
    )
}

const DependentModuleList = ({ modulesList }: { modulesList: ModuleDetails[] }): JSX.Element => {
    const history: RouteComponentProps['history'] = useHistory()
    const location: RouteComponentProps['location'] = useLocation()
    const queryParams = new URLSearchParams(location.search)

    const handleModuleCardClick = (moduleDetails: ModuleDetails) => {
        queryParams.set('id', moduleDetails.name)
        history.push(
            `${
                moduleDetails.installationStatus !== ModuleStatus.INSTALLED
                    ? URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS
                    : URLS.STACK_MANAGER_INSTALLED_MODULES_DETAILS
            }?${queryParams.toString()}`,
        )
    }
    return modulesList?.length ? (
        <div>
            <div className="fs-14 fw-6 cn-9 mb-16">Pre-requisite integrations</div>
            {modulesList.map((module, idx) => {
                return (
                    <ModuleDetailsCard
                        key={`module-details__card-${idx}`}
                        moduleDetails={module}
                        className="cursor dependent-module__card"
                        handleModuleCardClick={handleModuleCardClick}
                        fromDiscoverModules={false}
                    />
                )
            })}
        </div>
    ) : null
}
