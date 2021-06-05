import React, { Component } from 'react';
import { DeployedChartProps, DeployedChartState } from '../charts.types';
import { ViewType } from '../../../config';
import { Link, withRouter } from 'react-router-dom';
import { ErrorScreenManager, LazyImage, Progressing,   multiSelectStyles, Checkbox, Option } from '../../common';
import { UpdateWarn } from '../../common/DeprecatedUpdateWarn';
import { getInstalledCharts } from '../charts.service';
import { toast } from 'react-toastify'
import placeHolder from '../../../assets/icons/ic-plc-chart.svg'
import { useHistory, useLocation, useRouteMatch } from 'react-router';
import { HeaderTitle, HeaderButtonGroup, GenericChartsHeader, ChartDetailNavigator } from '../Charts'
import { ChartCheckListModal } from '../../checkList/ChartCheckModal';
import { AllCheckModal } from '../../checkList/AllCheckModal';
import { DropdownIndicator, ValueContainer } from '../charts.util';
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg';
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg';
import ReactSelect, { components } from 'react-select';

const QueryParams = {
ChartRepoId: 'chartRepoId',
IncludeDeprecated: 'includeDeprecated',
AppStoreName: 'appStoreName',
}

class Deployed extends Component<DeployedChartProps, DeployedChartState> {
  
    constructor(props) {
        super(props);
        this.state = {
            code: 0,
            view: ViewType.LOADING,
            installedCharts: [],
        }
    }

    componentDidMount() {
        this.getInstalledCharts();
    }

    getInstalledCharts() {
        getInstalledCharts().then((response) => {
            this.setState({ installedCharts: response.result, view: ViewType.FORM });
        }).catch((errors) => {
            this.setState({ code: errors.code, view: ViewType.ERROR })
            if (errors && Array.isArray(errors.error)) {
                errors.errors.map(err => toast.error(err, { autoClose: false }))
            }
        })
    }

    handleImageError(e) {
        const target = e.target as HTMLImageElement
        target.onerror = null
        target.src = placeHolder
    }

    renderCard(chart) {
        let { icon, chartName, appName, appStoreApplicationName, environmentName, deployedAt, installedAppId, environmentId, deprecated } = chart;
        return <Link key={appName} className="chart-grid-item white-card chart-grid-item--deployed" to={`deployments/${installedAppId}/env/${environmentId}`}>
            <div className="chart-grid-item__flexbox">
                <div className="chart-grid-item__icon-wrapper">
                    <LazyImage className="chart-grid-item__icon" src={icon} onError={this.handleImageError} />
                </div>
                {
                    deprecated &&
                    <div>
                        <UpdateWarn />
                        {/* <div className="chart-grid-item__top-right"><img src={check} className="chart-grid-item__top-right-icon" />Deployed</div> */}
                    </div>
                }
            </div>
            <div className="chart-grid-item__title ellipsis-right">{appName}</div>
            <div className="chart-grid-item__light-text ellipsis-right">{chartName}/{appStoreApplicationName}</div>
            <div className="chart-grid-item__env"><span className="env-badge">ENV</span>{environmentName}</div>
            <div className="chart-grid-item__light-text ellipsis-right">{deployedAt}</div>
        </Link>
    }

    renderPageHeader() {
        return <GenericChartsHeader>
            <HeaderTitle>Chart Store</HeaderTitle>
            <ChartDetailNavigator />
            <HeaderButtonGroup><span /></HeaderButtonGroup>
        </GenericChartsHeader>
    }


     handleChartRepoChange(selected): void {
        let chartRepoId = selected?.map((e) => { return e.value }).join(",");
        // let searchParams = new URLSearchParams(location.search);
        // let app = searchParams.get(QueryParams.AppStoreName);
        // let deprecate = searchParams.get(QueryParams.IncludeDeprecated);
        // let qs = `${QueryParams.ChartRepoId}=${chartRepoId}`;
        // if (app) qs = `${qs}&${QueryParams.AppStoreName}=${app}`;
        // if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
        // this.props.history.push(`${url}?${qs}`);
    }


     handleDeprecateChange(deprecated): void {
        // let searchParams = new URLSearchParams(location.search);
        // let app = searchParams.get(QueryParams.AppStoreName);
        // let chartRepoId = searchParams.get(QueryParams.ChartRepoId);
        // let qs = `${QueryParams.IncludeDeprecated}=${deprecated}`;
        // if (app) qs = `${qs}&${QueryParams.AppStoreName}=${app}`;
        // if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`
        // this.props.history.push(`${url}?${qs}`);
    }

     handleAppStoreChange(event): void {
        event.preventDefault();
        // let searchParams = new URLSearchParams(location.search);
        // let deprecate = searchParams.get(QueryParams.IncludeDeprecated);
        // let chartRepoId = searchParams.get(QueryParams.ChartRepoId);
        // let qs = `${QueryParams.AppStoreName}=${appStoreName}`;
        // if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
        // if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`;
        // this.props.history.push(`${url}?${qs}`);
    }

