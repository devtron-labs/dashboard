import React, { Component } from 'react';
import { ReactComponent as Dropdown } from '../../assets/icons/appstatus/ic-dropdown.svg';
import { ViewType } from '../../config'
import { ChartCheckListProps, ChartCheckListState } from './checklist.type';
import { NavLink } from 'react-router-dom';
import { URLS } from '../../config';
import Uncheck from '../../assets/img/ic-success@2x.png';
import { ReactComponent as Check } from '../../assets/icons/ic-outline-check.svg';
import { getAppCheckList } from './checklist.service';
import { Progressing, showError } from '../common';

const DefaultChartCheckList = {
    gitOps: false,
    project: false,
    environment: false,
}

export class ChartCheckList extends Component<ChartCheckListProps, ChartCheckListState> {
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            statusCode: 0,
            isChartCollapsed: this.props.isChartCollapsed,
            saveLoading: false,
            form: {
                chartChecklist: {
                    ...DefaultChartCheckList
                }
            }
        }
        this.toggleChartCheckbox = this.toggleChartCheckbox.bind(this)
    }

    componentDidMount() {
        this.fetchChartCheckList()
    }

    fetchChartCheckList() {
        getAppCheckList().then((response) => {
            let appCheckList = response.result
            this.setState({
                view: ViewType.FORM,
                saveLoading: false,
                form: appCheckList,
            }, (() => { console.log(this.state) }))
        }).catch((error) => {
            showError(error);
            this.setState({ view: ViewType.ERROR, statusCode: error.code });
        })
    }

    toggleChartCheckbox() {
        this.setState({
            isChartCollapsed: !this.state.isChartCollapsed,
        })
    }

    render() {
        let { gitOps, environment, project } = this.state.form.chartChecklist

        return (<><div className="checklist__custom-input cursor cn-9 pt-12 pb-12 fw-6 flex" onClick={this.toggleChartCheckbox}>
            <div>To deploy chart (0/3 completed)</div>
            <span className="checklist__dropdown "><Dropdown className="icon-dim-20 rotate " style={{ ['--rotateBy' as any]: this.state.isChartCollapsed ? '180deg' : '0deg' }} /></span>
        </div>
            {this.state.isChartCollapsed ? <div className="checklist__custom-input ">
                <NavLink to={`${URLS.GLOBAL_CONFIG_GITOPS}`} className="no-decor  mt-8 flex left" style={{ ['color']: gitOps ? `#767d84` : `#0066cc` }}>
                    {!this.state.form.chartChecklist.gitOps ? <img src={Uncheck} className="icon-dim-16 mr-8" /> : <Check className="icon-dim-16 mr-8" />}
                    Configure GitOps</NavLink>
                <NavLink to={`${URLS.GLOBAL_CONFIG_CLUSTER}`} className="no-decor mt-8 flex left" style={{ ['color']: environment ? `#767d84` : `#0066cc` }}>
                    {!this.state.form.chartChecklist.environment ? <img src={Uncheck} className="icon-dim-16 mr-8" /> : <Check className="icon-dim-16 mr-8" />}
                    Add cluster & environment</NavLink>
                <NavLink to={`${URLS.GLOBAL_CONFIG_PROJECT}`} className="no-decor  mt-8 pb-8 flex left" style={{ ['color']: project ? `#767d84` : `#0066cc` }}>
                    {!this.state.form.chartChecklist.project ? <img src={Uncheck} className="icon-dim-16 mr-8" /> : <Check className="icon-dim-16 mr-8" />}
                    Add project</NavLink>
            </div> : ''}
        </>
        )
    }
}