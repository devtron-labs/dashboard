/*
 *   Copyright (c) 2024 Devtron Inc.
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import React, { ReactNode } from 'react'

import { NavLink, useLocation } from 'react-router-dom'
import { ConditionalWrap, TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import { CustomNavItemsType, DEVTRON_APPS_STEPS, STAGE_NAME } from '../appConfig.type'
import AppConfigurationCheckBox from './AppConfigurationCheckBox'
import { importComponentFromFELibrary } from '../../../../../../components/common'
import { DeleteComponentsName, GIT_MATERIAL_IN_USE_MESSAGE } from '../../../../../../config/constantMessaging'
import DockerFileInUse from '../../../../../../assets/img/ic-dockerfile-in-use.png'
import { ReactComponent as Lock } from '../../../../../../assets/icons/ic-locked.svg'
import { ReactComponent as ProtectedIcon } from '../../../../../../assets/icons/ic-shield-protect-fill.svg'

import EnvironmentOverrideRouter from './EnvironmentOverrideRouter'
import { useAppConfigurationContext } from '../AppConfiguration.provider'

const ConfigProtectionView = importComponentFromFELibrary('ConfigProtectionView')

function renderNavItem(item: CustomNavItemsType, isBaseConfigProtected?: boolean) {
    const linkDataTestName = item.title.toLowerCase().split(' ').join('-')

    return (
        <NavLink
            data-testid={`${linkDataTestName}-link`}
            key={item.title}
            onClick={(event) => {
                if (item.isLocked) {
                    event.preventDefault()
                }
            }}
            className="app-compose__nav-item cursor"
            to={item.href}
        >
            <span className="dc__ellipsis-right nav-text">{item.title}</span>
            {item.isLocked && (
                <Lock className="app-compose__nav-icon icon-dim-20" data-testid={`${linkDataTestName}-lockicon`} />
            )}
            {!item.isLocked && isBaseConfigProtected && item.isProtectionAllowed && (
                <ProtectedIcon className="icon-dim-20 fcv-5" />
            )}
        </NavLink>
    )
}

export const AppNavigation = () => {
    const location = useLocation()

    const {
        navItems,
        deleteApp,
        canShowExternalLinks,
        showCannotDeleteTooltip,
        isWorkflowEditorUnlocked,
        toggleRepoSelectionTippy,
        getRepo,
        isJobView,
        hideConfigHelp,
        workflowsRes,
        getWorkflows,
        environments: environmentList,
        isBaseConfigProtected,
        reloadEnvironments,
        isGitOpsConfigurationRequired,
    } = useAppConfigurationContext()

    const selectedNav = navItems.filter(
        (navItem) => navItem.stage !== 'REDIRECT_ITEM' && location.pathname.indexOf(navItem.href) >= 0,
    )[0]
    const totalSteps = isGitOpsConfigurationRequired
        ? DEVTRON_APPS_STEPS.GITOPS_CONFIG
        : DEVTRON_APPS_STEPS.NO_GITOS_CONFIG

    const getEnvOverrideTippy = (children: ReactNode) => (
        <TippyCustomized
            theme={TippyTheme.black}
            className="w-300 ml-2"
            placement="right"
            iconPath={DockerFileInUse}
            visible={showCannotDeleteTooltip}
            iconClass="repo-configured-icon"
            iconSize={32}
            infoTextHeading={`${DeleteComponentsName.GitRepo} '${getRepo}' is in use`}
            infoText={GIT_MATERIAL_IN_USE_MESSAGE}
            showCloseButton
            trigger="manual"
            interactive
            showOnCreate
            arrow
            animation="shift-toward-subtle"
            onClose={toggleRepoSelectionTippy}
        >
            <div>{children}</div>
        </TippyCustomized>
    )

    return (
        <>
            {!hideConfigHelp && (
                <AppConfigurationCheckBox selectedNav={selectedNav} isJobView={isJobView} totalSteps={totalSteps} />
            )}

            {navItems.map((item) => {
                if (item.altNavKey) {
                    return null
                }
                if (item.stage === 'EXTERNAL_LINKS') {
                    return (
                        canShowExternalLinks && (
                            <div key={item.stage}>
                                <div className="dc__border-bottom-n1 mt-8 mb-8" />
                                {renderNavItem(item)}
                            </div>
                        )
                    )
                }
                if (item.stage === 'PROTECT_CONFIGURATION') {
                    return (
                        isWorkflowEditorUnlocked &&
                        ConfigProtectionView && (
                            <div key={item.stage}>
                                {!canShowExternalLinks && <div className="dc__border-bottom-n1 mt-8 mb-8" />}
                                {renderNavItem(item)}
                            </div>
                        )
                    )
                }

                if (item.stage !== 'ENV_OVERRIDE' || (item.stage === 'ENV_OVERRIDE' && item.isLocked)) {
                    return (
                        <ConditionalWrap
                            key={item.stage}
                            condition={showCannotDeleteTooltip && item.stage === STAGE_NAME.CI_CONFIG}
                            wrap={getEnvOverrideTippy}
                        >
                            {item.required && renderNavItem(item, isBaseConfigProtected)}
                        </ConditionalWrap>
                    )
                }

                return (
                    <EnvironmentOverrideRouter
                        key={item.stage}
                        isJobView={isJobView}
                        workflowsRes={workflowsRes}
                        getWorkflows={getWorkflows}
                        allEnvs={environmentList}
                        reloadEnvironments={reloadEnvironments}
                    />
                )
            })}
            {isJobView && <div className="h-100" />}
            <div className="cta-delete-app flex w-100 dc__position-sticky pt-2 pb-16 bcn-0">
                <button
                    data-testid="delete-job-app-button"
                    type="button"
                    className="flex cta delete mt-8 w-100 h-36"
                    onClick={deleteApp}
                >
                    Delete {isJobView ? 'Job' : 'Application'}
                </button>
            </div>
        </>
    )
}
