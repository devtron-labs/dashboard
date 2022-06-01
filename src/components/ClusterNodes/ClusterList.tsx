import React, { useState, useEffect } from 'react'
import './clusterNodes.scss'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { getChartList } from './clusterNodes.service'
import { Progressing, showError, sortObjectArrayAlphabetically } from '../common'
import { ChartDetailType, ChartListResponse } from './types'

export default function ClusterList() {
    const [loader, setLoader] = useState(false)
    const [searchApplied, setSearchApplied] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [clusterList, setClusterList] = useState([])

    useEffect(() => {
        setLoader(true)
        getChartList()
            .then((response: ChartListResponse) => {
                if (response.result) {
                    setClusterList(processChartData(response.result))
                }
                setLoader(false)
            })
            .catch((error) => {
                showError(error)
                setLoader(false)
            })
    }, [])

    const processChartData = (data: ChartDetailType[]): ChartDetailType[] => {
        let resultData = []
        const uniqueChartList = new Map()
        data.forEach((element) => {
            const chartDetail = uniqueChartList.get(element.name)
            if (chartDetail) {
                chartDetail.count++
                if (chartDetail.version < element.version) {
                    chartDetail.version = element.version
                    chartDetail.chartDescription = element.chartDescription
                }
            } else {
                uniqueChartList.set(element.name, { ...element, count: 0 })
            }
        })
        uniqueChartList.forEach((element) => {
            resultData.push(element)
        })
        resultData = sortObjectArrayAlphabetically(resultData, 'name')
        return resultData
    }

    const handleFilterChanges = (selected, key): void => {}

    const renderSearch = (): JSX.Element => {
        return (
            <form
                onSubmit={(e) => handleFilterChanges(e, 'search')}
                className="search position-rel margin-right-0 en-2 bw-1 br-4"
            >
                <Search className="search__icon icon-dim-18" />
                <input
                    type="text"
                    placeholder="Search charts"
                    value={searchText}
                    className="search__input bcn-0"
                    onChange={(event) => {
                        setSearchText(event.target.value)
                    }}
                />
                {searchApplied ? (
                    <button
                        className="search__clear-button"
                        type="button"
                        onClick={(e) => handleFilterChanges(e, 'clear')}
                    >
                        <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                    </button>
                ) : null}
            </form>
        )
    }

    if (loader) {
        return <Progressing />
    }

    return (
        <div className="cluster-list">
            {renderSearch()}
            <div className="mt-16 en-2 bw-1 bcn-0" style={{ minHeight: 'calc(100vh - 125px)' }}>
                <div className="cluster-list-row fw-6 cn-7 fs-12 border-bottom pt-10 pb-10 pr-20 pl-20 text-uppercase">
                    <div>Cluster</div>
                    <div>Status</div>
                    <div>Errors</div>
                    <div>Nodes</div>
                    <div>K8s version</div>
                    <div>CPU Capacity</div>
                    <div>Memory Capacity</div>
                </div>
                {/* {clusterList?.map((chartData) => (
                    <div className="chart-list-row fw-4 cn-9 fs-13 border-bottom-n1 pt-14 pb-14 pr-20 pl-20">
                        <div className="flexbox">
                            <span className="cn-9">{chartData.name}</span>
                        </div>
                        <div>
                            {chartData.version}
                            <span className="cn-5 ml-8">{chartData.count > 0 ? `+${chartData.count} more` : ''}</span>
                        </div>
                        <div className="ellipsis-right">{chartData.chartDescription}</div>
                    </div>
                ))} */}
            </div>
        </div>
    )
}
