import { BaseURLParams, CONFIG_HEADER_TAB_VALUES, ConfigHeaderTabType } from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { ConfigHeaderProps, ConfigHeaderTabProps } from './types'
import { getConfigHeaderTabConfig } from './utils'

// TODO: Will have to (unsaved changes state?) of yellow dot
const ConfigHeaderTab = ({
    handleTabChange,
    tab,
    activeTabIndex,
    currentTabIndex,
    isDisabled,
}: ConfigHeaderTabProps) => {
    const { envId } = useParams<BaseURLParams>()
    const handleChange = () => {
        handleTabChange(tab)
    }

    const isActive = activeTabIndex === currentTabIndex
    const isPreviousTabActive = activeTabIndex === currentTabIndex - 1 && currentTabIndex >= 0
    const isNextTabActive = activeTabIndex === currentTabIndex + 1

    // TODO: Need to send not isOverridden
    const { icon: Icon, text } = getConfigHeaderTabConfig(tab, !envId)

    // TODO: Replace with button component after syncing with product
    return (
        <button
            data-testid={`config-head-tab-${tab}`}
            onClick={handleChange}
            type="button"
            disabled={isDisabled}
            className={`dc__transparent flexbox dc__align-items-center dc__gap-6 py-8 px-12 ${isDisabled ? 'dc__disabled' : ''} ${isActive ? 'bcn-0 scn-9 cn-9' : 'bc-n50 cn-7 scn-7 dc__border-bottom'} ${isNextTabActive ? 'dc__border-right' : ''} ${isPreviousTabActive ? 'dc__border-left' : ''} fs-12 fw-6 lh-20`}
        >
            <Icon className="icon-dim-16 dc__no-shrink" />
            <span>{text}</span>
        </button>
    )
}

const ConfigHeader = ({ configHeaderTab, handleTabChange, isDisabled }: ConfigHeaderProps) => {
    const { envId } = useParams<BaseURLParams>()
    const validTabKeys = envId ? CONFIG_HEADER_TAB_VALUES.OVERRIDE : CONFIG_HEADER_TAB_VALUES.BASE_DEPLOYMENT_TEMPLATE
    const activeTabIndex = validTabKeys.indexOf(configHeaderTab)

    return (
        <div className="flexbox w-100 dc__align-items-center">
            {validTabKeys.map((currentTab: ConfigHeaderTabType, index: number) => (
                <ConfigHeaderTab
                    handleTabChange={handleTabChange}
                    tab={currentTab}
                    activeTabIndex={activeTabIndex}
                    currentTabIndex={index}
                    isDisabled={isDisabled}
                />
            ))}

            <div
                className={`flex-grow-1 bc-n50 dc__border-bottom h-100 ${activeTabIndex >= 0 && activeTabIndex === validTabKeys.length - 1 ? 'dc__border-left' : ''}`}
            />
        </div>
    )
}

export default ConfigHeader
