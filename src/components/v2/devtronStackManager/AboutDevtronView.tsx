import React, { useEffect } from 'react'
import AboutDevtron from '../../../assets/img/about-devtron@2x.png'
import { MarkDown } from '../../charts/discoverChartDetail/DiscoverChartDetails'
import { InstallationWrapper } from './DevtronStackManager.component'
import { AboutDevtronViewType } from './DevtronStackManager.type'
import './AboutDevtronView.scss'
import { NavLink, RouteComponentProps, useLocation } from 'react-router-dom'
import { URLS } from '../../../config'

function AboutDevtronView({
    parentRef,
    releaseNotes,
    serverInfo,
    setShowManagedByDialog,
    canViewLogs,
    logPodName,
    handleTabChange,
    selectedTabIndex,
    isActionTriggered,
    handleActionTrigger,
}: AboutDevtronViewType) {
    const aboutDevtronTabs: { name: string; link: string }[] = [
        { name: 'About', link: URLS.STACK_MANAGER_ABOUT },
        { name: 'Releases', link: URLS.STACK_MANAGER_ABOUT_RELEASES },
    ]

    useEffect(() => {
        if (parentRef?.current) {
            parentRef.current.style.backgroundColor = 'white'
        }

        return (): void => {
            if (parentRef?.current) {
                parentRef.current.style.backgroundColor = 'var(--window-bg)'
            }
        }
    }, [])

    const renderTabs = (): JSX.Element => {
        return (
            <ul className="tab-list tab-list--borderd mr-20 mb-24">
                {aboutDevtronTabs.map((tab, index) => {
                    return (
                        <li onClick={() => handleTabChange(index)} key={index} className="tab-list__tab">
                            <NavLink
                                exact
                                to={tab.link}
                                activeClassName="active"
                                className="tab-list__tab-link no-decor"
                            >
                                {tab.name}
                            </NavLink>
                            {selectedTabIndex == index && <div className="about-devtron__active-tab" />}
                        </li>
                    )
                })}
            </ul>
        )
    }

    const renderTabData = (): JSX.Element => {
        if (selectedTabIndex === 0) {
            return (
                <p className="about-devtron__view-info fs-13 fw-4 m-0">
                    Devtron is a tool integration platform for Kubernetes that deeply integrates with products across
                    the lifecycle of microservices,i.e., CI, CD, security, cost, debugging, and observability via an
                    intuitive web interface.
                </p>
            )
        }

        return (
            releaseNotes && (
                <div className="about-devtron__view-releases">
                    {releaseNotes.map((releaseNote, idx) => {
                        return (
                            <div key={`release-notes-${idx}`} className="about-devtron__release-notes-wrapper cn-9">
                                <h2 className="about-devtron__release-name fs-16 fw-6">
                                    Release {releaseNote.releaseName}
                                </h2>
                                <MarkDown
                                    className="about-devtron__release-notes fs-14 fw-4"
                                    breaks={true}
                                    markdown={
                                        releaseNote.body.startsWith('##')
                                            ? releaseNote.body.replace('##', '')
                                            : releaseNote.body
                                    }
                                />
                            </div>
                        )
                    })}
                </div>
            )
        )
    }

    return (
        <div className="about-devtron__view-container flex column left top">
            <img className="about-devtron__view-image" src={AboutDevtron} alt="About Devtron" />
            <div className="about-devtron__view-wrapper">
                <div className="about-devtron__details">
                    <h2 className="about-devtron__view-heading cn-9 fs-20 fw-6">
                        Devtron {serverInfo?.currentVersion ? `(${serverInfo.currentVersion.toLowerCase()})` : ''}
                    </h2>
                    <div className="about-devtron__view-tabs w-100">
                        {renderTabs()}
                        {renderTabData()}
                    </div>
                </div>
                {serverInfo && (
                    <InstallationWrapper
                        installationStatus={serverInfo.status}
                        canViewLogs={canViewLogs}
                        logPodName={logPodName}
                        isUpgradeView={true}
                        serverInfo={serverInfo}
                        upgradeVersion={releaseNotes[0]?.releaseName}
                        setShowManagedByDialog={setShowManagedByDialog}
                        isActionTriggered={isActionTriggered}
                        updateActionTrigger={(isActionTriggered) =>
                            handleActionTrigger('serverAction', isActionTriggered)
                        }
                    />
                )}
            </div>
        </div>
    )
}

export default React.memo(AboutDevtronView)
