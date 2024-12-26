import { Trash } from '@Components/common'
import { DeleteComponentsName } from '@Config/constantMessaging'
import { ViewType } from '@Config/constants'
import { Progressing, GenericEmptyState, EMPTY_STATE_STATUS } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { ReactComponent as Edit } from '@Icons/ic-edit.svg'
import { ConfigurationTableProps } from './types'

export const SESConfigurationTable = ({ setState, state, deleteClickHandler }: ConfigurationTableProps) => {
    const { view, sesConfigurationList } = state
    if (view === ViewType.LOADING) {
        return (
            <div className="flex progressing-loader-height">
                <Progressing pageLoader />
            </div>
        )
    }
    if (sesConfigurationList.length === 0) {
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
                    <th className="ses-config-table__name dc__truncate-text ">Name</th>
                    <th className="ses-config-table__access-key dc__truncate-text ">Access key Id</th>
                    <th className="ses-config-table__email dc__truncate-text ">Sender&apos; Email</th>
                    <th className="ses-config-table__action" aria-label="Actions" />
                </tr>
            </thead>
            <tbody>
                <tr className="mb-8">
                    {sesConfigurationList.map((sesConfig) => (
                        <td
                            data-testid={`ses-container-${sesConfig.name}`}
                            key={sesConfig.id}
                            className="configuration-tab__table-row"
                        >
                            <div
                                data-testid={`ses-config-name-${sesConfig.name}`}
                                className="ses-config-table__name dc__truncate-text "
                            >
                                {sesConfig.name}
                                {sesConfig.isDefault ? (
                                    <span className="dc__ses_config-table__tag">Default</span>
                                ) : null}
                            </div>
                            <div
                                data-testid={`ses-access-key-${sesConfig.accessKeyId}`}
                                className="ses-config-table__access-key dc__truncate-text "
                            >
                                {sesConfig.accessKeyId}
                            </div>
                            <div className="ses-config-table__email dc__truncate-text ">{sesConfig.email}</div>
                            <div className="ses-config-table__action">
                                <Tippy className="default-tt" arrow={false} placement="top" content="Edit">
                                    <button
                                        type="button"
                                        aria-label="Edit"
                                        className="dc__transparent dc__align-right mr-16"
                                        onClick={() => {
                                            setState({
                                                ...state,
                                                showSESConfigModal: true,
                                                sesConfigId: sesConfig.id,
                                            })
                                        }}
                                        data-testid="ses-config-edit-button"
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
                                            deleteClickHandler(sesConfig.id, DeleteComponentsName.SesConfigurationTab)
                                        }}
                                        data-testid="ses-config-delete-button"
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
