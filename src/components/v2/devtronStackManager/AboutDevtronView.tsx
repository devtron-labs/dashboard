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

import React, { useEffect } from 'react'
import AboutDevtron from '../../../assets/img/about-devtron@2x.png'
import { InstallationWrapper } from './DevtronStackManager.component'
import { AboutDevtronViewType, InstallationType } from './DevtronStackManager.type'
import './AboutDevtronView.scss'
import { URLS } from '../../../config'
import { MarkDown, TabGroup } from '@devtron-labs/devtron-fe-common-lib'

const AboutDevtronView = ({
    parentRef,
    releaseNotes,
    serverInfo,
    canViewLogs,
    logPodName,
    handleTabChange,
    selectedTabIndex,
    isActionTriggered,
    handleActionTrigger,
    showPreRequisiteConfirmationModal,
    setShowPreRequisiteConfirmationModal,
    preRequisiteChecked,
    setPreRequisiteChecked,
}: AboutDevtronViewType) => {
    const aboutDevtronTabs: { name: string; link: string }[] = [
        { name: 'About', link: URLS.STACK_MANAGER_ABOUT },
        { name: 'Releases', link: URLS.STACK_MANAGER_ABOUT_RELEASES },
    ]

    useEffect(() => {
        if (parentRef?.current) {
            parentRef.current.style.backgroundColor = 'var(--N0)'
        }

        return (): void => {
            if (parentRef?.current) {
                parentRef.current.style.backgroundColor = 'var(--bg-tertiary)'
            }
        }
    }, [])

    const renderTabs = (): JSX.Element => {
        return (
            <div className="dc__border-bottom mr-20 mb-24">
                <TabGroup
                    tabs={aboutDevtronTabs.map((tab, index) => ({
                        id: index,
                        label: tab.name,
                        tabType: 'navLink',
                        props: {
                            to: tab.link,
                            exact: true,
                            onClick: () => handleTabChange(index),
                        },
                    }))}
                    alignActiveBorderWithContainer
                />
            </div>
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
                                    breaks
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
            <div className="about-devtron__view-wrapper mt-24">
                <div className="about-devtron__details">
                    <h2 className="about-devtron__view-heading cn-9 fs-20 fw-6">
                        Devtron
                        {serverInfo?.currentVersion && serverInfo.installationType !== InstallationType.OSS_KUBECTL && (
                            <span>&nbsp;({serverInfo.currentVersion.toLowerCase()})</span>
                        )}
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
                        isUpgradeView
                        serverInfo={serverInfo}
                        upgradeVersion={releaseNotes[0]?.releaseName}
                        isActionTriggered={isActionTriggered}
                        releaseNotes={releaseNotes}
                        updateActionTrigger={(isActionTriggered) =>
                            handleActionTrigger('serverAction', isActionTriggered)
                        }
                        showPreRequisiteConfirmationModal={showPreRequisiteConfirmationModal}
                        setShowPreRequisiteConfirmationModal={setShowPreRequisiteConfirmationModal}
                        preRequisiteChecked={preRequisiteChecked}
                        setPreRequisiteChecked={setPreRequisiteChecked}
                    />
                )}
            </div>
        </div>
    )
}

export default React.memo(AboutDevtronView)
