/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DeleteComponentsName } from '@Config/constantMessaging'
import { useSearchString } from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router-dom'
import { ConfigurationTableProps } from './types'
import { ConfigurationsTabTypes } from './constants'
import { getConfigTabIcons, renderDefaultTag, renderText } from './notifications.util'
import './notifications.scss'
import { ConfigTableRowActionButton } from './ConfigTableRowActionButton'

const SESConfigurationTable = ({ state, deleteClickHandler }: ConfigurationTableProps) => {
    const { searchParams } = useSearchString()
    const history = useHistory()

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
            <div className="ses-config-grid fs-12 fw-6 dc__uppercase cn-7 py-6 dc__gap-16 dc__border-bottom-n1 px-20 dc__position-sticky dc__top-0 bg__primary">
                <p className="icon-dim-24 m-0" />
                <p className="flex left m-0">Name</p>
                <p className="flex left m-0">Access Key Id</p>
                <p className="flex left m-0">Sender&apos;s Email</p>
                <p className="m-0" />
            </div>
            <div className="flex-grow-1">
                {state.sesConfigurationList.map((sesConfig) => (
                    <div
                        className="configuration-tab__table-row ses-config-grid fs-13 cn-9 dc__gap-16 py-6 px-20 dc__hover-n50 dc__visible-hover dc__visible-hover--parent"
                        key={sesConfig.id}
                    >
                        {getConfigTabIcons(ConfigurationsTabTypes.SES)}
                        <div className=" flex left dc__gap-8">
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
                            modal={ConfigurationsTabTypes.SES}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SESConfigurationTable
