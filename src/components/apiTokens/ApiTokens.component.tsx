import React, { Fragment, useEffect, useState } from 'react'
import './apiToken.scss'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { getGeneratedAPITokenList } from './service'
import { showError, Progressing, ErrorScreenManager, useAsync } from '../common'
import EmptyState from '../EmptyState/EmptyState'
import emptyGeneratToken from '../../assets/img/ic-empty-generate-token.png'
import { Redirect, Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import APITokenList from './APITokenList'
import CreateAPIToken from './CreateAPIToken'
import EditAPIToken from './EditAPIToken'
import { TokenListType, TokenResponseType } from './authorization.type'

function ApiTokens() {
    const { path } = useRouteMatch()
    const history = useHistory()
    const { pathname } = useLocation()
    const [searchText, setSearchText] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)
    const [loader, setLoader] = useState(false)
    const [tokenList, setTokenlist] = useState<TokenListType[]>(undefined)
    const [filteredTokenList, setFilteredTokenList] = useState<TokenListType[]>(undefined)
    const [noResults, setNoResults] = useState(false)
    const [errorStatusCode, setErrorStatusCode] = useState(0)
    const [showGenerateModal, setShowGenerateModal] = useState(false)
    const [showRegenerateTokenModal, setShowRegenerateTokenModal] = useState(false)
    const [copied, setCopied] = useState(false)
    const [selectedExpirationDate, setSelectedExpirationDate] = useState<{ label: string; value: number }>({
        label: '30 days',
        value: 30,
    })

    const getData = (): void => {
        setLoader(true)
        getGeneratedAPITokenList()
            .then((response) => {
                if (response.result) {
                    const sortedResult = response.result.sort((a, b) => a['name'].localeCompare(b['name']))
                    setTokenlist(sortedResult)
                    setFilteredTokenList(sortedResult)
                } else {
                    setTokenlist([])
                    setFilteredTokenList([])
                }
                setLoader(false)
            })
            .catch((error) => {
                showError(error,true,true)
                setErrorStatusCode(error.code)
                setLoader(false)
            })
    }

    useEffect(() => {
        // TODO: Revisit. Temp check
        if (
            pathname.includes('/devtron-apps') ||
            pathname.includes('/helm-apps') ||
            pathname.includes('/chart-groups')
        ) {
            history.replace(pathname.split('/').slice(0, -1).join('/'))
        }

        getData()
    }, [])

    const handleFilterChanges = (_searchText: string): void => {
        const _searchTextTrimmed = _searchText.trim()
        const _filteredData = tokenList.filter(
            (_tokenData) =>
                _tokenData.name.indexOf(_searchTextTrimmed) >= 0 || _tokenData.token.indexOf(_searchTextTrimmed) >= 0,
        )
        setFilteredTokenList(_filteredData)
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
            setSearchApplied(!!event.target.value)
        } else if (theKeyCode === 'Backspace' && searchText.length === 1) {
            clearSearch()
        }
    }

    const [tokenResponse, setTokenResponse] = useState<TokenResponseType>({
        success: false,
        token: '',
        userId: 0,
        userIdentifier: 'API-TOKEN:test',
    })

    const renderSearchToken = () => {
        return (
            <div className="flexbox dc__content-space">
                <div className="search dc__position-rel en-2 bw-1 br-4 h-32">
                    <Search className="search__icon icon-dim-18" />
                    <input
                        type="text"
                        placeholder="Search Token"
                        value={searchText}
                        className={`search__input bcn-0 ${searchApplied ? 'search-applied' : ''}`}
                        onChange={(event) => {
                            setSearchText(event.target.value)
                        }}
                        onKeyDown={handleFilterKeyPress}
                    />
                    {searchApplied && (
                        <button className="flex search__clear-button" type="button" onClick={clearSearch}>
                            <Clear className="icon-dim-18 icon-n4 dc__vertical-align-middle" />
                        </button>
                    )}
                </div>
            </div>
        )
    }

    const handleActionButton = () => {
        setShowGenerateModal(false)
        setShowRegenerateTokenModal(false)
    }

    const renderAPITokenRoutes = (): JSX.Element => {
        return (
            <Fragment>
                <div className="api-token-container">
                    <Switch>
                        <Route path={`${path}/list`}>
                            <APITokenList
                                tokenList={filteredTokenList}
                                renderSearchToken={renderSearchToken}
                                reload={getData}
                            />
                        </Route>
                        <Route path={`${path}/create`}>
                            <CreateAPIToken
                                setShowGenerateModal={setShowGenerateModal}
                                showGenerateModal={showGenerateModal}
                                handleGenerateTokenActionButton={handleActionButton}
                                setSelectedExpirationDate={setSelectedExpirationDate}
                                selectedExpirationDate={selectedExpirationDate}
                                tokenResponse={tokenResponse}
                                setTokenResponse={setTokenResponse}
                                reload={getData}
                            />
                        </Route>
                        <Route path={`${path}/edit/:id`}>
                            <EditAPIToken
                                handleRegenerateActionButton={handleActionButton}
                                setShowRegeneratedModal={setShowRegenerateTokenModal}
                                showRegeneratedModal={showRegenerateTokenModal}
                                setSelectedExpirationDate={setSelectedExpirationDate}
                                selectedExpirationDate={selectedExpirationDate}
                                tokenList={tokenList}
                                setCopied={setCopied}
                                copied={copied}
                                reload={getData}
                            />
                        </Route>
                        <Redirect to={`${path}/list`} />
                    </Switch>
                </div>
            </Fragment>
        )
    }

    const redirectToCreate = () => {
        history.push(`${path}/create`)
    }

    const renderEmptyState = (): JSX.Element => {
        return (
            <div className="flex column h-100">
                <EmptyState>
                    <EmptyState.Image>
                        <img src={emptyGeneratToken} alt="Empty api token links" />
                    </EmptyState.Image>
                    <EmptyState.Title>
                        <h4 className="title">Generate a token to access the Devtron API</h4>
                    </EmptyState.Title>
                    <EmptyState.Subtitle>
                        API tokens are like ordinary OAuth access tokens. They can be used instead of username and
                        password for programmatic access to API.
                    </EmptyState.Subtitle>
                    <EmptyState.Button>
                        <button className="flex cta h-32" onClick={redirectToCreate}>
                            Generate new token
                        </button>
                    </EmptyState.Button>
                </EmptyState>
            </div>
        )
    }

    if (loader) {
        return <Progressing pageLoader />
    } else if (errorStatusCode > 0) {
        return (
            <div className="error-screen-wrapper flex column h-100">
                <ErrorScreenManager
                    code={errorStatusCode}
                    subtitle="Information on this page is available only to superadmin users."
                />
            </div>
        )
    } else if (!pathname.includes('/create') && (!tokenList || tokenList.length === 0)) {
        return renderEmptyState()
    }
    return renderAPITokenRoutes()
}

export default ApiTokens
