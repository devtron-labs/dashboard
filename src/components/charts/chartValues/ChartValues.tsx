import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { BreadCrumb, ErrorScreenManager, Progressing, showError, useBreadcrumb } from '../../common'
import { getChartValuesCategorizedListParsed, getChartVersionDetails, getChartVersionsMin } from '../charts.service'
import PageHeader from '../../common/header/PageHeader'
import ChartValuesView from '../../v2/values/chartValuesDiff/ChartValuesView'
import { ChartInstalledConfig, ChartKind } from '../../v2/values/chartValuesDiff/ChartValuesView.type'

export default function ChartValues() {
    const { chartId, chartValueId } = useParams<{ chartId: string; chartValueId: string }>()
    const [loader, setLoader] = useState(false)
    const [errorStatusCode, setErrorStatusCode] = useState(0)
    const [appStoreApplicationName, setAppStoreApplicationName] = useState('')
    const [valueName, setValueName] = useState('')
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
            setLoader(true)
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
        let id, kind
        if (chartValueId !== '0') {
            id = parseInt(chartValueId)
            kind = ChartKind.TEMPLATE
        } else {
            id = availableVersions[0]?.id
            kind = ChartKind.DEFAULT
        }
        if (id) {
            const chartValues = chartValuesList.find((chrtValue) => {
                if (chrtValue.kind === kind && chrtValue.id === id) return chrtValue
            })
            if (chartValues) {
                setChartValues(chartValues)
                if (chartValueId !== '0') {
                    setValueName(chartValues.name)
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
                <ErrorScreenManager
                    code={errorStatusCode}
                    subtitle="Information on this page is available only to superadmin users."
                />
            </div>
        )
    }
    return (
        <>
            <Header appStoreApplicationName={appStoreApplicationName} name={valueName} />
            <ChartValuesView
                isCreateValueView={true}
                installedConfigFromParent={chartInformation as ChartInstalledConfig}
                chartValuesListFromParent={chartValuesList}
                chartVersionsDataFromParent={availableVersions}
                chartValuesFromParent={chartValues}
                selectedVersionFromParent={availableVersions[0]?.id}
            />
        </>
    )
}

function Header({ appStoreApplicationName, name }) {
    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ':chartId': appStoreApplicationName || null,
                chart: null,
                ':chartValueId': { component: name || 'New value', linked: false },
                'chart-store': null,
                'saved-values': 'Saved value',
            },
        },
        [appStoreApplicationName, name],
    )

    const renderChartValueBreadcrumbs = () => {
        return (
            <div className="flex left">
                <BreadCrumb breadcrumbs={breadcrumbs} sep={'/'} />
            </div>
        )
    }
    return <PageHeader isBreadcrumbs={true} breadCrumbs={renderChartValueBreadcrumbs} />
}
