import { DeleteComponentsName } from '@Config/constantMessaging'
import { noop, useSearchString } from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router-dom'
import { ConfigurationTableProps } from './types'
import { EmptyConfigurationView } from './EmptyConfigurationView'
import { ConfigurationsTabTypes } from './constants'
import { ConfigTableRowActionButton } from './ConfigTableRowActionButton'
import { getConfigTabIcons, renderText } from './notifications.util'
import webhookEmpty from '../../assets/img/webhook-empty.png'

export const WebhookConfigurationTable = ({ state, deleteClickHandler }: ConfigurationTableProps) => {
    const { webhookConfigurationList } = state
    const { searchParams } = useSearchString()
    const history = useHistory()

    if (webhookConfigurationList.length === 0) {
        return <EmptyConfigurationView configTabType={ConfigurationsTabTypes.WEBHOOK} image={webhookEmpty} />
    }

    const onClickWebhookConfigEdit = (id: number) => () => {
        const newParams = {
            ...searchParams,
            configId: id.toString(),
            modal: ConfigurationsTabTypes.WEBHOOK,
        }
        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }

    return (
        <div className="webhook-config-container">
            <div className="webhook-config-grid fs-12 fw-6 dc__uppercase cn-7 py-6 dc__gap-16 dc__border-bottom-n1 px-20">
                <p className="icon-dim-24 m-0" />
                <p className="webhook-config-table__name flex left m-0">Name</p>
                <p className="webhook-config-table__webhook dc__truncate-text flex left m-0">Webhook URL</p>
                <p className="webhook-config-table__action m-0" />
            </div>
            {webhookConfigurationList.map((webhookConfig) => (
                <div
                    key={webhookConfig.id}
                    className="configuration-tab__table-row webhook-config-grid fs-13 cn-9 dc__gap-16 py-6 px-20 dc__hover-n50"
                    data-testid={`webhook-container-${webhookConfig.name}`}
                >
                    {getConfigTabIcons(ConfigurationsTabTypes.WEBHOOK)}
                    {renderText(
                        webhookConfig.webhookUrl,
                        true,
                        onClickWebhookConfigEdit(webhookConfig.id),
                        `webhook-config-name-${webhookConfig.name}`,
                    )}
                    {renderText(webhookConfig.name, false, noop, `webhook-url-${webhookConfig.webhookUrl}`)}
                    <ConfigTableRowActionButton
                        onClickEditRow={onClickWebhookConfigEdit(webhookConfig.id)}
                        onClickDeleteRow={deleteClickHandler(
                            webhookConfig.id,
                            DeleteComponentsName.WebhookConfigurationTab,
                        )}
                        rootClassName="webhook-config-table__action"
                        modal={ConfigurationsTabTypes.WEBHOOK}
                    />
                </div>
            ))}
        </div>
    )
}
