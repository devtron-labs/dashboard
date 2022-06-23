import React, { Component } from 'react'
import { VisibleModal, showError, Progressing } from '../../common'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { ReactComponent as Delete } from '../../../assets/icons/ic-delete.svg'
import { ReactComponent as Edit } from '../../../assets/icons/ic-edit.svg'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { ReactComponent as EmptyData } from '../../../assets/icons/ic-empty-data.svg'
import { RouteComponentProps } from 'react-router-dom'
import { getChartValuesTemplateList, deleteChartValues } from '../charts.service'
import { URLS, ViewType } from '../../../config'
import { toast } from 'react-toastify'
import { withRouter } from 'react-router-dom'

export interface ManageValuesProps extends RouteComponentProps<{}> {
    chartId: string
    onDeleteChartValue: () => void
    close: () => void
}

export interface ManageValuesState {
    view: string
    values: Array<{ id: number; name: string; chartVersion: string; isLoading: boolean }>
}

class ManageValues extends Component<ManageValuesProps, ManageValuesState> {
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            values: [],
        }
        this.onCreateNewChartValue = this.onCreateNewChartValue.bind(this)
        this.onEditChartValue = this.onEditChartValue.bind(this)
        this.deleteChartValue = this.deleteChartValue.bind(this)
    }

    componentDidMount() {
        this.getChartValuesList()
    }

    getChartValuesList() {
        getChartValuesTemplateList(this.props.chartId)
            .then((response) => {
                let list = response.result || []
                list = list.map((item) => {
                    return { ...item, isLoading: false }
                })
                this.setState({ values: list, view: ViewType.FORM })
            })
            .catch((error) => {
                showError(error)
            })
    }

    onCreateNewChartValue() {
        let link = `${URLS.CHARTS}/discover/chart/${this.props.chartId}/chart-value`
        this.props.history.push(link)
    }

    onEditChartValue(chartValueId: number) {
        let link = `${URLS.CHARTS}/discover/chart/${this.props.chartId}/saved-values/${chartValueId}`
        this.props.history.push(link)
    }

    deleteChartValue(chartValueId: number) {
        let { values } = { ...this.state }
        values = values.map((val) => {
            if (val.id === chartValueId) return { ...val, isLoading: true }
            return val
        })
        this.setState({ values })
        deleteChartValues(chartValueId)
            .then((response) => {
                toast.success('Deleted')
                this.getChartValuesList()
                this.props.onDeleteChartValue()
            })
            .catch((error) => {
                showError(error)
            })
    }

    renderHeader() {
        return (
            <div className="modal__header modal__header--manage-values">
                <h1 className="modal__title">Manage Values</h1>
                <button type="button" className="transparent " onClick={this.props.close}>
                    <Close className="icon-dim-20" />
                </button>
            </div>
        )
    }

    renderCreateNew() {
        return (
            <div
                className="manage-values__create-new"
                onClick={(event) => {
                    this.onCreateNewChartValue()
                }}
            >
                <Add className="icon-dim-24 mr-5" />
                Create Custom
            </div>
        )
    }

    render() {
        if (this.state.view === ViewType.LOADING) {
            return (
                <VisibleModal className="">
                    <div className={`modal__body modal__body--manage-values`}>
                        {this.renderHeader()}
                        <ul className="manage-values__list">
                            <Progressing pageLoader />
                        </ul>
                        {this.renderCreateNew()}
                    </div>
                </VisibleModal>
            )
        } else if (this.state.values.length === 0) {
            return (
                <VisibleModal className="">
                    <div className={`modal__body modal__body--manage-values`}>
                        {this.renderHeader()}
                        <div className="manage-values__empty-state">
                            <EmptyData className="manage-values__empty-state-img" />
                            <span className="manage-values__empty-state-title">No custom values available</span>
                        </div>
                        {this.renderCreateNew()}
                    </div>
                </VisibleModal>
            )
        } else
            return (
                <VisibleModal className="">
                    <div className={`modal__body modal__body--manage-values`}>
                        {this.renderHeader()}
                        <ul className="manage-values__list">
                            {this.state.values.map((value) => {
                                return (
                                    <li key={value.id} className="manage-values__list-item">
                                        <div className="manage-values__chart-values-name ellipsis-right">
                                            {value.name} ({value.chartVersion})
                                        </div>
                                        {value.isLoading ? (
                                            <span className="align-right">
                                                <Progressing />
                                            </span>
                                        ) : (
                                            <div className="manage-values__item-action align-right">
                                                <button
                                                    type="button"
                                                    className="transparent mr-16"
                                                    onClick={(event) => {
                                                        this.onEditChartValue(value.id)
                                                    }}
                                                >
                                                    <Edit className="icon-dim-24" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="transparent"
                                                    onClick={(event) => {
                                                        this.deleteChartValue(value.id)
                                                    }}
                                                >
                                                    <Delete className="icon-dim-24" />
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                        {this.renderCreateNew()}
                    </div>
                </VisibleModal>
            )
    }
}

export default withRouter(ManageValues)
