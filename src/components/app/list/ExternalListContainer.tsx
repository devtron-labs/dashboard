import React, { Component } from 'react'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg';
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg';
import { ExternalListContainerState, ExternalListContainerProps } from './types';
import { getExternalList, getExternalApplistInitData } from './appList.modal';
import { showError } from '../../../components/common';
import { URLS, ViewType } from '../../../config';
import { ExternalListView } from './ExternalListView';
import { ExternalFilters } from './external.util'
import * as queryString from 'query-string';
import { withRouter } from 'react-router-dom';

const QueryParams = {
    Cluster: "cluster",
    Namespace: "namespace",
    Appstore: "appstore"
}

class ExternalListContainer extends Component<ExternalListContainerProps, ExternalListContainerState> {
    abortController: AbortController;

    constructor(props) {
        super(props)

        this.state = {
            code: 0,
            view: ViewType.LOADING,
            externalList: [],
            externalQueryList: [],
            namespaceList: [],
            clusterList: [],
            selectedNamespace: [],
            selectedCluster: [],
            namespaceHashmap: undefined,
            clusterHashmap: undefined,
            appliedCluster: [],
            appliedNamespace: [],
            searchQuery: "",
            searchApplied: false,
            pagination: {
                size: 0,
                offset: 0,
                pageSize: 0,
            }
        }
    }

