import { Trash } from '@Components/common'
import { DeleteComponentsName } from '@Config/constantMessaging'
import { ViewType } from '@Config/constants'
import { Progressing, GenericEmptyState, EMPTY_STATE_STATUS } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { ReactComponent as Edit } from '@Icons/ic-edit.svg'
import { ConfigurationTableProps } from './types'

export const SlackConfigurationTable = ({ setState, state, deleteClickHandler }: ConfigurationTableProps) => {
    const { slackConfigurationList, view } = state
    if (view === ViewType.LOADING) {
        return (
            <div className="flex progressing-loader-height">
                <Progressing pageLoader />
            </div>
        )
    }
    if (slackConfigurationList.length === 0) {
        return (
            <div className="empty-state-height">
                <GenericEmptyState title={EMPTY_STATE_STATUS.CONFIGURATION_TAB.TITLE} noImage />
            </div>
        )
    }
    return (
        <table className="w-100">
            <thead>
                <tr className="configuration-tab__table-header">
                    <td className="slack-config-table__name dc__truncate-text ">Name</td>
                    <td className="slack-config-table__webhook dc__truncate-text ">Webhook URL</td>
                    <td className="slack-config-table__action" />
                </tr>
            </thead>
            <tbody>
                <tr className="mb-8">
                    {slackConfigurationList.map((slackConfig) => (
                        <td key={slackConfig.id} className="configuration-tab__table-row">
                            <div className="slack-config-table__name dc__truncate-text ">
                                {slackConfig.slackChannel}
                            </div>
                            <div className="slack-config-table__webhook dc__truncate-text ">
                                {slackConfig.webhookUrl}
                            </div>
                            <div className="slack-config-table__action">
                                <Tippy className="default-tt" arrow={false} placement="top" content="Edit">
                                    <button
                                        type="button"
                                        aria-label="Edit"
                                        className="dc__transparent dc__align-right mr-16"
                                        onClick={() => {
                                            setState({
                                                ...state,
                                                showSlackConfigModal: true,
                                                slackConfigId: slackConfig.id,
                                            })
                                        }}
                                        data-testid="slack-configure-edit-button"
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
                                            deleteClickHandler(
                                                slackConfig.id,
                                                DeleteComponentsName.SlackConfigurationTab,
                                            )
                                        }}
                                        data-testid="slack-configure-delete-button"
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
