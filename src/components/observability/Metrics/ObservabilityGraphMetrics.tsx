import { useEffect, useState } from 'react'
import Tippy from '@tippyjs/react'
import moment, { Moment } from 'moment'

import { useTheme } from '@devtron-labs/devtron-fe-common-lib'

import {
    CalendarFocusInput,
    CalendarFocusInputType,
    ChartType,
} from '@Components/app/details/appDetails/appDetails.type'
import { APP_METRICS_CALENDAR_INPUT_DATE_FORMAT } from '@Components/app/details/appDetails/constants'
import { GraphModalProps } from '@Components/app/details/appDetails/GraphsModal'
import { AppInfo, getCalendarValue, getIframeSrc } from '@Components/app/details/appDetails/utils'
import { DatePickerType2 } from '@Components/common'

import { ReactComponent as Fullscreen } from '../../../assets/icons/ic-fullscreen-2.svg'

import '../styles.scss'

export const ObservabilityGraphMetrics = () => {
    const { appTheme } = useTheme()

    const [dateRange, setDateRange] = useState<{ startDate: Moment; endDate: Moment }>({
        startDate: moment().subtract(5, 'minute'),
        endDate: moment(),
    })
    const [calendarInputs, setCalendarInput] = useState<{ startDate: string; endDate: string }>({
        startDate: 'now-5m',
        endDate: 'now',
    })
    const [focusedInput, setFocusedInput] = useState(CalendarFocusInput.StartDate)
    const [calendarValue, setCalendarValue] = useState('')
    const [graphs, setGraphs] = useState({
        cpu: '',
        ram: '',
    })

    const getIframeSrcWrapper: GraphModalProps['getIframeSrcWrapper'] = (params) =>
        getIframeSrc({
            ...params,
            grafanaTheme: appTheme,
        })

    const appInfo: AppInfo = {
        appId: 740,
        envId: 36,
        dataSourceName: '',
        newPodHash: '',
        k8sVersion: '',
    }

    function getNewGraphs(): void {
        const cpu = getIframeSrcWrapper({
            appInfo,
            chartName: ChartType.Cpu,
            calendarInputs,
            tab: 'aggregate',
            isLegendRequired: true,
        })
        const ram = getIframeSrcWrapper({
            appInfo,
            chartName: ChartType.Ram,
            calendarInputs,
            tab: 'aggregate',
            isLegendRequired: true,
        })
        setGraphs({
            cpu,
            ram,
        })
    }

    useEffect(() => {
        getNewGraphs()
    }, [calendarValue, appTheme])

    const handlePredefinedRange = (start: Moment, end: Moment, startStr: string): void => {
        setDateRange({
            startDate: start,
            endDate: end,
        })
        setCalendarInput({
            startDate: startStr,
            endDate: 'now',
        })
        const str = getCalendarValue(startStr, 'now')
        setCalendarValue(str)
    }

    const handleDatesChange = ({ startDate, endDate }): void => {
        setDateRange({
            startDate,
            endDate,
        })
        setCalendarInput({
            startDate: startDate?.format(APP_METRICS_CALENDAR_INPUT_DATE_FORMAT),
            endDate: endDate?.format(APP_METRICS_CALENDAR_INPUT_DATE_FORMAT) || '',
        })
    }

    const handleDateInput = (key: CalendarFocusInputType, value: string): void => {
        setCalendarInput({
            ...calendarInputs,
            [key]: value,
        })
    }

    const handleFocusChange = (_focusedInput): void => {
        setFocusedInput(_focusedInput || CalendarFocusInput.StartDate)
    }

    const handleApply = (): void => {
        const str = getCalendarValue(calendarInputs.startDate, calendarInputs.endDate)
        setCalendarValue(str)
    }

    return (
        <div className="bg__primary border__secondary br-8 dc__content-space">
            <div className="flex dc__content-space py-12 px-16">
                <span className="fs-14 fw-6 lh-1-5 cn-9">Observability Metrics </span>
                <DatePickerType2
                    calendar={dateRange}
                    calendarInputs={calendarInputs}
                    focusedInput={focusedInput}
                    calendarValue={calendarValue}
                    handlePredefinedRange={handlePredefinedRange}
                    handleDatesChange={handleDatesChange}
                    handleFocusChange={handleFocusChange}
                    handleDateInput={handleDateInput}
                    handleApply={handleApply}
                />
            </div>

            <div className="chart-containers px-16">
                <div data-testid="app-metrics-memory-usage" className="app-metrics-graph chart">
                    <div className="app-metrics-graph__title flexbox flex-justify">
                        VMs Usage
                        <Tippy className="default-tt" arrow={false} placement="bottom" content="Fullscreen">
                            <div className="flex">
                                <Fullscreen
                                    className="icon-dim-16 cursor fcn-5"
                                    // onClick={openTempAppWindow(ChartType.Status)}
                                />
                            </div>
                        </Tippy>
                    </div>
                    <iframe title={ChartType.Ram} src={graphs.ram} className="app-metrics-graph__iframe" />
                </div>
                <div data-testid="app-metrics-cpu-usage" className="app-metrics-graph chart">
                    <div className="app-metrics-graph__title flexbox flex-justify">
                        CPU Usage
                        <Tippy className="default-tt" arrow={false} placement="bottom" content="Fullscreen">
                            <div className="flex">
                                <Fullscreen
                                    className="icon-dim-16 cursor fcn-5"
                                    // onClick={openTempAppWindow(ChartType.Cpu)}
                                />
                            </div>
                        </Tippy>
                    </div>
                    <iframe title={ChartType.Cpu} src={graphs.cpu} className="app-metrics-graph__iframe" />
                </div>
                <div data-testid="app-metrics-memory-usage" className="app-metrics-graph chart">
                    <div className="app-metrics-graph__title flexbox flex-justify">
                        Memory Usage
                        <Tippy className="default-tt" arrow={false} placement="bottom" content="Fullscreen">
                            <div className="flex">
                                <Fullscreen
                                    className="icon-dim-16 cursor fcn-5"
                                    // onClick={openTempAppWindow(ChartType.Status)}
                                />
                            </div>
                        </Tippy>
                    </div>
                    <iframe title={ChartType.Ram} src={graphs.ram} className="app-metrics-graph__iframe" />
                </div>
                <div data-testid="app-metrics-memory-usage" className="app-metrics-graph chart">
                    <div className="app-metrics-graph__title flexbox flex-justify">
                        Disk Usage
                        <Tippy className="default-tt" arrow={false} placement="bottom" content="Fullscreen">
                            <div className="flex">
                                <Fullscreen
                                    className="icon-dim-16 cursor fcn-5"
                                    // onClick={openTempAppWindow(ChartType.Status)}
                                />
                            </div>
                        </Tippy>
                    </div>
                    <iframe title={ChartType.Ram} src={graphs.ram} className="app-metrics-graph__iframe" />
                </div>
            </div>
        </div>
    )
}
