import React, { Component } from 'react'
import Select, { components } from 'react-select';
import './list.css';
import { ReactComponent as Check } from '../../../assets/icons/ic-check.svg';
import { ReactComponent as Dropdown } from '../../../assets/icons/appstatus/ic-dropdown.svg'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg';
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg';
import { FilterOption, Option, multiSelectStyles } from '../../common';
import { ExternalListContainerState, ExternalListContainerProps } from './types'
import { getExternalList, getNamespaceList, getClusterList, getExternalSearchQueryList } from './External.service'
import { Progressing, showError } from '../../../components/common';
import { ViewType } from '../../../config';
import ExternalDefaultList from './ExternalDefaultList';
import AppListContainer from './AppListContainer';
import { AppListView } from './AppListView';
import { ValueContainer, DropdownIndicator } from './external.util';
import ExternalSearchQueryList from './ExternalSearchQueryList'
import Tippy from '@tippyjs/react';
import { ReactComponent as Question } from '../../../assets/icons/ic-help-outline.svg';

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
            collapsed: false,
            externalList: [],
            externalQueryList: [],
            filters: {
                namespace: [],
                cluster: [],
            },
            selectedNamespace: [],
            selectedCluster: [],
            searchQuery: "",
            searchApplied: false,
            showDevtronAppList: false
        }
        this.toggleHeaderName = this.toggleHeaderName.bind(this);
        this.togglingAppList = this.togglingAppList.bind(this);
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

    // componentDidUpdate(prevProps, prevState) {
    //     if(prevProps.location.search !== this.props.location.search){
    //         this.setState({ loadingData: false })
    //         this.initialiseFromQueryParams(this.state.filters.cluster, this.state.filters.namespace)
    //     }
    // }


    initialiseFromQueryParams = (clusterList, namespaceList) => {
        let searchParams = new URLSearchParams(this.props.location.search);
        let appNameSearch: string = searchParams.get(QueryParams.Appstore);
        let cluster: string = searchParams.get(QueryParams.Cluster);
        let namespace: string = searchParams.get(QueryParams.Namespace);
        let clusterIdArray = [];
        let namespaceIdArray = [];

        if (cluster) {
            clusterIdArray = cluster.split(",")
        };

        if (namespace) {
            namespaceIdArray= namespace.split(",")
        }

        clusterIdArray = clusterIdArray.map((clusterId => parseInt(clusterId)));
        namespaceIdArray =  namespaceIdArray.map((namespaceId)=>parseInt(namespaceId));

        let selectedcluster = [];
        for (let i = 0; i < clusterIdArray.length; i++) {
            let clusterValue = clusterList.find(item => item.value === clusterIdArray[i]);
            if (clusterValue) {
                selectedcluster.push(clusterValue);
            }
        }
        let selectedNamespace = [];
        for ( let i=0; i<namespaceIdArray.length; i++){
            let namespaceValue = namespaceList.find(item => item.value === namespaceIdArray[i]);
            if(namespaceValue){
                selectedNamespace.push(namespaceValue)
            }
        }

        if (selectedcluster || selectedNamespace) {
            this.setState({
            filters:{
                cluster: selectedcluster,
                namespace: selectedNamespace
            }
            })
        }
       
        if (appNameSearch) {
           this.setState({
            searchApplied: true,
            searchQuery: appNameSearch
           })
        } else {
            this.setState({
                searchApplied: false,
                searchQuery: ""
               })
        }
    }

    toggleHeaderName() {
        this.setState({ collapsed: !this.state.collapsed })
    }

    setNamespace = (selected) => {
        this.setState({ selectedNamespace: selected })
    }

    togglingAppList(e) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({ showDevtronAppList: !this.state.showDevtronAppList })
    }

    renderExternalTitle() {
        return <div className="app-header">
            <div className="app-header__title">
                <h1 className="app-header__text flex">External Apps
                <Dropdown onClick={this.toggleHeaderName} className="icon-dim-24 rotate ml-4" style={{ ['--rotateBy' as any]: this.state.collapsed ? '180deg' : '0deg' }} />
                </h1>
                {this.state.collapsed ? <>
                    <div className="app-list-card bcn-0 br-4 en-1 bw-1 pt-8 pr-8 pb-8 pl-8 ">
                        <div onClick={(e) => this.togglingAppList(e)}
                            className="flex left pt-8 pr-8 pb-8 pl-8 cursor">
                            <Check className="scb-5 mr-8 icon-dim-16" />
                            <div >
                                <div className="cn-9 fs-13">Devtron Apps & Charts</div>
                                <div className="cn-5">Apps & charts deployed using Devtron</div>
                            </div>
                        </div>

                    </div>
                </> : ""}
            </div>
        </div>
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

    clearSearch() {
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
                <input className="search__input bcn-1" type="text" placeholder="Search applications"
                    value={this.state.searchQuery}
                    onChange={(event) => { this.setState({ searchQuery: event.target.value }); }}
                />
                {this.state.searchApplied ? <button className="search__clear-button" type="button" onClick={this.clearSearch}>
                    <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                </button> : null}
                <Tippy className="default-tt" arrow={false} placement="top" content={
                    <span style={{ display: "block", width: "160px" }}> Default docker registry is automatically selected while creating an application. </span>}>
                    <Question className="icon-dim-20 fcn-5" />
                </Tippy>
               
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
            {this.state.showDevtronAppList ? <AppListContainer /> :
                <> {this.renderExternalTitle()}
                    <div className=" bcn-0 pl-20 pr-20 pt-12 pb-12">
                        {this.renderExternalFilters()}
                    </div>
                    {/* <ExternalDefaultList {...this.props}
                        view={this.state.view}
                        externalList={this.state.externalList}
                        filters={this.state.filters}
                    /> */}
                    <ExternalSearchQueryList {...this.props}
                        view={this.state.view}
                        externalQueryList={this.state.externalQueryList}
                        filters={this.state.filters}
                    />
                </>}
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
        <Select className="cn-9 fs-14"
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
            styles={{
                ...multiSelectStyles,
                control: (base, state) => ({
                    ...base,
                    border: state.isFocused ? '1px solid #06c' : '1px solid #d6dbdf',
                    boxShadow: 'none',
                    height: '36px',
                }),
            }}
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
            styles={{
                ...multiSelectStyles,
                control: (base, state) => ({
                    ...base,
                    border: state.isFocused ? '1px solid #0066CC' : '1px solid #d6dbdf',
                    boxShadow: 'none',
                    height: '36px',
                    ...base,
                    paddingBottom: "0px"
                }),
            }}
        />
    </>
}
