import { useHistory } from 'react-router-dom'
import { Button, ButtonVariantType, ComponentSizeType, useSearchString } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Add } from '@Icons/ic-add.svg'
import { getConfigurationTabTextWithIcon } from './notifications.util'
import { ConfigurationsTabTypes } from './constants'

export const ConfigurationTabSwitcher = () => {
    const history = useHistory()
    const { searchParams } = useSearchString()
    const queryParams = new URLSearchParams(history.location.search)
    const activeTab = queryParams.get('modal')

    const handleTabClick = (tab: ConfigurationsTabTypes) => () => {
        const newParams = {
            ...searchParams,
            modal: tab,
        }
        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }

    const handleAddClick = () => {
        const newParams = {
            ...searchParams,
            modal: activeTab,
            configId: '0',
        }
        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }
    return (
        <div className="px-20 flex dc__content-space">
            <div className="flex left en-2 bw-1 br-4 fs-12 dc__w-fit-content cn-9 bcn-2 dc__gap-1">
                {getConfigurationTabTextWithIcon().map((tab, index) => (
                    <button
                        type="button"
                        data-testid={`tab-${tab.link}`}
                        className={`tab-group__tab dc__unset-button-styles flexbox dc__gap-1 ${index === 0 ? 'dc__left-radius-4 ' : ''} ${index === getConfigurationTabTextWithIcon().length - 1 ? 'dc__right-radius-4' : ''} } ${activeTab === tab.link ? 'bcn-1 fw-6' : 'bcn-0'}`}
                        key={tab.link}
                        onClick={handleTabClick(tab.link)}
                    >
                        <div className="flex left dc__gap-6 px-10 py-4">
                            {tab.icon}
                            <span className="lh-20 cn-9">{tab.label}</span>
                        </div>
                    </button>
                ))}
            </div>
            <Button
                onClick={handleAddClick}
                variant={ButtonVariantType.primary}
                size={ComponentSizeType.small}
                dataTestId="add-configuration"
                startIcon={<Add />}
                text={`Add ${activeTab}`}
            />
        </div>
    )
}
