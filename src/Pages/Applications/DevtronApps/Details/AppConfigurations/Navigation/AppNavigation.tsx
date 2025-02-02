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
import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    ConditionalWrap,
    EnvResourceType,
    TippyCustomized,
    TippyTheme,
} from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import { ReactComponent as ICArrowSquareOut } from '@Icons/ic-arrow-square-out.svg'
import { DEVTRON_APPS_STEPS, STAGE_NAME } from '../AppConfig.types'
import { URLS } from '../../../../../../config'
import AppConfigurationCheckBox from './AppConfigurationCheckBox'
import { GIT_MATERIAL_IN_USE_MESSAGE } from '../../../../../../config/constantMessaging'
import DockerFileInUse from '../../../../../../assets/img/ic-dockerfile-in-use.png'

import EnvironmentOverrideRouter from './EnvironmentOverrideRouter'
import { useAppConfigurationContext } from '../AppConfiguration.provider'
import { renderNavItem } from './Navigation.helper'
import { EnvConfigurationsNav } from './EnvConfigurationsNav'

const isFELibAvailable = importComponentFromFELibrary('isFELibAvailable', null, 'function')

export const AppNavigation = () => {
    // HOOKS
    const { path } = useRouteMatch()
    const location = useLocation()

    // CONTEXTS
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
        isGitOpsConfigurationRequired,
        environments,
        envConfig,
        fetchEnvConfig,
        isUnlocked,
        lastUnlockedStage,
        envIdToEnvApprovalConfigurationMap,
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
            infoTextHeading={`Repo '${getRepo}' is in use`}
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

    const getValidBackURL = () => {
        const isBackURLLocked = location.pathname === lastUnlockedStage
        const secondLastUnlockedStage = isBackURLLocked
            ? navItems.reduce(
                  (acc, curr) => {
                      if (curr.href === lastUnlockedStage) {
                          acc.found = true
                      }

                      if (acc.found) {
                          acc.href = acc.result[acc.result.length - 1]?.href
                          return acc
                      }

                      if (!curr.isLocked) {
                          acc.result.push(curr)
                      }

                      return acc
                  },
                  { result: [], found: false, href: '' },
              ).href
            : ''

        return secondLastUnlockedStage || lastUnlockedStage
    }

    return (
        <Switch>
            <Route
                path={[
                    `${path}/:resourceType(${Object.values(EnvResourceType).join('|')})`,
                    `${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}/:envId(\\d+)/:resourceType(${Object.values(EnvResourceType).join('|')})`,
                ]}
            >
                {({ match }) => (
                    <EnvConfigurationsNav
                        key={`env-configurations-nav-${'envId' in match.params ? match.params.envId : ''}`}
                        envConfig={envConfig}
                        fetchEnvConfig={fetchEnvConfig}
                        environments={environments.map(({ environmentName, environmentId }) => ({
                            id: environmentId,
                            name: environmentName,
                        }))}
                        showBaseConfigurations
                        showDeploymentTemplate={!isJobView}
                        goBackURL={getValidBackURL()}
                        compareWithURL={`${path}/:envId(\\d+)?`}
                        showComparison={!isJobView && isUnlocked.workflowEditor}
                        isCMSecretLocked={!isUnlocked.workflowEditor}
                        appOrEnvIdToResourceApprovalConfigurationMap={envIdToEnvApprovalConfigurationMap}
                    />
                )}
            </Route>
            <Route key="default-navigation">
                <>
                    {!hideConfigHelp && (
                        <AppConfigurationCheckBox
                            selectedNav={selectedNav}
                            isJobView={isJobView}
                            totalSteps={totalSteps}
                        />
                    )}
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
                                isFELibAvailable && (
                                    <div key={item.stage}>
                                        {!canShowExternalLinks && <div className="dc__border-bottom-n1 mt-8 mb-8" />}
                                        {renderNavItem(item, null, {
                                            target: '_blank',
                                            icon: <ICArrowSquareOut className="icon-dim-16 dc__no-shrink scn-8" />,
                                            tooltipContent:
                                                'Configuration change approval has been moved to Global Configuration',
                                        })}
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
                                    {item.required && renderNavItem(item, isJobView)}
                                </ConditionalWrap>
                            )
                        }

                        return (
                            <EnvironmentOverrideRouter
                                key={item.stage}
                                envIdToEnvApprovalConfigurationMap={envIdToEnvApprovalConfigurationMap}
                            />
                        )
                    })}
                    {isJobView && <div className="h-100" />}
                    <div className="dc__align-self-end">
                        <Button
                            dataTestId="delete-job-app-button"
                            variant={ButtonVariantType.secondary}
                            size={ComponentSizeType.medium}
                            style={ButtonStyleType.negative}
                            onClick={deleteApp}
                            text={`Delete ${isJobView ? 'Job' : 'Application'}`}
                            fullWidth
                        />
                    </div>
                </>
            </Route>
        </Switch>
    )
}
