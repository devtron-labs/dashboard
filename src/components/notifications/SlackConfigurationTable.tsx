import { DeleteComponentsName } from '@Config/constantMessaging'
import { useSearchString } from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router-dom'
import { ConfigurationTableProps } from './types'
import { ConfigurationsTabTypes } from './constants'
import { getConfigTabIcons, renderText } from './notifications.util'
import './notifications.scss'
import { ConfigTableRowActionButton } from './ConfigTableRowActionButton'

const SlackConfigurationTable = ({ state, deleteClickHandler }: ConfigurationTableProps) => {
    const { searchParams } = useSearchString()
    const history = useHistory()
    const { slackConfigurationList } = state

    const onClickSlackConfigEdit = (id: number) => () => {
        const newParams = {
            ...searchParams,
            configId: id.toString(),
            modal: ConfigurationsTabTypes.SLACK,
        }
        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }

    return (
        <div className="slack-config-container h-100">
            <div className="slack-config-grid fs-12 fw-6 dc__uppercase cn-7 py-6 dc__gap-16 dc__border-bottom-n1 px-20  dc__position-sticky dc__top-0 bcn-0">
                <div className="icon-dim-24" />
                <p className="slack-config-table__name flex left m-0 ">Name</p>
                <p className="slack-config-table__webhook flex left m-0 ">Webhook URL</p>
                <p className="slack-config-table__action m-0" />
            </div>
            <div className="flex-grow-1">
                {slackConfigurationList.map((slackConfig) => (
                    <div
                        key={slackConfig.id}
                        className="slack-config-grid configuration-tab__table-row dc__gap-16 dc__hover-n50"
                    >
                        {getConfigTabIcons(ConfigurationsTabTypes.SLACK)}
                        <div className="slack-config-item__name flex left dc__gap-8">
                            {renderText(slackConfig.slackChannel, true, onClickSlackConfigEdit(slackConfig.id))}
                        </div>
                        {renderText(slackConfig.webhookUrl)}
                        <ConfigTableRowActionButton
                            onClickEditRow={onClickSlackConfigEdit(slackConfig.id)}
                            onClickDeleteRow={deleteClickHandler(
                                slackConfig.id,
                                DeleteComponentsName.SlackConfigurationTab,
                            )}
                            rootClassName="slack-config-table__action"
                            modal={ConfigurationsTabTypes.SLACK}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SlackConfigurationTable
