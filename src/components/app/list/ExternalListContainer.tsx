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

const QueryParams = {
    Cluster: "cluster",
    Namespace: "namespace",
    Appstore: "appstore"
}

export default class ExternalListContainer extends Component<ExternalListContainerProps, ExternalListContainerState> {

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
        }
    }

    componentDidMount() {
        getExternalApplistInitData().then((response) => {
            this.setState({
                namespaceList: response.result.namespaceList,
                clusterList: response.result.clusterList,
                namespaceHashmap: response.result.namespaceHashmap,
                clusterHashmap: response.result.clusterHashmap,
            })
        }).catch((error) => {
            showError(error);
        })

        getExternalList().then((response) => {
            this.setState({
                externalList: response.result,
                view: ViewType.FORM
            })
        }).catch((error) => {
            showError(error);
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.location.search !== this.props.location.search) {
            this.initialiseFromQueryParams();
        }
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
        }, () => {
            this.setState({ view: ViewType.LOADING });
            getExternalList()
            this.setState({ view: ViewType.FORM });
        })
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

    setNamespace = (selected) => {
        this.setState({ selectedNamespace: selected })
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

    setCluster = (selected) => {
        this.setState({
            selectedCluster: selected
        })
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
            <form onSubmit={(e) => this.handleAppStoreChange(e)} className="search position-rel" style={{ flexBasis: "100%" }} >
                <Search className="search__icon icon-dim-18" />
                <input className="search__input bcn-1" type="text"
                    placeholder="Search by app name"
                    value={this.state.searchQuery}
                    onChange={(event) => { this.setState({ searchQuery: event.target.value }); }}
                />
                {this.state.searchApplied ? <button className="search__clear-button" type="button" onClick={(e) => this.clearSearch(e)}>
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
                    removeFilter={this.removeFilter}
                    removeAllFilters={this.removeAllFilters}
                />
                {/* Comented out for the time being */}
                {/* <ExternalSearchQueryList {...this.props}
                   view={this.state.view}
                   externalQueryList={this.state.externalQueryList}
                   filters={this.state.filters}
                   appliedNamespace={this.state.appliedNamespace}
                   appliedCluster={this.state.appliedCluster}
                    />
                */}
            </>
        )
    }
}
