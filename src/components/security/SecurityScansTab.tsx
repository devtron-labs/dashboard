import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ReactComponent as Arrow } from '../../assets/icons/ic-chevron-down.svg';
import { ReactComponent as Close } from '../../assets/icons/ic-error.svg';
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg';
import { getInitData, getSecurityScanList } from './security.service';
import { DropdownIndicator, styles, ValueContainer, Option } from './security.util';
import { ScanDetailsModal, Pagination, Progressing, showError, ErrorScreenManager as ErrorScreen } from '../common'
import { ViewType } from '../../config';
import { ReactSelectOptionType, SecurityScansTabState } from './security.types';
import ReactSelect from 'react-select';
import EmptyState from '../EmptyState/EmptyState';
import AppNotDeployed from '../../assets/img/app-not-deployed.png';
import NoResults from '../../assets/img/empty-noresult@2x.png';

export class SecurityScansTab extends Component<RouteComponentProps<{}>, SecurityScansTabState> {

  constructor(props) {
    super(props);
    this.state = {
      responseCode: 0,
      view: ViewType.LOADING,
      searchObject: { label: "application", value: 'appName' },
      searchObjectValue: "",
      searchApplied: false,
      filters: {
        environments: [],
        clusters: [],
        severity: [],
      },
      filtersApplied: {
        environments: [],
        clusters: [],
        severity: [],
      },
      size: 0,
      offset: 0,
      pageSize: 20,
      securityScans: [],
      uniqueId: {
        imageScanDeployInfoId: 0,
        appId: 0,
        envId: 0,
      },
      name: "",
    }
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.changePage = this.changePage.bind(this);
    this.changePageSize = this.changePageSize.bind(this);
    this.search = this.search.bind(this);
    this.removeAllFilters = this.removeAllFilters.bind(this);
    this.handleObjectTypeChange = this.handleObjectTypeChange.bind(this);
    this.removeFiltersAndSearch = this.removeFiltersAndSearch.bind(this);
    this.removeSearch = this.removeSearch.bind(this);
  }

  componentDidMount() {
    let payload = this.createPaylod(this.state.filtersApplied);
    getInitData(payload).then((response) => {
      this.setState({
        ...response,
        view: ViewType.FORM,
      });
    }).catch((error) => {
      this.setState({ responseCode: error.code, view: ViewType.ERROR });
    })
  }

