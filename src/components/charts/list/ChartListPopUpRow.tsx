import React, { useEffect, useState } from 'react'
import { List } from '../../globalConfigurations/GlobalConfiguration'
import Tippy from '@tippyjs/react'
import { Progressing, showError } from '@devtron-labs/devtron-fe-common-lib'
import { updateChartProviderList, updateSyncSpecificChart } from '../charts.service'
import { ReactComponent as SyncIcon } from '../../../assets/icons/ic-arrows_clockwise.svg'
import { ReactComponent as Helm } from '../../../assets/icons/ic-helmchart.svg'
import { ChartListType } from '../charts.types'
import { toast } from 'react-toastify'
import { getNonEditableChartRepoText } from '../../common'
import { TOAST_INFO } from '../../../config/constantMessaging'

function ChartListPopUpRow({ index, list }: { index: number; list: ChartListType; }) {
    const [isSpecificChartRefetchLoading, setSpecificChartRefetchLoading] = useState(false)
    const [isToggleLoading, setToggleLoading] = useState(false)
    const [enabled, toggleEnabled] = useState<boolean>(list.active)

    function refetchSpecificChart(id: number, isOCIRegistry: boolean) {
        let payload = {
            id: id,
            isOCIRegistry: isOCIRegistry,
        }
        setSpecificChartRefetchLoading(true)

        try {
            updateSyncSpecificChart(payload).then((response) => {
                setSpecificChartRefetchLoading(false)
                toast.success(TOAST_INFO.RE_SYNC)
            })
        } catch (error) {
            showError(error)
            setSpecificChartRefetchLoading(false)
        }
    }

    const onSelectToggle = async () => {
        if (list.isEditable) {
            const _toggleEnabled = !enabled
            let payload = {
                id: list.id, //eg: OCI registry: “test-registry” ; for chart repo: “1”
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
        }else{
            toast.info(
                getNonEditableChartRepoText(list.name),
            )
        }
    }

    return (
        <div className="chart-list__row">
            <List key={`chart-row-${index}`}>
                <List.Logo>
                    {list.isOCIRegistry ? (
                        <div className={'dc__registry-icon ' + list.registryProvider}></div>
                    ) : (
                        <Helm className="icon-dim-20 fcb-5 dc__vertical-align-middle " />
                    )}
                </List.Logo>
                <div>{list.name}</div>
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
                    content={enabled ? 'Disable chart repository' : 'Enable chart repository'}
                >
                    <span
                        data-testid={`${'name'}-chart-repo-toggle-button`}
                        style={{ marginLeft: 'auto' }}
                        className={`${list.isEditable ? 'cursor-not-allowed' : ''}`}
                    >
                        {isToggleLoading ? (
                            <Progressing size={16} />
                        ) : (
                            <List.Toggle onSelect={onSelectToggle} enabled={enabled} />
                        )}
                    </span>
                </Tippy>
            </List>
        </div>
    )
}

export default ChartListPopUpRow