     clearSearch(event): void {
        // let searchParams = new URLSearchParams(location.search);
        // let deprecate = searchParams.get(QueryParams.IncludeDeprecated);
        // let chartRepoId = searchParams.get(QueryParams.ChartRepoId);
        // let qs: string = "";
        // if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
        // if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`;
        // this.props.history.push(`${url}?${qs}`);
    }

     handleViewAllCharts() {
        // this.props.history.push(`${url}?${QueryParams.IncludeDeprecated}=1`);
    }

     handleCloseFilter() {
        // setSelectedChartRepo(appliedChartRepoFilter)
    }
    renderFilterSection() {
        const MenuList = (props) => {
            return (
                <components.MenuList {...props}>
                    {props.children}
                    <div className="chart-list-apply-filter flex bcn-0 pt-10 pb-10">
                        <button type="button" className="cta flex cta--chart-store"
                            disabled={false}
                            // onClick={(selected: any) => { this.handleChartRepoChange(selectedChartRepo) }}
                            >Apply Filter</button>
                    </div>
                </components.MenuList>
            );
        };
    
        return ( <div className="chart-group__header">
        <div className="flexbox flex-justify">
            <form 
            onSubmit={this.handleAppStoreChange} 
            className="search position-rel" >
                <Search className="search__icon icon-dim-18" />
                <input type="text" placeholder="Search charts"
                //  value={appStoreName} 
                 className="search__input bcn-0"
                //   onChange={(event) => { setAppStoreName(event.target.value); }} 
                />
                {/* // {searchApplied ? <button className="search__clear-button" type="button" onClick={clearSearch}>
                //     <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                // </button> : null} */}
            </form>
            <div className="flex">
            <ReactSelect className="date-align-left fs-13 pr-16"
                    placeholder="Environment : All"
                    name="repository "
                    // value={selectedChartRepo}
                    // options={chartRepoList}
                    closeOnSelect={false}
                    // onChange={setSelectedChartRepo}
                    isClearable={false}
                    isMulti={true}
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    onMenuClose={this.handleCloseFilter}
                    components={{
                        DropdownIndicator,
                        Option,
                        ValueContainer,
                        IndicatorSeparator: null,
                        ClearIndicator: null,
                        MenuList,
                    }}
                    styles={{ ...multiSelectStyles }} />
                <ReactSelect className="date-align-left fs-13"
                    placeholder="Repository : All"
                    name="repository "
                    // value={selectedChartRepo}
                    // options={chartRepoList}
                    closeOnSelect={false}
                    // onChange={setSelectedChartRepo}
                    isClearable={false}
                    isMulti={true}
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    onMenuClose={this.handleCloseFilter}
                    components={{
                        DropdownIndicator,
                        Option,
                        ValueContainer,
                        IndicatorSeparator: null,
                        ClearIndicator: null,
                        MenuList,
                    }}
                    styles={{ ...multiSelectStyles }} />
                {/* <Checkbox rootClassName="ml-16 mb-0 fs-14 cursor bcn-0 pt-8 pb-8 pr-12 date-align-left--deprecate"
                    // isChecked={includeDeprecated === 1}
                    value={"CHECKED"}
                    onChange={(event) => { let value = (includeDeprecated + 1) % 2; this.handleDeprecateChange(value) }} >
                    <div className="ml-5"> Show deprecated</div>
                </Checkbox> */}
            </div>
        </div>
    </div>
        )
    }

    render() {
        if (this.state.view === ViewType.LOADING) {
            return <div className="chart-list-page ">
                {this.renderPageHeader()}
                <div style={{ height: '100vh', width: '100vw' }}>
					<Progressing pageLoader />
				</div>
            </div>
        }
        else if (this.state.view === ViewType.ERROR) {
            return <div className="chart-list-page">
                {this.renderPageHeader()}
                <ErrorScreenManager code={this.state.code} />
            </div>
        }
        if (this.state.installedCharts.length === 0) {
            return <div className="chart-list-page" >
                {this.renderPageHeader()}
                <div style={{ width: "600px", margin: "auto", marginTop: '20px' }} className="bcn-0 pt-20 pb-20 pl-20 pr-20 br-8 en-1 bw-1 mt-20">
                    <AllCheckModal />
                </div>
            </div>
        }
        else {
            return <div className="chart-list-page">
                {this.renderPageHeader()}
                {this.renderFilterSection()}
                <div className="chart-grid">
                    {this.state.installedCharts.map((chart) => {
                        return this.renderCard(chart);
                    })}
                </div>
            </div>
        }
    }
}
export default withRouter(props => <Deployed {...props} />)
