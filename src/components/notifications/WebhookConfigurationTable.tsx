import { Trash } from '@Components/common'
import { DeleteComponentsName } from '@Config/constantMessaging'
import { ViewType } from '@Config/constants'
import { Progressing, GenericEmptyState, EMPTY_STATE_STATUS } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { ReactComponent as Edit } from '@Icons/ic-edit.svg'
import { ConfigurationTableProps } from './types'

export const WebhookConfigurationTable = ({ setState, state, deleteClickHandler }: ConfigurationTableProps) => {
    const { view, webhookConfigurationList } = state
    if (view === ViewType.LOADING) {
        return (
            <div className="flex progressing-loader-height">
                <Progressing pageLoader />
            </div>
        )
    }
    if (webhookConfigurationList.length === 0) {
        return (
            <div className="empty-state-height">
                <GenericEmptyState title={EMPTY_STATE_STATUS.CONFIGURATION_TAB.TITLE} noImage />
            </div>
        )
    }

    const editWebhookHandler = (e) => {
        setState({ ...state, showWebhookConfigModal: true, webhookConfigId: e.currentTarget.dataset.webhookid })
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
                    {webhookConfigurationList.map((webhookConfig) => (
                        <td
                            key={webhookConfig.id}
                            className="configuration-tab__table-row"
                            data-testid={`webhook-container-${webhookConfig.name}`}
                        >
                            <div
                                className="slack-config-table__name dc__truncate-text"
                                data-testid={`webhook-config-name-${webhookConfig.name}`}
                            >
                                {webhookConfig.name}
                            </div>
                            <div
                                className="slack-config-table__webhook dc__truncate-text"
                                data-testid={`webhook-url-${webhookConfig.webhookUrl}`}
                            >
                                {webhookConfig.webhookUrl}
                            </div>
                            <div className="slack-config-table__action">
                                <Tippy className="default-tt" arrow={false} placement="top" content="Edit">
                                    <button
                                        type="button"
                                        aria-label="Edit"
                                        className="dc__transparent dc__align-right mr-16"
                                        data-webhookid={webhookConfig.id}
                                        onClick={editWebhookHandler}
                                        data-testid={`webhook-configure-edit-button-${webhookConfig.name}`}
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
                                                webhookConfig.id,
                                                DeleteComponentsName.WebhookConfigurationTab,
                                            )
                                        }}
                                        data-testid={`webhook-configure-delete-button-${webhookConfig.name}`}
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
