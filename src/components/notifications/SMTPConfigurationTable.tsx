import { DeleteComponentsName } from '@Config/constantMessaging'
import { noop, useSearchString } from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router-dom'
import { ConfigurationTableProps } from './types'
import { ConfigurationsTabTypes } from './constants'
import { EmptyConfigurationView } from './EmptyConfigurationView'
import emptySmtp from '../../assets/img/smtp-empty.png'
import { getConfigTabIcons, renderDefaultTag, renderText } from './notifications.util'
import { ConfigTableRowActionButton } from './ConfigTableRowActionButton'

export const SMTPConfigurationTable = ({ state, deleteClickHandler }: ConfigurationTableProps) => {
    const { smtpConfigurationList } = state
    const { searchParams } = useSearchString()
    const history = useHistory()

    const onClickEditRow = (configId) => () => {
        const newParams = {
            ...searchParams,
            configId: configId.toString(),
            modal: ConfigurationsTabTypes.SMTP,
        }
        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }

    if (smtpConfigurationList.length === 0) {
        return <EmptyConfigurationView configTabType={ConfigurationsTabTypes.SMTP} image={emptySmtp} />
    }

    return (
        <div className="smtp-config-container">
            <div className="smtp-config-grid fs-12 fw-6 dc__uppercase cn-7 py-6 dc__gap-16 dc__border-bottom-n1 px-20">
                <p className="icon-dim-24 m-0" />
                <p className="ses-config-table__name dc__truncate-text flex left m-0">Name</p>
                <p className="smtp-config-table__host dc__truncate-text flex left m-0">Host</p>
                <p className="smtp-config-table__port dc__truncate-text flex left m-0">Port</p>
                <p className="smtp-config-table__email dc__truncate-text flex left m-0">Sender&apos; Email</p>
                <p className="ses-config-table__action" aria-label="Action" />
            </div>
            <div>
                <div className="mb-8">
                    {smtpConfigurationList.map((smtpConfig) => (
                        <div
                            data-testid={`smtp-container-${smtpConfig.name}`}
                            key={smtpConfig.id}
                            className="configuration-tab__table-row smtp-config-grid dc__gap-16 py-6 px-20"
                        >
                            {getConfigTabIcons(ConfigurationsTabTypes.SMTP)}
                            <div
                                data-testid={`smtp-config-name-${smtpConfig.name}`}
                                className="ses-config-table__name dc__truncate-text flexbox dc__gap-8"
                            >
                                {renderText(smtpConfig.name, true, onClickEditRow(smtpConfig.id))}
                                {renderDefaultTag(smtpConfig.isDefault)}
                            </div>
                            {renderText(smtpConfig.host, false, noop, `smtp-config-host-${smtpConfig.host}`)}
                            {renderText(smtpConfig.port)}
                            {renderText(smtpConfig.email)}
                            <ConfigTableRowActionButton
                                onClickEditRow={onClickEditRow(smtpConfig.id)}
                                onClickDeleteRow={() => {
                                    deleteClickHandler(smtpConfig.id, DeleteComponentsName.SMTPConfigurationTab)
                                }}
                                rootClassName="ses-config-table__action"
                                modal={ConfigurationsTabTypes.SMTP}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
