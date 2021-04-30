import React, { Component } from 'react'
import Select, { components } from 'react-select';
import './list.css';
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg';
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg';
import { Option, multiSelectStyles } from '../../common';
import { ExternalListContainerState, ExternalListContainerProps } from './types'
import { getExternalList, getNamespaceList, getClusterList, getExternalSearchQueryList } from './External.service'
import { showError } from '../../../components/common';
import { ViewType } from '../../../config';
import ExternalDefaultList from './ExternalDefaultList';
import { ValueContainer, DropdownIndicator } from './external.util';
import ExternalSearchQueryList from './ExternalSearchQueryList' //Not using for the time being

const QueryParams = {
    Cluster: "cluster",
    Namespace: "namespace",
    Appstore: "appstore"
}

export default class ExternalListContainer extends Component<ExternalListContainerProps, ExternalListContainerState> {

    constructor(props) {
        super(props)

        this.state = {
            view: ViewType.LOADING,
            code: 0,
            loadingData: false,
            externalList: [],
            externalQueryList: [],
            filters: {
                namespace: [],
                cluster: [],
            },
            selectedNamespace: [],
            selectedCluster: [],
            appliedCluster: [],
            appliedNamespace: [],
            searchQuery: "",
            searchApplied: false,
        }
    }

    componentDidMount() {
        getExternalList().then((response) => {
            this.setState({
                externalList: response,
                view: ViewType.FORM
            })
        }).catch((error) => {
            showError(error);
        })

        getExternalSearchQueryList().then((response) => {
            this.setState({
                externalQueryList: response
            })
        })

        getNamespaceList().then((response) => {
            let data = response
            let namespaceList = data?.map((list) => {
                return {
                    label: list.label,
                    key: list.key,
                    isSaved: list.isSaved,
                    isChecked: list.isChecked
                }
            })
            this.setState({
                filters: {
                    namespace: namespaceList,
                    cluster: this.state.filters.cluster
                }
            })
        }).catch((error) => {
            showError(error);
        })

        getClusterList().then((response) => {
            let data = response
            let clusterList = data?.map((list) => {
                return {
                    label: list.label,
                    key: list.key,
                    isSaved: list.isSaved,
                    isChecked: list.isChecked
                }
            })
            this.setState({
                ...this.state,
                filters: {
                    namespace: this.state.filters.namespace,
                    cluster: clusterList
                }
            })
        }).catch((error) => {
            showError(error);
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.location.search !== this.props.location.search) {
            this.initialiseFromQueryParams(this.state.filters.cluster, this.state.filters.namespace, this.props.location.search);
        }
    }

    initialiseFromQueryParams = (clusterList, namespaceList, searchString) => {
        let searchParams = new URLSearchParams(searchString);
        let appNameSearch: string = searchParams.get(QueryParams.Appstore);
        let cluster: string = searchParams.get(QueryParams.Cluster);
        let namespace: string = searchParams.get(QueryParams.Namespace);
        let clusterIdArray = [];
        let namespaceIdArray = [];

        if (cluster) {
            clusterIdArray = cluster.split(",")
        };

        if (namespace) {
            namespaceIdArray = namespace.split(",")
        }

        clusterIdArray = clusterIdArray.map((clusterId => parseInt(clusterId)));
        namespaceIdArray = namespaceIdArray.map((namespaceId) => parseInt(namespaceId));

        let selectedClusterList = [];
        for (let i = 0; i < clusterIdArray.length; i++) {
            let clusterValue = clusterList.find(item => item.value === clusterIdArray[i]);
            if (clusterValue) {
                selectedClusterList.push(clusterValue);
            }
        }
        let selectedNamespace = [];
        for (let i = 0; i < namespaceIdArray.length; i++) {
            let namespaceValue = namespaceList.find(item => item.value === namespaceIdArray[i]);
            if (namespaceValue) {
                selectedNamespace.push(namespaceValue)
            }
        }

        this.setState({
            searchApplied: appNameSearch ? true : false,
            searchQuery: appNameSearch ? appNameSearch : "",
            appliedCluster: this.state.selectedCluster,
            appliedNamespace: this.state.selectedNamespace
        }, () => {{console.log(this.state.appliedCluster)}
            this.setState({ loadingData: true })
            getExternalList()
            this.setState({ loadingData: false })
        }
        )
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
        let appliedCluster = this.state.appliedCluster
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

    renderExternalSearch() {
        return <div className="flexbox flex-justify">
            <form onSubmit={(e) => this.handleAppStoreChange(e)} className="search position-rel" style={{ flexBasis: "100%" }} >
                <Search className="search__icon icon-dim-18" />
                <input className="search__input bcn-1" type="text" placeholder="Search by app name"
                    value={this.state.searchQuery}
                    onChange={(event) => { this.setState({ searchQuery: event.target.value }); }}
                />
                {this.state.searchApplied ? <button className="search__clear-button" type="button" onClick={(e) => this.clearSearch(e)}>
                    <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                </button> : ""}
            </form>
        </div>
    }

    setCluster = (selected) => {
        this.setState({
            selectedCluster: selected
        })
    }

    renderExternalFilters() {
        return <div className="external-list--grid">
            {this.renderExternalSearch()}
            <ExternalFilters
                handleSelectedNamespace={this.handleSelectedNamespace}
                handleSelectedCluster={this.handleSelectedCluster}
                cluster={this.state.filters.cluster}
                namespace={this.state.filters.namespace}
                selectedNamespace={this.state.selectedNamespace}
                setNamespace={this.setNamespace}
                selectedCluster={this.state.selectedCluster}
                setCluster={this.setCluster}
            />
        </div>
    }

    render() {
        return (<>
            <div className=" bcn-0 pl-20 pr-20 pt-12 pb-12">
                {this.renderExternalFilters()}
            </div>
            <ExternalDefaultList {...this.props}
                view={this.state.view}
                externalList={this.state.externalList}
                filters={this.state.filters}
                appliedNamespace={this.state.appliedNamespace}
                appliedCluster={this.state.appliedCluster}
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

function ExternalFilters({ handleSelectedCluster, handleSelectedNamespace, cluster, namespace, selectedNamespace, setNamespace, selectedCluster, setCluster }) {
    const MenuList = (props) => {
        let name = props.selectProps.name
        return (
            <components.MenuList {...props}>
                {props.children}
                <div className="chartListApplyFilter flex bcn-0 pt-10 pb-10">
                    <button type="button" style={{ width: "92%" }} className="cta flex cta--chart-store"
                        disabled={false}
                        onClick={(event) => { name === "cluster" ? handleSelectedCluster(event) : handleSelectedNamespace(event) }}
                    >Apply Filter</button>
                </div>
            </components.MenuList>
        );
    };
    return <>
        <Select className="cn-9 fs-13"
            placeholder="Cluster: All"
            name="cluster"
            options={cluster?.map((env) => ({ label: env.label, value: env.key }))}
            components={{
                Option,
                MenuList,
                ValueContainer,
                DropdownIndicator,
                IndicatorSeparator: null,
            }}
            onChange={(selected: any) => setCluster(selected)}
            isMulti
            value={selectedCluster}
            hideSelectedOptions={false}
            closeMenuOnSelect={false}
            isClearable={false}
            styles={multiSelectStyles}
        />
        <Select className="cn-9 fs-14"
            placeholder="Namespace: All"
            options={namespace?.map((env) => ({ label: env.label, value: env.key }))}
            onChange={(selected: any) => setNamespace(selected)}
            value={selectedNamespace}
            name="namespace"
            components={{
                Option,
                MenuList,
                ValueContainer,
                IndicatorSeparator: null,
                DropdownIndicator,
            }}
            isClearable={false}
            isMulti
            hideSelectedOptions={false}
            closeMenuOnSelect={false}
            styles={{ ...multiSelectStyles }}
        />
    </>
}
