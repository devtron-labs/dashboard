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

import { useState } from 'react'
import Tippy from '@tippyjs/react'
import {
    Progressing,
    RegistryIcon,
    RegistryType,
    showError,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { List } from '../../globalConfigurations/GlobalConfiguration'
import { updateChartProviderList, updateSyncSpecificChart } from '../charts.service'
import { ReactComponent as SyncIcon } from '../../../assets/icons/ic-arrows_clockwise.svg'
import { ReactComponent as Helm } from '../../../assets/icons/ic-helmchart.svg'
import { ChartListType } from '../charts.types'
import { getNonEditableChartRepoText } from '../../common'
import { TOAST_INFO } from '../../../config/constantMessaging'

const ChartListPopUpRow = ({
    index,
    list,
    enabled,
    toggleEnabled,
}: {
    index: number
    list: ChartListType
    enabled: boolean
    toggleEnabled: (enable: boolean) => void
}) => {
    const [isSpecificChartRefetchLoading, setSpecificChartRefetchLoading] = useState(false)
    const [isToggleLoading, setToggleLoading] = useState(false)

    function refetchSpecificChart(id: number, isOCIRegistry: boolean) {
        const payload = {
            id,
            isOCIRegistry,
        }
        setSpecificChartRefetchLoading(true)

        try {
            updateSyncSpecificChart(payload).then((response) => {
                setSpecificChartRefetchLoading(false)
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: TOAST_INFO.RE_SYNC,
                })
            })
        } catch (error) {
            showError(error)
            setSpecificChartRefetchLoading(false)
        }
    }

    const onSelectToggle = async () => {
        if (list.isEditable) {
            const _toggleEnabled = !enabled
            const payload = {
                id: list.id, // eg: OCI registry: “test-registry” ; for chart repo: “1”
                isOCIRegistry: list.isOCIRegistry, // for chart-repo: false
                active: _toggleEnabled,
            }
            setToggleLoading(true)

            await updateChartProviderList(payload)
                .then((response) => {
                    toggleEnabled(_toggleEnabled)
                    setToggleLoading(false)
                })
                .catch((error) => {
                    setToggleLoading(false)
                    showError(error)
                })
        } else {
            ToastManager.showToast({
                variant: ToastVariantType.info,
                description: getNonEditableChartRepoText(list.name),
            })
        }
    }

    return (
        <div className="chart-list__row">
            <List key={`chart-row-${index}`}>
                <List.Logo>
                    {list.isOCIRegistry ? (
                        <RegistryIcon registryType={list.registryProvider as RegistryType} />
                    ) : (
                        <Helm className="icon-dim-20 fcb-5 dc__vertical-align-middle " />
                    )}
                </List.Logo>
                <div className="dc__truncate-text">{list.name}</div>
                <Tippy className="default-tt" arrow={false} placement="top" content="Refetch charts">
                    <a
                        rel="noreferrer noopener"
                        target="_blank"
                        className={`dc__link ${!isSpecificChartRefetchLoading ? 'cursor' : ''} ${
                            !enabled ? 'cursor-not-allowed' : ''
                        }`}
                        onClick={() => enabled && refetchSpecificChart(list.id, list.isOCIRegistry)}
                    >
                        {isSpecificChartRefetchLoading ? (
                            <Progressing size={16} fillColor="var(--N500)" />
                        ) : (
                            <span>
                                <SyncIcon className={`${enabled ? 'scn-5' : 'scn-2'}`} />
                            </span>
                        )}
                    </a>
                </Tippy>

                <Tippy
                    className="default-tt"
                    arrow={false}
                    placement="bottom"
                    content={
                        enabled
                            ? `${list.isEditable ? 'Disable' : "Can't disable"} chart repository`
                            : 'Enable chart repository'
                    }
                >
                    <span
                        data-testid={`${'name'}-chart-repo-toggle-button`}
                        style={{ marginLeft: 'auto' }}
                        className={`${list.isEditable ? 'cursor-not-allowed' : ''}`}
                    >
                        {isToggleLoading ? (
                            <Progressing size={16} />
                        ) : (
                            <List.Toggle
                                isButtonDisabled={!list.isEditable}
                                onSelect={onSelectToggle}
                                enabled={enabled}
                            />
                        )}
                    </span>
                </Tippy>
            </List>
        </div>
    )
}

export default ChartListPopUpRow
