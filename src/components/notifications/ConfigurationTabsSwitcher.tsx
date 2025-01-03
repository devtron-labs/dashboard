import { NavLink, useRouteMatch } from 'react-router-dom'
import { Button, ButtonVariantType, ComponentSizeType } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Add } from '@Icons/ic-add.svg'
import { getConfigurationTabTextWithIcon } from './notifications.util'
import { ConfigurationTabSwitcherProps } from './types'
import { ConfigurationsTabTypes } from './constants'

export const ConfigurationTabSwitcher = ({ activeTab, setState, state }: ConfigurationTabSwitcherProps) => {
    const match = useRouteMatch()

    const handleTabClick = (tab: ConfigurationsTabTypes) => {
        setState({ ...state, activeTab: tab })
    }

    const handleAddClick = () => {
        switch (activeTab) {
            case ConfigurationsTabTypes.SES:
                setState({ ...state, showSESConfigModal: true, sesConfigId: 0 })
                break
            case ConfigurationsTabTypes.SMTP:
                setState({ ...state, showSMTPConfigModal: true, smtpConfigId: 0 })
                break
            case ConfigurationsTabTypes.SLACK:
                setState({ ...state, showSlackConfigModal: true, slackConfigId: 0 })
                break
            case ConfigurationsTabTypes.WEBHOOK:
                setState({ ...state, showWebhookConfigModal: true, webhookConfigId: 0 })
                break
            default:
                break
        }
    }
    return (
        <div className="px-20 flex dc__content-space">
            <div className="flex left en-2 bw-1 br-4 fs-12 dc__w-fit-content cn-9">
                {getConfigurationTabTextWithIcon().map((tab) => (
                    <NavLink
                        to={`${match.url}/${tab.link}`}
                        className="tab-group__tab dc__no-decor"
                        activeClassName="bcn-1"
                        key={tab.link}
                        onClick={() => handleTabClick(tab.link)}
                    >
                        <div className="flex left dc__gap-6 px-10 py-4">
                            <tab.icon className="icon-dim-20" />
                            <span className="lh-20 cn-9">{tab.label}</span>
                        </div>
                    </NavLink>
                ))}
            </div>
            <Button
                onClick={() => handleAddClick()}
                variant={ButtonVariantType.primary}
                size={ComponentSizeType.small}
                dataTestId="add-configuration"
                startIcon={<Add className="icon-dim-20" />}
                text={`Add ${activeTab}`}
            />
        </div>
    )
}
