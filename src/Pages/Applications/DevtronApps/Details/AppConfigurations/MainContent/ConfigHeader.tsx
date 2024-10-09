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
            className={`dc__transparent flexbox dc__align-items-center dc__gap-6 py-8 px-12 ${buttonContainerClass} ${isDisabled && !hasError ? 'dc__disabled' : ''} ${isActive ? 'bcn-0 cn-9' : 'cn-7'} ${isNextTabActive ? 'dc__border-right' : ''} ${isPreviousTabActive ? 'dc__border-left' : ''} fs-12 fw-6 lh-20`}
            role="tab"
        >
            {hasError ? (
                <ICErrorExclamation className="icon-dim-16 dc__no-shrink" />
            ) : (
                <Icon className={`icon-dim-16 dc__no-shrink ${isActive ? 'scn-9' : 'scn-7'}`} />
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
    hideDryRunTab = false,
}: ConfigHeaderProps) => {
    const validTabKeys = isOverridable
        ? CONFIG_HEADER_TAB_VALUES.OVERRIDE
        : CONFIG_HEADER_TAB_VALUES.BASE_DEPLOYMENT_TEMPLATE

    const filteredTabKeys = validTabKeys.filter(
        (currentTab: ConfigHeaderTabType) => !hideDryRunTab || currentTab !== ConfigHeaderTabType.DRY_RUN,
    )

    const activeTabIndex = filteredTabKeys.indexOf(configHeaderTab)

    return (
        <div className="flexbox w-100 dc__align-items-center bc-n50 dc__box-shadow-bottom-n2">
            {filteredTabKeys.map((currentTab: ConfigHeaderTabType, index: number) => (
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
                className={`flex-grow-1 h-100 ${activeTabIndex >= 0 && activeTabIndex === filteredTabKeys.length - 1 ? 'dc__border-left' : ''}`}
            />
        </div>
    )
}

export default ConfigHeader
