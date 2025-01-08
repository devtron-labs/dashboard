import { DeleteComponentsName } from '@Config/constantMessaging'
import { useSearchString } from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router-dom'
import { ConfigurationTableProps } from './types'
import { EmptyConfigurationView } from './EmptyConfigurationView'
import { ConfigurationsTabTypes } from './constants'
import { getConfigTabIcons, renderDefaultTag, renderText } from './notifications.util'
import './notifications.scss'
import emptySES from '../../assets/img/ses-empty.png'
import { ConfigTableRowActionButton } from './ConfigTableRowActionButton'

const SESConfigurationTable = ({ state, deleteClickHandler }: ConfigurationTableProps) => {
    const { searchParams } = useSearchString()
    const history = useHistory()

    const { sesConfigurationList } = state

    if (sesConfigurationList.length === 0) {
        return <EmptyConfigurationView configTabType={ConfigurationsTabTypes.SES} image={emptySES} />
    }

    const onClickSESConfigEdit = (id: number) => () => {
        const newParams = {
            ...searchParams,
            configId: id.toString(),
            modal: ConfigurationsTabTypes.SES,
        }
        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }

    return (
        <div className="ses-config-container flex-grow-1">
            <div className="ses-config-grid fs-12 fw-6 dc__uppercase cn-7 py-6 dc__gap-16 dc__border-bottom-n1 px-20 dc__position-sticky dc__top-0 bcn-0">
                <p className="icon-dim-24 m-0" />
                <p className="ses-config-item__name flex left m-0">Name</p>
                <p className="ses-config-item__access-key flex left m-0">Access Key Id</p>
                <p className="ses-config-item__email flex left m-0">Sender&apos;s Email</p>
                <p className="m-0" />
            </div>
            <div className="flex-grow-1">
                {sesConfigurationList.map((sesConfig) => (
                    <div
                        className="configuration-tab__table-row ses-config-grid fs-13 cn-9 dc__gap-16 py-6 px-20 dc__hover-n50"
                        key={sesConfig.id}
                    >
                        {getConfigTabIcons(ConfigurationsTabTypes.SES)}
                        <div className="ses-config-item__name flex left dc__gap-8">
                            {renderText(sesConfig.name, true, onClickSESConfigEdit(sesConfig.id))}
                            {renderDefaultTag(sesConfig.isDefault)}
                        </div>
                        {renderText(sesConfig.accessKeyId)}
                        {renderText(sesConfig.email)}
                        <ConfigTableRowActionButton
                            onClickEditRow={onClickSESConfigEdit(sesConfig.id)}
                            onClickDeleteRow={deleteClickHandler(
                                sesConfig.id,
                                DeleteComponentsName.SesConfigurationTab,
                            )}
                            rootClassName="ses-config-table__action"
                            modal={ConfigurationsTabTypes.SES}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SESConfigurationTable