    componentDidMount() {
        getExternalApplistInitData().then((response) => {
            this.setState({
                clusterList: response.result.clusterList,
                namespaceList: response.result.namespaceList,
                namespaceHashmap: response.result.namespaceHashmap,
                clusterHashmap: response.result.clusterHashmap,
            })
        }).catch((error) => {
            showError(error);
        })
        this.initialiseFromQueryParams();
        this.fetchExternalAppList();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.location.search !== this.props.location.search) {
            this.fetchExternalAppList();
        }
    }

    setCluster = (selected) => {
        this.setState({
            selectedCluster: selected
        })
    }

    setNamespace = (selected) => {
        this.setState({ selectedNamespace: selected })
    }

    initialiseFromQueryParams() {
        let searchParams = new URLSearchParams(this.props.location.search);
        let appNameSearch: string = searchParams.get(QueryParams.Appstore);
        let cluster: string = searchParams.get(QueryParams.Cluster);
        let namespace: string = searchParams.get(QueryParams.Namespace);

        let selectedClusterIdArray: string[] = cluster ? cluster.split(",") : [];
        let selectedNamespaceIdArray: string[] = namespace ? namespace?.split(",") : [];

        let selectedClusterList = selectedClusterIdArray.map((clusterId: string) => {
            return this.state.clusterHashmap.get((clusterId))
        })

        let selectedNamespaceList = selectedNamespaceIdArray.map((namespace) => {
            return this.state.namespaceHashmap.get((namespace))
        })

        this.setState({
            searchApplied: appNameSearch ? true : false,
            searchQuery: appNameSearch ? appNameSearch : "",
            appliedNamespace: selectedNamespaceList,
            appliedCluster: selectedClusterList,
            selectedCluster: selectedClusterList,
            selectedNamespace: selectedNamespaceList,
        });
    }

    fetchExternalAppList() {
        this.setState({ view: ViewType.LOADING });
        getExternalList(this.props.location.search).then((response) => {
            this.setState({
                externalList: response.result,
                view: ViewType.FORM
            })
        }).catch((error) => {
            showError(error);
        })
        this.setState({ view: ViewType.FORM });
    }

    removeFilter = (key, val): void => {
        let searchQuery = new URLSearchParams(this.props.location.search)
        let queryParamValue = searchQuery.get(key)
        let arr = queryParamValue.split(",");
        arr = arr.filter((item) => item != val.toString());
        queryParamValue = arr.toString();
        searchQuery.set(key, queryParamValue)
        let url = `${URLS.EXTERNAL_APP}?${searchQuery}`;
        this.props.history.push(url);
    }

    removeAllFilters = (): void => {
        let qs = queryString.parse(this.props.location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        delete query['cluster'];
        delete query['namespace'];
        let queryStr = queryString.stringify(query);
        let url = `${URLS.EXTERNAL_APP}?${queryStr}`;
        this.props.history.push(url);
    }

    changePage = (pageNo: number): void => {
        let offset = this.state.pagination.pageSize * (pageNo - 1);
        let qs = queryString.parse(this.props.location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        query['offset'] = offset;
        let queryStr = queryString.stringify(query);
        let url = `${URLS.EXTERNAL_APP}?${queryStr}`;
        this.props.history.push(url);
    }

    changePageSize = (size: number): void => {
        let qs = queryString.parse(this.props.location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        query['offset'] = 0;
        query['pageSize'] = size;
        let queryStr = queryString.stringify(query);
        let url = `${URLS.EXTERNAL_APP}?${queryStr}`;
        this.props.history.push(url);
    }

    handleSearchStr = (event: React.ChangeEvent<HTMLInputElement>): void => {
        let str = event.target.value || "";
        str = str.toLowerCase();
        this.setState({ searchQuery: str });
    }

    handleSelectedCluster = () => {
        let url = this.props.match.url
        let selected = this.state.selectedCluster
        let clusterId = selected.map((e) => { return e.value }).join(",");
        let searchParams = new URLSearchParams(this.props.location.search);
        let namespace = searchParams.get(QueryParams.Namespace);
        let appStore = searchParams.get(QueryParams.Appstore)
        let qs = `${QueryParams.Cluster}=${clusterId}`;
        if (namespace) { qs = `${qs}&${QueryParams.Cluster}=${namespace}` };
        if (appStore) { qs = `${qs}&${QueryParams.Appstore}=${appStore}` };
        this.props.history.push(`${url}?${qs}`);
    }

    handleSelectedNamespace = () => {
        let url = this.props.match.url
        let selected = this.state.selectedNamespace
        let namespaceId = selected.map((e) => { return e.value }).join(",");
        let searchParams = new URLSearchParams(this.props.location.search);
        let cluster = searchParams.get(QueryParams.Cluster);
        let appStore = searchParams.get(QueryParams.Appstore)
        let qs = `${QueryParams.Namespace}=${namespaceId}`;
        if (cluster) { qs = `${qs}&${QueryParams.Cluster}=${cluster}` };
        if (appStore) { qs = `${qs}&${QueryParams.Appstore}=${appStore}` };
        this.props.history.push(`${url}?${qs}`);
    }

    handleAppStoreChange(event) {
        event.preventDefault();
        let url = this.props.match.url
        let searchParams = new URLSearchParams(this.props.location.search);
        let cluster = searchParams.get(QueryParams.Cluster);
        let namespace = searchParams.get(QueryParams.Namespace);
        let qs = `${QueryParams.Appstore}=${this.state.searchQuery}`;
        if (cluster) qs = `${qs}&${QueryParams.Cluster}=${cluster}`;
        if (namespace) qs = `${qs}&${QueryParams.Namespace}=${namespace}`;
        this.props.history.push(`${url}?${qs}`);
    }

    clearSearch(event) {
        let url = this.props.match.url
        let searchParams = new URLSearchParams(this.props.location.search);
        let cluster = searchParams.get(QueryParams.Cluster);
        let namespace = searchParams.get(QueryParams.Namespace);
        let qs: string = "";
        if (cluster) qs = `${qs}&${QueryParams.Cluster}=${cluster}`;
        if (namespace) qs = `${qs}&${QueryParams.Namespace}=${namespace}`;
        this.props.history.push(`${url}?${qs}`);
    }

    renderExternalFilters() {
        return <div className="external-list--grid">
            {this.renderExternalSearch()}
            <ExternalFilters cluster={this.state.clusterList}
                namespace={this.state.namespaceList}
                selectedNamespace={this.state.selectedNamespace}
                selectedCluster={this.state.selectedCluster}
                handleSelectedNamespace={this.handleSelectedNamespace}
                handleSelectedCluster={this.handleSelectedCluster}
                setNamespace={this.setNamespace}
                setCluster={this.setCluster}
            />
        </div>
    }

    renderExternalSearch() {
        return <div className="flexbox flex-justify">
            <form onSubmit={this.handleAppStoreChange} className="search position-rel" style={{ flexBasis: "100%" }} >
                <Search className="search__icon icon-dim-18" />
                <input className="search__input bcn-1" type="text"
                    placeholder="Search by app name"
                    value={this.state.searchQuery}
                    onChange={(event) => { this.setState({ searchQuery: event.target.value }); }}
                />
                {this.state.searchApplied ? <button className="search__clear-button" type="button" onClick={this.clearSearch}>
                    <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                </button> : ""}
            </form>
        </div>
    }

    render() {
        return (
            <>
                <div className=" bcn-0 pl-20 pr-20 pt-12 pb-12">
                    {this.renderExternalFilters()}
                </div>
                <ExternalListView
                    code={this.state.code}
                    view={this.state.view}
                    externalList={this.state.externalList}
                    appliedNamespace={this.state.appliedNamespace}
                    appliedCluster={this.state.appliedCluster}
                    pagination={this.state.pagination}
                    changePage={this.changePage}
                    changePageSize={this.changePageSize}
                    removeFilter={this.removeFilter}
                    removeAllFilters={this.removeAllFilters}
                />
            </>
        )
    }
}
export default withRouter(ExternalListContainer)
