import React, { useState } from 'react'
import { components } from 'react-select'
import AsyncSelect from 'react-select/async'
import { getChartsByKeyword } from '../../../charts/charts.service'
import { ChartRepoDetailsType, ChartRepoOptions, ChartRepoSelectorType } from './ChartValuesView.type'
import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as Refetch } from '../../../../assets/icons/ic-restore.svg'
import { ReactComponent as Info } from '../../../../assets/icons/ic-info-filled-prple.svg'
import { NavLink } from 'react-router-dom'
import { URLS } from '../../../../config'
import Tippy from '@tippyjs/react'
import { getCommonSelectStyle, noMatchingOptions } from '../../common/ReactSelect.utils'
import { CHART_DEPCRECATED_TEXTS, CONNECT_CHART_REPO_TEXTS } from './ChartValuesView.constants'

export function ChartRepoSelector({
    isExternal,
    installedAppInfo,
    isUpdate,
    repoChartValue,
    handleRepoChartValueChange,
    chartDetails,
    showConnectToChartTippy,
    hideConnectToChartTippy,
}: ChartRepoSelectorType) {
    const [repoChartAPIMade, setRepoChartAPIMade] = useState(false)
    const [repoChartOptions, setRepoChartOptions] = useState<ChartRepoOptions[] | null>(
        isExternal && !installedAppInfo ? [] : [chartDetails],
    )
    const [refetchingCharts, setRefetchingCharts] = useState(false)

    async function handleRepoChartFocus(refetch: boolean) {
        if (!repoChartAPIMade || refetch) {
            try {
                const { result } = await getChartsByKeyword(chartDetails.chartName)
                filterMatchedCharts(result)
            } catch (e) {
                filterMatchedCharts([])
            } finally {
                setRepoChartAPIMade(true)
                setRefetchingCharts(false)
            }
        }
    }

    function refetchCharts() {
        setRefetchingCharts(true)
        handleRepoChartFocus(true)
    }

    function filterMatchedCharts(matchedCharts) {
        if (repoChartOptions !== null) {
            const deprecatedCharts = []
            const nonDeprecatedCharts = []
            for (let i = 0; i < matchedCharts.length; i++) {
                if (matchedCharts[i].deprecated) {
                    deprecatedCharts.push(matchedCharts[i])
                } else {
                    nonDeprecatedCharts.push(matchedCharts[i])
                }
            }
            setRepoChartOptions(nonDeprecatedCharts.concat(deprecatedCharts))
            return nonDeprecatedCharts.concat(deprecatedCharts)
        }
        return []
    }

    async function repoChartLoadOptions(inputValue: string, callback) {
        try {
            const { result } = await getChartsByKeyword(inputValue)
            callback(filterMatchedCharts(result))
        } catch (err) {
            callback(filterMatchedCharts([]))
        }
    }

    function repoChartSelectOptionLabel({ chartRepoName, chartName, version }: ChartRepoDetailsType) {
        return <div>{!chartRepoName ? `${chartName} (${version})` : `${chartRepoName}/${chartName}`}</div>
    }

    function repoChartOptionLabel(props: any) {
        const { innerProps, innerRef } = props
        const isCurrentlySelected = props.data.chartId === repoChartValue.chartId
        return (
            <div
                ref={innerRef}
                {...innerProps}
                className="repochart-dropdown-wrap"
                style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    backgroundColor: isCurrentlySelected ? 'var(--B100)' : props.isFocused ? 'var(--N100)' : 'white',
                    color: isCurrentlySelected ? 'var(--B500)' : 'var(--N900)',
                }}
            >
                <div className="flex left">
                    <span>
                        {props.data.chartRepoName}/{props.data.chartName}
                    </span>
                </div>
                {props.data.deprecated && (
                    <div className="dropdown__deprecated-text">{CHART_DEPCRECATED_TEXTS.Label}</div>
                )}
            </div>
        )
    }

    function customMenuListItem(props: any): JSX.Element {
        return (
            <components.MenuList {...props}>
                {props.children}
                <div className="flex dc__react-select__bottom bcn-0">
                    <div className="sticky-information__bottom">
                        <div className="sticky-information__icon mt-2">
                            <Info className="icon-dim-16" />
                        </div>
                        <div className="sticky-information__note fs-13">
                            {CONNECT_CHART_REPO_TEXTS.InfoText}&nbsp;
                            <NavLink to={URLS.GLOBAL_CONFIG_CHART} target="_blank" className="fw-6">
                                {CONNECT_CHART_REPO_TEXTS.LinkText}
                            </NavLink>
                        </div>
                    </div>
                </div>
            </components.MenuList>
        )
    }

    const onFocus = (): void => {
        handleRepoChartFocus(false)
    }

    return (
        (isExternal || isUpdate) && (
            <div className="form__row form__row--w-100">
                <div className="flex dc__content-space">
                    <span className="form__label fs-13 fw-4 lh-20 cn-7" data-testid="helm-chart-heading">
                        Helm Chart
                    </span>
                    <Tippy
                        className="default-tt "
                        arrow={false}
                        content="Fetch latest charts from connected chart repositories"
                    >
                        <span
                            className={`refetch-charts cb-5 cursor dc__underline-onhover ${
                                refetchingCharts ? 'refetching' : ''
                            }`}
                            data-testid="refetching-button"
                            onClick={refetchCharts}
                        >
                            {refetchingCharts ? <Refetch className="icon-dim-20" /> : 'Refetch Charts'}
                        </span>
                    </Tippy>
                </div>
                <div className="repo-chart-selector flex">
                    <AsyncSelect
                        classNamePrefix="chart-name"
                        cacheOptions
                        defaultOptions={repoChartOptions}
                        isSearchable={window._env_.ENABLE_CHART_SEARCH_IN_HELM_DEPLOY}
                        formatOptionLabel={repoChartSelectOptionLabel}
                        value={isExternal && !installedAppInfo && !repoChartValue.chartRepoName ? null : repoChartValue}
                        loadOptions={repoChartLoadOptions}
                        onFocus={onFocus}
                        onChange={handleRepoChartValueChange}
                        noOptionsMessage={noMatchingOptions}
                        isLoading={!repoChartAPIMade || refetchingCharts}
                        isClearable={isExternal && !installedAppInfo}
                        components={{
                            LoadingIndicator: null,
                            Option: repoChartOptionLabel,
                            MenuList: customMenuListItem,
                            ...((!isExternal || installedAppInfo || !repoChartValue.chartRepoName) && {
                                IndicatorSeparator: null,
                            }),
                        }}
                        styles={getCommonSelectStyle({
                            clearIndicator: (base) => ({
                                ...base,
                                padding: '0px 8px',
                                color: 'var(--N400)',
                            }),
                        })}
                    />
                </div>
                {repoChartValue.deprecated && (
                    <div className="chart-deprecated-wrapper flex top left br-4 cn-9 bcy-1 mt-12">
                        <div className="icon-dim-16 mr-10">
                            <Error className="icon-dim-16 chart-deprecated-icon" />
                        </div>
                        <span className="chart-deprecated-text fs-12 fw-4">{CHART_DEPCRECATED_TEXTS.InfoText}</span>
                    </div>
                )}
            </div>
        )
    )
}
