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

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    BreadCrumb,
    useBreadcrumb,
    PageHeader,
} from '@devtron-labs/devtron-fe-common-lib'
import { getChartValuesCategorizedListParsed, getChartVersionDetails, getChartVersionsMin } from '../charts.service'
import ChartValuesView from '../../v2/values/chartValuesDiff/ChartValuesView'
import { ChartInstalledConfig, ChartKind } from '../../v2/values/chartValuesDiff/ChartValuesView.type'

export default function ChartValues() {
    const { chartId, chartValueId } = useParams<{ chartId: string; chartValueId: string }>()
    const [loader, setLoader] = useState(true)
    const [errorStatusCode, setErrorStatusCode] = useState(0)
    const [appStoreApplicationName, setAppStoreApplicationName] = useState('')
    const [valueName, setValueName] = useState('')
    const [chartVersionId, setChartVersionId] = useState(0)
    const [chartInformation, setChartInformation] = useState({
        appStoreApplicationName: '',
        deprecated: false,
        chartName: '',
        name: '',
    })
    const [chartValuesList, setChartValuesList] = useState([])
    const [availableVersions, setChartVersions] = React.useState([])
    const [chartValues, setChartValues] = useState({
        id: 0,
        kind: null,
        name: '',
        chartVersion: '',
        environmentName: '',
    })

    useEffect(() => {
        getChartDetails()
    }, [])

    async function getChartDetails() {
        try {
            const { result: chartVersionMinResult } = await getChartVersionsMin(chartId)
            setChartVersions(chartVersionMinResult)

            const { result: chartVersionDetail } = await getChartVersionDetails(chartVersionMinResult[0].id)
            setChartInformation(chartVersionDetail)
            setAppStoreApplicationName(chartVersionDetail.appStoreApplicationName)
            const { result } = await getChartValuesCategorizedListParsed(chartId)
            setChartValuesList(result)
        } catch (error) {
            showError(error)
            setErrorStatusCode(error['code'])
        } finally {
            setLoader(false)
        }
    }

    useEffect(() => {
        let id
        let kind
        if (chartValueId !== '0') {
            id = parseInt(chartValueId)
            kind = ChartKind.TEMPLATE
        } else {
            id = availableVersions[0]?.id
            kind = ChartKind.DEFAULT
        }
        if (id) {
            const chartValues = chartValuesList.find((chrtValue) => {
                if (chrtValue.kind === kind && chrtValue.id === id) {
                    return chrtValue
                }
            })
            if (chartValues) {
                setChartValues(chartValues)
                if (chartValueId !== '0') {
                    setValueName(chartValues.name)
                }
                if (availableVersions?.length) {
                    const selectedChartVersionObj = availableVersions.find(
                        (availableVersion) => availableVersion.version === chartValues.chartVersion,
                    )
                    setChartVersionId(+selectedChartVersionObj.id)
                }
            }
        }
    }, [availableVersions, chartValuesList])

    if (loader) {
        return <Progressing pageLoader />
    }
    if (errorStatusCode > 0) {
        return (
            <div className="error-screen-wrapper flex column h-100">
                <ErrorScreenManager code={errorStatusCode} />
            </div>
        )
    }
    return (
        <div className="flexbox-col h-100">
            <Header appStoreApplicationName={appStoreApplicationName} name={valueName} />
            <ChartValuesView
                isCreateValueView
                installedConfigFromParent={chartInformation as ChartInstalledConfig}
                chartValuesListFromParent={chartValuesList}
                chartVersionsDataFromParent={availableVersions}
                chartValuesFromParent={chartValues}
                selectedVersionFromParent={chartVersionId}
            />
        </div>
    )
}

const Header = ({ appStoreApplicationName, name }) => {
    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ':chartId': appStoreApplicationName || null,
                chart: null,
                ':chartValueId': { component: name || 'New value', linked: false },
                'chart-store': null,
                'preset-values': 'Preset values',
            },
        },
        [appStoreApplicationName, name],
    )

    const renderChartValueBreadcrumbs = () => {
        return (
            <div className="flex left">
                <BreadCrumb breadcrumbs={breadcrumbs} sep="/" />
            </div>
        )
    }
    return <PageHeader isBreadcrumbs breadCrumbs={renderChartValueBreadcrumbs} />
}
