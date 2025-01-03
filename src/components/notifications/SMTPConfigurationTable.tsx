import { Trash } from '@Components/common'
import { DeleteComponentsName } from '@Config/constantMessaging'
import { ViewType } from '@Config/constants'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { ReactComponent as Edit } from '@Icons/ic-edit.svg'
import { ConfigurationTableProps } from './types'
import { ConfigurationsTabTypes } from './constants'
import { EmptyConfigurationView } from './EmptyConfigurationView'

export const SMTPConfigurationTable = ({ setState, state, deleteClickHandler }: ConfigurationTableProps) => {
    const { smtpConfigurationList, view } = state
    if (view === ViewType.LOADING) {
        return (
            <div className="flex progressing-loader-height">
                <Progressing pageLoader />
            </div>
        )
    }
    if (smtpConfigurationList.length === 0) {
        return <EmptyConfigurationView configTabType={ConfigurationsTabTypes.SMTP} />
    }
    return (
        <table className="w-100">
            <thead>
                <tr className="configuration-tab__table-header">
                    <th className="ses-config-table__name dc__truncate-text ">Name</th>
                    <th className="smtp-config-table__host dc__truncate-text ">Host</th>
                    <th className="smtp-config-table__port dc__truncate-text ">Port</th>
                    <th className="smtp-config-table__email dc__truncate-text ">Sender&apos; Email</th>
                    <th className="ses-config-table__action" aria-label="Action" />
                </tr>
            </thead>
            <tbody>
                <tr className="mb-8">
                    {smtpConfigurationList.map((smtpConfig) => (
                        <td
                            data-testid={`smtp-container-${smtpConfig.name}`}
                            key={smtpConfig.id}
                            className="configuration-tab__table-row"
                        >
                            <div
                                data-testid={`smtp-config-name-${smtpConfig.name}`}
                                className="ses-config-table__name dc__truncate-text "
                            >
                                {smtpConfig.name}
                                {smtpConfig.isDefault ? (
                                    <span className="dc__ses_config-table__tag">Default</span>
                                ) : null}
                            </div>
                            <div
                                data-testid={`smtp-config-host-${smtpConfig.host}`}
                                className="smtp-config-table__host dc__truncate-text "
                            >
                                {smtpConfig.host}
                            </div>
                            <div className="smtp-config-table__port dc__truncate-text ">{smtpConfig.port}</div>
                            <div className="smtp-config-table__email dc__truncate-text ">{smtpConfig.email}</div>
                            <div className="ses-config-table__action">
                                <Tippy className="default-tt" arrow={false} placement="top" content="Edit">
                                    <button
                                        type="button"
                                        aria-label="Edit"
                                        className="dc__transparent dc__align-right mr-16"
                                        onClick={() => {
                                            setState({
                                                ...state,
                                                showSMTPConfigModal: true,
                                                smtpConfigId: smtpConfig.id,
                                            })
                                        }}
                                        data-testid="smtp-config-edit-button"
                                    >
                                        <Edit className="icon-dim-20" />
                                    </button>
                                </Tippy>
                                <Tippy className="default-tt" arrow={false} placement="top" content="Delete">
                                    <button
                                        type="button"
                                        aria-label="Delete"
                                        className="dc__transparent dc__align-right"
                                        onClick={() => {
                                            // eslint-disable-next-line @typescript-eslint/no-floating-promises
                                            deleteClickHandler(smtpConfig.id, DeleteComponentsName.SMTPConfigurationTab)
                                        }}
                                        data-testid="smtp-config-delete-button"
                                    >
                                        <Trash className="scn-5 icon-dim-20" />
                                    </button>
                                </Tippy>
                            </div>
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    )
}