  callGetSecurityScanList() {
    this.setState({ view: ViewType.LOADING });
    let payload = this.createPaylod(this.state.filtersApplied);
    getSecurityScanList(payload).then((response) => {
      this.setState({
        ...response.result,
        securityScans: response.result.securityScans,
        view: ViewType.FORM,
      });
    }).catch((error) => {
      showError(error);
      this.setState({ responseCode: error.code, view: ViewType.ERROR });
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.location.search !== this.props.location.search) {
      this.callGetSecurityScanList();
    }
  }

  createPaylod(filtersApplied) {
    let searchStr = new URLSearchParams(this.props.location.search);
    let pageSize = searchStr.get('size');
    let offset = searchStr.get('offset');
    let payload = {
      offset: Number(offset) || 0,
      size: Number(pageSize) || 20,
      cveName: "",
      appName: "",
      objectName: "",
      severity: filtersApplied.severity.map((s) => s.value),
      clusterIds: filtersApplied.clusters.map((s) => s.value),
      envIds: filtersApplied.environments.map((s) => s.value),
    }
    if (this.state.searchObject) {
      payload[this.state.searchObject.value] = this.state.searchObjectValue
    }
    return payload;
  }

  handleSearchChange(event) {
    this.setState({ searchObjectValue: event.target.value });
  }

  handleFilterChange(filterType, selections: any): void {
    let filtersApplied = {
      ...this.state.filtersApplied,
      [filterType]: selections || [],
    }
    this.setState({ filtersApplied, view: ViewType.LOADING }, () => {
      this.callGetSecurityScanList();
    })
  }

  handleFilterRemove(filterType: string, deletion: ReactSelectOptionType) {
    let filters = this.state.filtersApplied[filterType].filter((item) => item.value !== deletion.value);
    let filtersApplied = {
      ...this.state.filtersApplied,
      [filterType]: filters,
    }
    this.setState({
      filtersApplied,
      view: ViewType.LOADING
    }, () => {
      this.callGetSecurityScanList();
    })
  }

  removeAllFilters() {
    this.setState({
      filtersApplied: {
        clusters: [],
        environments: [],
        severity: [],
      },
      view: ViewType.LOADING
    }, () => {
      this.callGetSecurityScanList();
    })
  }

  removeSearch() {
    this.setState({
      searchApplied: false,
      searchObjectValue: "",
      view: ViewType.LOADING
    }, () => {
      this.callGetSecurityScanList();
    })
  }

  removeFiltersAndSearch() {
    this.setState({
      filtersApplied: {
        clusters: [],
        environments: [],
        severity: [],
      },
      searchApplied: false,
      searchObjectValue: "",
      view: ViewType.LOADING
    }, () => {
      this.callGetSecurityScanList();
    })
  }

  handleObjectTypeChange(selected) {
    this.setState({ searchObject: selected }, () => {
      if (this.state.searchObjectValue) {
        this.setState({ searchObjectValue: '', searchApplied: false }, () => {
          this.callGetSecurityScanList();
        })
      }
    });
  }

  search() {
    this.setState({ searchApplied: true }, () => {
      this.callGetSecurityScanList();
    });
  }

  changePage(newPageNo: number): void {
    let newOffset = (this.state.pageSize * (newPageNo - 1));
    let searchStr = new URLSearchParams(this.props.location.search);
    let pageSize = searchStr.get('size');
    let newSearchStr = '';
    if (newOffset) newSearchStr = `offset=${newOffset}`;
    if (pageSize) newSearchStr = `${newSearchStr}&&size=${pageSize}`;
    this.props.history.push(`${this.props.match.url}?${newSearchStr}`)
  }

  changePageSize(newPageSize: number): void {
    let searchStr = new URLSearchParams(this.props.location.search);
     let offset = searchStr.get('offset');
    let newSearchStr = `size=${newPageSize}`;
    if (offset) newSearchStr = `offset=${offset}&&${newSearchStr}`;
    this.props.history.push(`${this.props.match.url}?${newSearchStr}`);
  }

  renderSavedFilters() {
    let filters = ['clusters', 'environments', 'severity'];
    let count = 0;
    return <div className="flex left flex-1 pt-10 pb-10 pl-18 pr-18">
      {filters.map((filter) => {
        return <>
          {this.state.filtersApplied[filter].map((cluster) => {
            count++;
            return <div key={cluster.value} className="saved-filter">{cluster.label}
              <button type="button" className="saved-filter__clear-btn pt-4 pb-4"
                onClick={(event) => { this.handleFilterRemove(filter, cluster) }} >
                <Close className="icon-dim-18 icon-n4 vertical-align-middle" />
              </button>
            </div>
          })}
        </>
      })}
      {count > 0 ? <button type="button" className="saved-filters__clear-btn"
        onClick={() => { this.removeAllFilters() }}>Clear All Filters
      </button> : null}
    </div>
  }

  renderFilters() {
    if ((this.state.size > 0) || (this.state.size <= 0 && (this.state.searchApplied || this.state.filtersApplied.severity.length || this.state.filtersApplied.clusters.length || this.state.filtersApplied.environments.length))) {
      let filterTypes = ['severity', 'clusters', 'environments'];
      return <div className='security-scan__filters'>
        <form onSubmit={(e) => { e.preventDefault(); this.search(); }} className="flex-1 flex mr-24">
          <div className="search-with-dropdown">
            <ReactSelect className="search-with-dropdown__dropdown"
              isMulti={false}
              isSearchable={false}
              isClearable={false}
              value={this.state.searchObject}
              onChange={this.handleObjectTypeChange}
              hideSelectedOptions={false}
              options={[
                { label: 'Application', value: 'appName' },
                { label: 'Vulnerability', value: 'cveName' },
                { label: 'Deployment Object', value: 'objectName' }
              ]}
              components={{
                DropdownIndicator
              }}
              styles={{
                ...styles,
                container: (base, state) => {
                  return ({
                    ...base,
                    height: '36px',
                  })
                },
                control: (base, state) => ({
                  ...base,
                  border: 'none',
                  minHeight: '36px',
                }),
              }} />
            <Search className="icon-dim-20 ml-7" />
            <input autoComplete="off" type="text" className="search-with-dropdown__search"
              tabIndex={1}
              value={this.state.searchObjectValue}
              placeholder={`Search ${this.state.searchObject.label}`}
              onKeyDown={(e) => {
                if (e.keyCode === 13) {
                  this.search();
                }
              }} onChange={this.handleSearchChange} />
            {this.state.searchApplied ? <Close className="icon-dim-20 cursor icon-n4 mr-5" onClick={this.removeSearch} /> : null}
          </div>
        </form>
        <div className="flexbox">
          {filterTypes.map((filter, index) => {
            return <ReactSelect key={filter}
              className={`security-scan__filter security-scan__filter--${filter}`}
              name={filter}
              tabIndex={index + 2}
              isMulti={true}
              isClearable={false}
              value={this.state.filtersApplied[filter]}
              options={this.state.filters[filter]}
              placeholder={`${filter}`}
              hideSelectedOptions={false}
              onChange={(selected) => this.handleFilterChange(filter, selected)}
              components={{
                DropdownIndicator,
                ValueContainer,
                Option: Option,
              }}
              styles={{
                container: (base, state) => {
                  return ({
                    ...base,
                    height: '36px',
                  })
                },
                control: (base, state) => ({
                  ...base,
                  minHeight: '36px',
                }),
                ...styles,
              }} />
          })}
        </div>
      </div>
    }
  }

  renderModal() {
    if (this.state.uniqueId.appId) {
      return <ScanDetailsModal
        {...this.props}
        showAppInfo={true}
        uniqueId={this.state.uniqueId}
        name={this.state.name}
        close={() => { this.setState({ uniqueId: { appId: 0, imageScanDeployInfoId: 0, envId: 0 } }) }} />
    }
  }

  renderPagination() {
    if (this.state.size > 20) {
      return <Pagination
        size={this.state.size}
        pageSize={this.state.pageSize}
        offset={this.state.offset}
        changePage={this.changePage}
        changePageSize={this.changePageSize} />
    }
  }

  renderTable() {
    if (this.state.view === ViewType.LOADING) {
      return <div style={{ height: 'calc(100vh - 200px)' }}>
        <Progressing pageLoader />
      </div>
    }
    else if (this.state.view === ViewType.ERROR) {
      return <div className="flex" style={{ height: 'calc(100vh - 212px)' }}>
        <ErrorScreen code={this.state.responseCode} />
      </div>
    }
    else if ((this.state.view === ViewType.FORM && this.state.size === 0) && (this.state.searchApplied || this.state.filtersApplied.severity.length
      || this.state.filtersApplied.environments.length || this.state.filtersApplied.clusters.length)) {
      return <div style={{ height: 'calc(100vh - 200px)' }}>
        <EmptyState >
          <EmptyState.Image><img src={NoResults} alt="" /></EmptyState.Image>
          <EmptyState.Title><h4>No Matching Results</h4></EmptyState.Title>
          <EmptyState.Subtitle>No results found for the applied filters.</EmptyState.Subtitle>
          <EmptyState.Button>
            <button type="button" className="cta ghosted" onClick={this.removeFiltersAndSearch}>Clear all Filters</button>
          </EmptyState.Button>
        </EmptyState>
      </div>
    }
    else if (this.state.view === ViewType.FORM && this.state.size === 0) {
      return <div style={{ height: 'calc(100vh - 175px)' }}>
        <EmptyState >
          <EmptyState.Image><img src={AppNotDeployed} alt="" /></EmptyState.Image>
          <EmptyState.Title><h4>No Scans Performed</h4></EmptyState.Title>
          <EmptyState.Subtitle><span></span></EmptyState.Subtitle>
        </EmptyState>
      </div>
    }
    return <>
      <table className="user__table">
        <tbody>
          <tr className="table__row-head">
            <th className="table__title">NAME</th>
            <th className="table__title table__cell--type">TYPE</th>
            <th className="table__title">SECURITY SCAN</th>
            <th className="table__title">ENVIRONMENT</th>
            <th className="table__title">LAST SCANNED</th>
            <th className="table__title"><div className="icon-dim-20" /></th>
          </tr>
          {this.state.securityScans.map((scan) => {
            let total = scan.severityCount.critical + scan.severityCount.moderate + scan.severityCount.low;
            return <tr key={scan.name} className="table__row" onClick={() => {
              this.setState({
                name: scan.name,
                uniqueId: {
                  imageScanDeployInfoId: scan.imageScanDeployInfoId,
                  appId: scan.appId,
                  envId: scan.envId,
                },
              })
            }}>
              <td className="security__data ellipsis-right">{scan.name}</td>
              <td className="security__data table__cell--type ellipsis-right">{scan.type}</td>
              <td className="security__data ellipsis-right">
                {total === 0 ? <span className="fill-pass">Passed</span> : null}
                {scan.severityCount.critical !== 0 ? <span className="fill-critical">{scan.severityCount.critical} Critical</span> : null}
                {scan.severityCount.critical === 0 && scan.severityCount.moderate !== 0 ? <span className="fill-moderate">{scan.severityCount.moderate} Moderate</span> : null}
                {scan.severityCount.critical === 0 && scan.severityCount.moderate === 0 && scan.severityCount.low !== 0 ? <span className="fill-low">{scan.severityCount.low} Low</span> : null}
              </td>
              <td className="security__data">{scan.environment}</td>
              <td className="security__data table__cell--time ellipsis-right">{scan.lastExecution}</td>
              <td className="security__data"><Arrow className="table__row-icon align-right icon-dim-20 fcn-6" /></td>
            </tr>
          })}
        </tbody>
      </table >
      {this.renderPagination()}
    </>
  }

  render() {
    return <div className="security-scan bcn-0">
      {this.renderFilters()}
      {this.renderSavedFilters()}
      {this.renderTable()}
      {this.renderModal()}
    </div>
  }
}
