import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useRouteMatch } from 'react-router'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg'
import { ReactComponent as EnvIcon } from '../../../assets/icons/ic-environment.svg'
import EnvEmptyStates from '../EnvEmptyStates'
import './EnvironmentsList.scss'
import PageHeader from '../../common/header/PageHeader'
import { Progressing } from '../../common'

export default function EnvironmentsList() {
    const match = useRouteMatch()
    const [loader, setLoader] = useState(false)
    const [noResults, setNoResults] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [filteredEnvList, setFilteredEnvList] = useState([])
    const [searchApplied, setSearchApplied] = useState(false)
    const [envList, setEnvList] = useState([])

    const getData = () => {
        setLoader(true)
        setEnvList([])
        setLoader(false)
    }

    useEffect(() => {
        getData()
    }, [])

    const handleFilterChanges = (_searchText: string): void => {
        const _filteredData = envList.filter((env) => env.name.indexOf(_searchText) >= 0)
        setFilteredEnvList(_filteredData)
        setNoResults(_filteredData.length === 0)
    }

    const clearSearch = (): void => {
        if (searchApplied) {
            handleFilterChanges('')
            setSearchApplied(false)
        }
        setSearchText('')
    }

    const handleFilterKeyPress = (event): void => {
        const theKeyCode = event.key
        if (theKeyCode === 'Enter') {
            handleFilterChanges(event.target.value)
            setSearchApplied(true)
        } else if (theKeyCode === 'Backspace' && searchText.length === 1) {
            clearSearch()
        }
    }

    const renderSearch = (): JSX.Element => {
        return (
            <div className="search dc__position-rel margin-right-0 en-2 bw-1 br-4 h-32">
                <Search className="search__icon icon-dim-18" />
                <input
                    type="text"
                    placeholder="Search env"
                    value={searchText}
                    className="search__input"
                    onChange={(event) => {
                        setSearchText(event.target.value)
                    }}
                    onKeyDown={handleFilterKeyPress}
                />
                {searchApplied && (
                    <button className="search__clear-button" type="button" onClick={clearSearch}>
                        <Clear className="icon-dim-18 icon-n4 dc__vertical-align-middle" />
                    </button>
                )}
            </div>
        )
    }

    if (loader) {
        return <Progressing pageLoader />
    }

    return (
        <div>
            <PageHeader headerName="Environments" />
            <div className={`env-list bcn-0 ${noResults ? 'no-result-container' : ''}`}>
                <div className="flexbox dc__content-space pl-20 pr-20 pt-16 pb-16">{renderSearch()}</div>
                {noResults ? (
                    <EnvEmptyStates actionHandler={clearSearch} />
                ) : (
                    <div className="dc__overflow-scroll" style={{ height: `calc(100vh - 125px)` }}>
                        <div className="env-list-row fw-6 cn-7 fs-12 dc__border-bottom pt-8 pb-8 pr-20 pl-20 dc__uppercase">
                            <div></div>
                            <div>Environments</div>
                            <div>Namespace</div>
                            <div>Cluster</div>
                            <div>Applications</div>
                        </div>
                        {filteredEnvList?.map((envData) => (
                            <div className="env-list-row fw-4 cn-9 fs-13 dc__border-bottom-n1 pt-12 pb-12 pr-20 pl-20 ">
                                <EnvIcon className="icon-dim-20" />
                                <div className="cb-5 dc__ellipsis-right">
                                    <NavLink to={`${match.url}/${envData.id}`}>{envData.name}</NavLink>
                                </div>
                                <div>{envData.namespace}</div>
                                <div>{envData.cluster}</div>
                                <div>{envData.applications}</div>
                            </div>
                        ))}
                        <div className="env-list-row fw-4 cn-9 fs-13 dc__border-bottom-n1 pt-12 pb-12 pr-20 pl-20 ">
                            <EnvIcon className="icon-dim-20" />
                            <div className="cb-5 dc__ellipsis-right">
                                <NavLink to={`${match.url}/2`}>devtron-demo1</NavLink>
                            </div>
                            <div>devtron-demo1</div>
                            <div>default_cluster</div>
                            <div>10</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
