import React, { useContext } from 'react';
import Tippy from '@tippyjs/react';
import { Chart } from '../charts.types';
import placeHolder from '../../../assets/icons/ic-plc-chart.svg';
import { LazyImage, noop, ConditionalWrap } from '../../common';
import { ReactComponent as Minus } from '../../../assets/icons/ic-minus.svg';
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg';
import { SERVER_MODE } from '../../../config';
import { DeprecatedWarn } from "../../common/DeprecatedUpdateWarn";
import { mainContext } from '../../common/navigation/NavigationRoutes';

interface AllChartSelectProps {
    chart: Chart;
    selectedCount?: number;
    showCheckBoxOnHoverOnly: boolean;
    onClick?: (chartId: number) => void;
    addChart?: (chartId: number) => void;
    subtractChart?: (chartId: number) => void;
    selectChart?: (chartId: number) => void;
}

interface Stepper extends AllChartSelectProps {
    addChart: (chartId: number) => void;
    subtractChart: (chartId: number) => void;
    selectChart?: never;
}

interface Checkbox extends AllChartSelectProps {
    addChart?: never;
    subtractChart?: never;
    selectChart: (chartId: number) => void;
}

export type ChartSelectProps = Stepper | Checkbox

const ChartSelect: React.FC<ChartSelectProps> = ({ chart, selectChart, addChart, subtractChart, selectedCount = 0, showCheckBoxOnHoverOnly, onClick }) => {
    const { serverMode } = useContext(mainContext);

    function handleImageError(e) {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = placeHolder;
    }

    let classes = `chart-grid-item chart-grid-item--discover white-card position-rel`;

    return (
        <div key={chart.id} className={`${classes} ${showCheckBoxOnHoverOnly ? 'show-checkbox-onhover' : ''} ${selectedCount > 0 ? 'chart-grid-item--selected' : ''}`} onClick={onClick ? e => onClick(chart.id) : noop}>
            <div className="chart-grid-item__icon-wrapper">
                <LazyImage className="chart-grid-item__icon" src={chart.icon} onError={handleImageError} />
            </div>
            {serverMode == SERVER_MODE.FULL && addChart && subtractChart
                ? <div className={`chart-grid__check ${showCheckBoxOnHoverOnly ? 'chart-grid__check--hidden' : ''} devtron-stepper`}>
                    <ConditionalWrap condition={selectedCount > 0}
                        wrap={children => <Tippy className="default-tt" arrow={false} placement="top" content={"Remove charts from selection"}>
                            {children}
                        </Tippy>} >
                        <button className={"devtron-stepper__item transparent p-0 cursor"}
                            disabled={selectedCount <= 0}
                            onClick={e => { e.stopPropagation(); subtractChart(chart.id) }} >
                            <Minus className="icon-dim-14" />
                        </button>
                    </ConditionalWrap>
                    <div className="devtron-stepper__item" ><span>{selectedCount}</span></div>
                    <ConditionalWrap condition={true}
                        wrap={children => <Tippy className="default-tt" arrow={false} placement="top" content={"Add charts to deploy"}>
                            {children}
                        </Tippy>} >
                        <button className={"devtron-stepper__item transparent p-0 cursor"} onClick={e => { e.stopPropagation(); addChart(chart.id) }} >
                            <Add className="icon-dim-14" />
                        </button>
                    </ConditionalWrap>
                </div>
                : <input onClick={e => { e.stopPropagation(); selectChart(chart.id) }} type="checkbox" checked={selectedCount > 0} className={`chart-grid__check ${showCheckBoxOnHoverOnly ? 'chart-grid__check--hidden' : ''} icon-dim-24`} />
            }
            <div className="chart-grid-item__title ellipsis-right">
                <span className="chart-grid-item__title-repo">{chart.chart_name}</span>
                <span>/{chart.name}</span>
            </div>
            <div className="flex left">
                <div className="chart-grid-item__chart-version mr-12">{chart.version}</div>
                {
                    chart.deprecated && 
                        <DeprecatedWarn/>
                }
            </div>
        </div>
    )
}


export default React.memo(ChartSelect)