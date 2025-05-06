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

import {
    ActivityIndicator,
    CONFIG_HEADER_TAB_VALUES,
    ConfigHeaderTabType,
    InvalidYAMLTippyWrapper,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICErrorExclamation } from '@Icons/ic-error-exclamation.svg'

import { ConfigHeaderProps, ConfigHeaderTabProps } from './types'
import { getConfigHeaderTabConfig } from './utils'

import './ConfigHeader.scss'

const ConfigHeaderTab = ({
    handleTabChange,
    tab,
    activeTabIndex,
    currentTabIndex,
    isDisabled,
    areChangesPresent,
    isOverridable,
    showNoOverride,
    hasError,
}: ConfigHeaderTabProps) => {
    const handleChange = () => {
        handleTabChange(tab)
    }

    const isActive = activeTabIndex === currentTabIndex
    const isPreviousTabActive = activeTabIndex === currentTabIndex - 1 && currentTabIndex >= 0
    const isNextTabActive = activeTabIndex === currentTabIndex + 1
    const showUnsavedChangesIndicator = areChangesPresent && tab === ConfigHeaderTabType.VALUES

    const { icon: Icon, text } = getConfigHeaderTabConfig(tab, isOverridable, showNoOverride)

    const buttonContainerClass = !isDisabled && !hasError ? 'config-header__tab' : ''

    return (
        <button
            data-testid={`config-head-tab-${tab}`}
            onClick={handleChange}
            type="button"
            disabled={isDisabled}
            className={`dc__transparent flexbox dc__align-items-center dc__gap-6 py-8 px-12 ${buttonContainerClass} ${isDisabled && !hasError ? 'dc__disabled' : ''} ${isActive ? 'bg__primary cn-9' : 'cn-7'} ${isNextTabActive ? 'dc__border-right' : ''} ${isPreviousTabActive ? 'dc__border-left' : ''} fs-12 fw-6 lh-20`}
            role="tab"
        >
            {hasError ? (
                <ICErrorExclamation className="icon-dim-16 dc__no-shrink" />
            ) : (
                <Icon
                    className={`icon-dim-16 dc__no-shrink ${isActive ? 'scn-9' : 'scn-7'} config-header__tab--icon`}
                />
            )}
            <span>{text}</span>
            {showUnsavedChangesIndicator && (
                <ActivityIndicator iconSizeClass="icon-dim-8" backgroundColorClass="bcy-5" />
            )}
        </button>
    )
}

const ConfigHeader = ({
    configHeaderTab,
    handleTabChange,
    isDisabled,
    areChangesPresent,
    isOverridable,
    showNoOverride,
    parsingError,
    restoreLastSavedYAML,
    hideTabs = {},
}: ConfigHeaderProps) => {
    const tabKeys = (
        isOverridable ? CONFIG_HEADER_TAB_VALUES.OVERRIDE : CONFIG_HEADER_TAB_VALUES.BASE_DEPLOYMENT_TEMPLATE
    ).filter((tab) => !hideTabs[tab])

    const activeTabIndex = tabKeys.indexOf(configHeaderTab)

    return (
        <div className="flexbox w-100 dc__align-items-center bg__secondary dc__box-shadow-bottom-n2">
            {tabKeys.map((currentTab: ConfigHeaderTabType, index: number) => (
                <InvalidYAMLTippyWrapper
                    key={currentTab}
                    parsingError={parsingError}
                    restoreLastSavedYAML={restoreLastSavedYAML}
                >
                    <div>
                        <ConfigHeaderTab
                            handleTabChange={handleTabChange}
                            tab={currentTab}
                            activeTabIndex={activeTabIndex}
                            currentTabIndex={index}
                            isDisabled={isDisabled || !!parsingError}
                            areChangesPresent={areChangesPresent}
                            isOverridable={isOverridable}
                            showNoOverride={showNoOverride}
                            hasError={!!parsingError && currentTab === ConfigHeaderTabType.VALUES}
                        />
                    </div>
                </InvalidYAMLTippyWrapper>
            ))}

            <div
                className={`flex-grow-1 h-100 ${activeTabIndex >= 0 && activeTabIndex === tabKeys.length - 1 ? 'dc__border-left' : ''}`}
            />
        </div>
    )
}

export default ConfigHeader
