import React, { Component } from 'react'
import { ViewType } from '../../../config'
import {
    getChartValues,
    updateChartValues,
    createChartValues,
    getChartVersionsMin,
    getChartVersionDetails,
    deleteChartValues,
} from '../charts.service'
import { showError, Progressing, Select, ButtonWithLoader, BreadCrumb, useBreadcrumb } from '../../common'
import Reload from '../../Reload/Reload'
import CodeEditor from '../../CodeEditor/CodeEditor'
import { toast } from 'react-toastify'
import { ReactComponent as Error } from '../../../assets/icons/ic-warning.svg'
import { getDiscoverChartDetailsURL, breadCrumbsChartValue } from '../charts.helper'
import { ChartValuesState, ChartValuesProps } from '../charts.types'
import YAML from 'yaml'
import PageHeader from '../../common/header/PageHeader'

export default class ChartValues extends Component<ChartValuesProps, ChartValuesState> {
    breadCrumbs = breadCrumbsChartValue(this.props.match.url)

    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            chartVersions: [],
            chartVersionId: 0,
            versionData: { id: 0 },
            name: '',
            values: '',
            chartVersion: '',
            buttonLoader: false,
            showError: false,
            appStoreApplicationName: '',
            isValid: {
                name: false,
            },
        }
        this.handleChartValuesChange = this.handleChartValuesChange.bind(this)
        this.handleChartVersionChange = this.handleChartVersionChange.bind(this)
        this.handleName = this.handleName.bind(this)
        this.saveChartValues = this.saveChartValues.bind(this)
        this.redirectToDiscoverChart = this.redirectToDiscoverChart.bind(this)
        this.deleteChartValue = this.deleteChartValue.bind(this)
    }

    componentDidMount() {
        getChartVersionsMin(this.props.match.params.chartId)
            .then((response) => {
                this.setState({ chartVersions: response.result || [], chartVersionId: response.result[0].id })
                return response.result[0].id
            })
            .then((chartVersionId) => {
                if (this.props.match.params.chartValueId) {
                    getChartValues(this.props.match.params.chartValueId, 'TEMPLATE')
                        .then((response) => {
                            this.setState({
                                name: response.result.name,
                                chartVersionId: response.result.appStoreVersionId,
                                values: response.result.values,
                                chartVersion: response.result.chartVersion,
                                view: ViewType.FORM,
                                isValid: {
                                    name: response.result.name.length > 0,
                                },
                            })
                        })
                        .catch((error) => {
                            showError(error)
                            this.setState({ view: ViewType.ERROR })
                        })
                } else {
                    getChartVersionDetails(chartVersionId)
                        .then((response) => {
                            this.setState({
                                values: response.result.rawValues,
                                view: ViewType.FORM,
                                appStoreApplicationName: response.result.appStoreApplicationName,
                            })
                        })
                        .catch((error) => {
                            showError(error)
                        })
                }
            })
            .catch((error) => {
                showError(error)
                this.setState({ view: ViewType.ERROR })
            })
    }

    handleName(event: React.ChangeEvent<HTMLInputElement>): void {
        let { isValid } = { ...this.state }
        let name = event.target.value
        isValid = {
            name: name.trim().length > 0,
        }
        this.setState({ name, isValid })
    }

    handleChartVersionChange(event: React.ChangeEvent<HTMLFormElement>): void {
        this.setState({ chartVersionId: event.target.value })
        getChartVersionDetails(event.target.value)
            .then((response) => {
                this.setState({
                    values: response.result.rawValues,
                    view: ViewType.FORM,
                })
            })
            .catch((error) => {
                showError(error)
            })
    }

    handleChartValuesChange(valuesYaml: string): void {
        this.setState({ values: valuesYaml })
    }

    deleteChartValue(event: React.MouseEvent<HTMLButtonElement>) {
        deleteChartValues(parseInt(this.props.match.params.chartValueId))
            .then((response) => {
                toast.success('Chart Values deleted successfully')
                this.redirectToDiscoverChart(event)
            })
            .catch((error) => {
                showError(error)
            })
    }

    redirectToDiscoverChart(event: React.MouseEvent<HTMLButtonElement>) {
        let url = getDiscoverChartDetailsURL(this.props.match.params.chartId)
        this.props.history.push(url)
    }

    saveChartValues(event: React.MouseEvent<HTMLButtonElement>) {
        this.setState({ showError: true, buttonLoader: true })
        let keys = Object.keys(this.state.isValid)
        let isValid = keys.reduce((isFormValid, key) => {
            return (isFormValid = isFormValid && this.state.isValid[key])
        }, true)
        if (!isValid) {
            this.setState({ showError: true, buttonLoader: false })
            return
        }
        try {
            YAML.parse(this.state.values)
        } catch (error) {
            toast.error('Invalid yaml')
            this.setState({ showError: true, buttonLoader: false })
            return
        }
        let promise
        let requestBody
        let toastMessage: string
        if (this.props.match.params.chartValueId) {
            requestBody = {
                id: parseInt(this.props.match.params.chartValueId),
                name: this.state.name,
                appStoreVersionId: this.state.chartVersionId,
                values: this.state.values,
                chartVersion: this.state.chartVersion,
            }
            toastMessage = 'Chart Value Updated'
            promise = updateChartValues(requestBody)
        } else {
            requestBody = {
                appStoreVersionId: this.state.chartVersionId,
                name: this.state.name,
                values: this.state.values,
            }
            toastMessage = 'Chart Value Created'
            promise = createChartValues(requestBody)
        }
        promise
            .then((response) => {
                toast.success(toastMessage)
                let { name, chartVersion, values, appStoreVersionId } = response.result
                this.setState({
                    name,
                    chartVersion,
                    values,
                    chartVersionId: appStoreVersionId,
                    buttonLoader: false,
                    showError: false,
                    isValid: { name: !!name.length },
                })

                if (!this.props.match.params.chartValueId) {
                    this.redirectToDiscoverChart(event)
                }
            })
            .catch((error) => {
                showError(error)
                this.setState({ showError: false, buttonLoader: false })
            })
    }

    render() {
        let selectedChartVersion = this.state.chartVersions.find(
            (chartVersion) => chartVersion.id === this.state.chartVersionId,
        )
        if (this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        } else if (this.state.view === ViewType.ERROR) {
            return <Reload />
        } else {
            return (
                <div className="chart-values">
                    <Header appStoreApplicationName={this.state.appStoreApplicationName} />
                    <form className="chart-values__container">
                        <label className="form__row">
                            <span className="form__label">Name*</span>
                            <input
                                tabIndex={1}
                                placeholder="Name"
                                className="form__input"
                                disabled={!!this.props.match.params.chartValueId}
                                value={this.state.name}
                                onChange={this.handleName}
                            />
                            {this.state.showError && !this.state.isValid.name ? (
                                <span className="form__error">
                                    <Error className="form__icon form__icon--error" />
                                    This is a required field
                                </span>
                            ) : null}
                        </label>
                        <div className="form__row">
                            <span className="form__label">Chart version*</span>
                            <Select
                                tabIndex={2}
                                value={this.state.chartVersionId}
                                onChange={this.handleChartVersionChange}
                            >
                                <Select.Button rootClassName="select-button--default">
                                    {selectedChartVersion ? `${selectedChartVersion.version}` : 'Select Version'}
                                </Select.Button>
                                {this.state.chartVersions.map((chartVersion, index) => {
                                    return (
                                        <Select.Option key={`${chartVersion.version}`} value={chartVersion.id}>
                                            {chartVersion.version}
                                        </Select.Option>
                                    )
                                })}
                            </Select>
                        </div>
                        <div className="mb-12 code-editor-container">
                            <CodeEditor
                                value={this.state.values}
                                noParsing
                                mode="yaml"
                                onChange={this.handleChartValuesChange}
                            >
                                <CodeEditor.Header>
                                    <span className="bold">values.yaml</span>
                                </CodeEditor.Header>
                            </CodeEditor>
                        </div>

                        <div className="flex right">
                            {this.props.match.params.chartValueId ? (
                                <button type="button" className="cta delete mr-16" onClick={this.deleteChartValue}>
                                    Delete
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="cta cancel mr-16"
                                    onClick={this.redirectToDiscoverChart}
                                >
                                    Cancel
                                </button>
                            )}
                            <ButtonWithLoader
                                isLoading={this.state.buttonLoader}
                                rootClassName="cta"
                                loaderColor="white"
                                onClick={this.saveChartValues}
                            >
                                Save Template
                            </ButtonWithLoader>
                        </div>
                    </form>
                </div>
            )
        }
    }
}

function Header({ appStoreApplicationName }) {
    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ':chartId': { component: appStoreApplicationName || null, linked: true },
                chart: null,
                ':chartValueId?': null,
                'chart-value': null,
                'chart-store': null,
            },
        },
        [],
    )

    const renderChartValueBreadcrumbs = () => {
        return (
            <div className="flex left">
                <BreadCrumb breadcrumbs={breadcrumbs} />/ Create Custom Values
            </div>
        )
    }
    return (
        <PageHeader isBreadcrumbs={true} breadCrumbs={renderChartValueBreadcrumbs} />
        // <div className="page-header">

        //     <div className="page-header__cta-container" />
        // </div>
    )
}
