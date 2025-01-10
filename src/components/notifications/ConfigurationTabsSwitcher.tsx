import { useHistory } from 'react-router-dom'
import { useSearchString } from '@devtron-labs/devtron-fe-common-lib'
import { getConfigurationTabTextWithIcon } from './notifications.util'
import { ConfigurationsTabTypes } from './constants'
import { AddConfigurationButton } from './AddConfigurationButton'

export const ConfigurationTabSwitcher = () => {
    const history = useHistory()
    const { searchParams } = useSearchString()
    const queryParams = new URLSearchParams(history.location.search)
    const activeTab = queryParams.get('modal') as ConfigurationsTabTypes

    const handleTabClick = (_activeTab: ConfigurationsTabTypes) => () => {
        const newParams = {
            ...searchParams,
            modal: _activeTab,
        }
        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }

    return (
        <div className="px-20 flex dc__content-space pt-16">
            <div className="flex left en-2 bw-1 br-4 fs-12 dc__w-fit-content cn-9 bcn-2 dc__gap-1">
                {getConfigurationTabTextWithIcon().map((tab, index) => (
                    <button
                        type="button"
                        data-testid={`${tab.link}-tab-title`}
                        className={`tab-group__tab dc__unset-button-styles flexbox dc__gap-1 dc__hover-text-n90 dc__gap-6 px-10 py-4 fw-6 ${index === 0 ? 'dc__left-radius-4 ' : ''}
                         ${index === getConfigurationTabTextWithIcon().length - 1 ? 'dc__right-radius-4' : ''} ${activeTab === tab.link ? 'bcn-1 fw-6 cn-9' : 'bcn-0 cn-7'}`}
                        key={tab.link}
                        onClick={handleTabClick(tab.link)}
                    >
                        {tab.icon}
                        <span className="lh-20">{tab.label}</span>
                    </button>
                ))}
            </div>
            <AddConfigurationButton activeTab={activeTab} />
        </div>
    )
}
