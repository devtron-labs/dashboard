import { DeleteComponentsName } from '@Config/constantMessaging'
import { useSearchString } from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router-dom'
import { ConfigurationTableProps } from './types'
import { EmptyConfigurationView } from './EmptyConfigurationView'
import { ConfigurationsTabTypes } from './constants'
import { getConfigTabIcons, renderText } from './notifications.util'
import './notifications.scss'
import emptySlack from '../../assets/img/slack-empty.png'
import { ConfigTableRowActionButton } from './ConfigTableRowActionButton'

const SlackConfigurationTable = ({ state, deleteClickHandler }: ConfigurationTableProps) => {
    const { searchParams } = useSearchString()
    const history = useHistory()
    const { slackConfigurationList } = state

    if (slackConfigurationList.length === 0) {
        return <EmptyConfigurationView configTabType={ConfigurationsTabTypes.SLACK} image={emptySlack} />
    }

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
        <div className="slack-config-container">
            <div className="slack-config-grid fs-12 fw-6 dc__uppercase cn-7 py-6 dc__gap-16 dc__border-bottom-n1 px-20">
                <div className="icon-dim-24" />
                <p className="slack-config-table__name flex left m-0 ">Name</p>
                <p className="slack-config-table__webhook flex left m-0 ">Webhook URL</p>
                <p className="slack-config-table__action m-0" />
            </div>
            <div>
                {slackConfigurationList.map((slackConfig) => (
                    <div key={slackConfig.id} className="slack-config-grid configuration-tab__table-row dc__gap-16">
                        {getConfigTabIcons(ConfigurationsTabTypes.SLACK)}
                        {renderText(slackConfig.slackChannel)}
                        {renderText(slackConfig.webhookUrl)}
                        <ConfigTableRowActionButton
                            onClickEditRow={onClickSlackConfigEdit(slackConfig.id)}
                            onClickDeleteRow={() => {
                                deleteClickHandler(slackConfig.id, DeleteComponentsName.SlackConfigurationTab)
                            }}
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
