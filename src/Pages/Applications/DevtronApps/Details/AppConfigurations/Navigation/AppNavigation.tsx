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

import { ReactNode } from 'react'
import { Route, Switch, useLocation, useRouteMatch } from 'react-router-dom'
import { ConditionalWrap, TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import { DEVTRON_APPS_STEPS, STAGE_NAME } from '../appConfig.type'
import { URLS } from '../../../../../../config'
import AppConfigurationCheckBox from './AppConfigurationCheckBox'
import { importComponentFromFELibrary } from '../../../../../../components/common'
import { DeleteComponentsName, GIT_MATERIAL_IN_USE_MESSAGE } from '../../../../../../config/constantMessaging'
import DockerFileInUse from '../../../../../../assets/img/ic-dockerfile-in-use.png'

import EnvironmentOverrideRouter from './EnvironmentOverrideRouter'
import { useAppConfigurationContext } from '../AppConfiguration.provider'
import { renderNavItem } from './Navigation.helper'
import { EnvConfigurationsNav } from './EnvConfigurationsNav'

const ConfigProtectionView = importComponentFromFELibrary('ConfigProtectionView')

export const AppNavigation = () => {
    // HOOKS
    const { path } = useRouteMatch()
    const location = useLocation()

    // CONTEXTS
    const {
        appId,
        navItems,
        deleteApp,
        canShowExternalLinks,
        showCannotDeleteTooltip,
        isWorkflowEditorUnlocked,
        toggleRepoSelectionTippy,
        getRepo,
        isJobView,
        hideConfigHelp,
        isBaseConfigProtected,
        isGitOpsConfigurationRequired,
    } = useAppConfigurationContext()

    // CONSTANTS
    const selectedNav = navItems.filter(
        (navItem) => navItem.stage !== STAGE_NAME.REDIRECT_ITEM && location.pathname.indexOf(navItem.href) >= 0,
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
            <Switch>
                <Route
                    key={`env-configurations-${appId}`}
                    path={`${path}/:resourceType(deployment-template|configmap|secrets|${URLS.APP_ENV_OVERRIDE_CONFIG})/:envId(\\d+)?`}
                >
                    <EnvConfigurationsNav />
                </Route>
                <Route key="default-navigation">
                    {navItems.map((item) => {
                        if (item.altNavKey) {
                            return null
                        }

                        if (item.stage === STAGE_NAME.EXTERNAL_LINKS) {
                            return (
                                canShowExternalLinks && (
                                    <div key={item.stage}>
                                        <div className="dc__border-bottom-n1 mt-8 mb-8" />
                                        {renderNavItem(item)}
                                    </div>
                                )
                            )
                        }

                        if (item.stage === STAGE_NAME.PROTECT_CONFIGURATION) {
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

                        if (
                            item.stage !== STAGE_NAME.ENV_OVERRIDE ||
                            (item.stage === STAGE_NAME.ENV_OVERRIDE && item.isLocked)
                        ) {
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

                        return <EnvironmentOverrideRouter key={item.stage} />
                    })}
                    {isJobView && <div className="h-100" />}
                    <div className="cta-delete-app flex w-100 dc__position-sticky pt-2 pb-16 bcn-0 dc__align-self-end">
                        <button
                            data-testid="delete-job-app-button"
                            type="button"
                            className="flex cta delete mt-8 w-100 h-36"
                            onClick={deleteApp}
                        >
                            Delete {isJobView ? 'Job' : 'Application'}
                        </button>
                    </div>
                </Route>
            </Switch>
        </>
    )
}
