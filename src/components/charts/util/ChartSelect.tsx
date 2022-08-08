import React, { useContext } from 'react'
import Tippy from '@tippyjs/react'
import { Chart } from '../charts.types'
import placeHolder from '../../../assets/icons/ic-plc-chart.svg'
import { LazyImage, noop, ConditionalWrap } from '../../common'
import { ReactComponent as Minus } from '../../../assets/icons/ic-minus.svg'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { SERVER_MODE } from '../../../config'
import { DeprecatedWarn } from '../../common/DeprecatedUpdateWarn'
import { mainContext } from '../../common/navigation/NavigationRoutes'

interface AllChartSelectProps {
    chart: Chart
    selectedCount?: number
    showCheckBoxOnHoverOnly: boolean
    onClick?: (chartId: number) => void
    addChart?: (chartId: number) => void
    subtractChart?: (chartId: number) => void
    selectChart?: (chartId: number) => void
    showDescription?: boolean
}

interface Stepper extends AllChartSelectProps {
    addChart: (chartId: number) => void
    subtractChart: (chartId: number) => void
    selectChart?: never
}

interface Checkbox extends AllChartSelectProps {
    addChart?: never
    subtractChart?: never
    selectChart: (chartId: number) => void
}

export type ChartSelectProps = Stepper | Checkbox

const ChartSelect: React.FC<ChartSelectProps> = ({
    chart,
    selectChart,
    addChart,
    subtractChart,
    selectedCount = 0,
    showCheckBoxOnHoverOnly,
    onClick,
    showDescription,
}) => {
    const { serverMode } = useContext(mainContext)

    function handleImageError(e): void {
        const target = e.target as HTMLImageElement
        target.onerror = null
        target.src = placeHolder
    }

    let classes = `chart-grid-item ${showDescription ? '' : 'chart-grid-item--discover'} white-card position-rel`

    const addchartTab = (e): void => {
        e.stopPropagation()
        addChart(chart.id)
    }

    const removeChartTab = (e): void => {
        e.stopPropagation()
        subtractChart(chart.id)
    }

    const selectChartTab = (e): void => {
        e.stopPropagation()
        selectChart(chart.id)
    }

    const onClickChartSelect = (): void => {
        onClick(chart.id)
    }

    return (
        <div
            key={chart.id}
            className={`${showDescription ? 'flex-list' : ''} ${classes} ${
                showCheckBoxOnHoverOnly ? 'show-checkbox-onhover' : ''
            } ${selectedCount > 0 ? 'chart-grid-item--selected' : ''}`}
            onClick={onClick ? onClickChartSelect : noop}
        >
            <div className={`${showDescription ? 'chart-list-item__icon-wrapper' : 'chart-grid-item__icon-wrapper'}`}>
                <LazyImage
                    className={`${showDescription ? 'list-icon' : ''} chart-grid-item__icon`}
                    src={chart.icon}
                    onError={handleImageError}
                />
            </div>
            {serverMode == SERVER_MODE.FULL && addChart && subtractChart ? (
                <div
                    className={`chart-grid__check ${
                        showCheckBoxOnHoverOnly ? 'chart-grid__check--hidden' : ''
                    } devtron-stepper`}
                >
                    <ConditionalWrap
                        condition={selectedCount > 0}
                        wrap={(children) => (
                            <Tippy
                                className="default-tt"
                                arrow={false}
                                placement="top"
                                content={'Remove charts from selection'}
                            >
                                {children}
                            </Tippy>
                        )}
                    >
                        <button
                            className={'devtron-stepper__item transparent p-0 cursor'}
                            disabled={selectedCount <= 0}
                            onClick={removeChartTab}
                        >
                            <Minus className="icon-dim-14" />
                        </button>
                    </ConditionalWrap>
                    <div className="devtron-stepper__item">
                        <span>{selectedCount}</span>
                    </div>
                    <ConditionalWrap
                        condition={true}
                        wrap={(children) => (
                            <Tippy
                                className="default-tt"
                                arrow={false}
                                placement="top"
                                content={'Add charts to deploy'}
                            >
                                {children}
                            </Tippy>
                        )}
                    >
                        <button className={'devtron-stepper__item transparent p-0 cursor'} onClick={addchartTab}>
                            <Add className="icon-dim-14" />
                        </button>
                    </ConditionalWrap>
                </div>
            ) : (
                <input
                    onClick={selectChartTab}
                    type="checkbox"
                    checked={selectedCount > 0}
                    className={`chart-grid__check ${
                        showCheckBoxOnHoverOnly ? 'chart-grid__check--hidden' : ''
                    } icon-dim-24`}
                />
            )}
            <div>
                <div className="chart-grid-item__title ellipsis-right mb-4">
                    <span className="chart-grid-item__title-repo">{chart.chart_name}</span>
                    <span>/{chart.name}</span>
                </div>
                <div className="flex left">
                    <div className="chart-grid-item__chart-version mr-12">{chart.version}</div>
                    {chart.deprecated && <DeprecatedWarn />}
                </div>
                {showDescription && <div className="flex left fw-4 fs-13 lh-20 mt-8">{chart.description}</div>}
            </div>
        </div>
    )
}

export default React.memo(ChartSelect)
