/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useState } from 'react'
import './apiToken.scss'
import { showError, Progressing, ErrorScreenManager, GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { Redirect, Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import emptyGeneratToken from '@Images/ic-empty-generate-token.png'
import { EMPTY_STATE_STATUS } from '@Config/constantMessaging'
import { ReactComponent as Search } from '@Icons/ic-search.svg'
import { ReactComponent as Clear } from '../../../../assets/icons/ic-error.svg'
import { getGeneratedAPITokenList } from './service'
import APITokenList from './APITokenList'
import CreateAPIToken from './CreateAPIToken'
import EditAPIToken from './EditAPIToken'
import { TokenListType, TokenResponseType } from './apiToken.type'

const ApiTokens = () => {
    const { path } = useRouteMatch()
    const history = useHistory()
    const { pathname } = useLocation()
    const [searchText, setSearchText] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)
    const [loader, setLoader] = useState(false)
    const [tokenList, setTokenlist] = useState<TokenListType[]>(undefined)
    const [filteredTokenList, setFilteredTokenList] = useState<TokenListType[]>(undefined)
    const [, setNoResults] = useState(false)
    const [errorStatusCode, setErrorStatusCode] = useState(0)
    const [showGenerateModal, setShowGenerateModal] = useState(false)
    const [showRegenerateTokenModal, setShowRegenerateTokenModal] = useState(false)
    const [selectedExpirationDate, setSelectedExpirationDate] = useState<{ label: string; value: number }>({
        label: '30 days',
        value: 30,
    })

    const getData = (): void => {
        setLoader(true)
        getGeneratedAPITokenList()
            .then((response) => {
                if (response.result) {
                    const sortedResult = response.result.sort((a, b) => a.name.localeCompare(b.name))
                    setTokenlist(sortedResult)
                    setFilteredTokenList(sortedResult)
                } else {
                    setTokenlist([])
                    setFilteredTokenList([])
                }
                setLoader(false)
            })
            .catch((error) => {
                showError(error, true, true)
                setErrorStatusCode(error.code)
                setLoader(false)
            })
    }

    useEffect(() => {
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
                        data-testid="search-token-input"
                        value={searchText}
                        className={`search__input bcn-0 ${searchApplied ? 'search-applied' : ''}`}
                        onChange={(event) => {
                            setSearchText(event.target.value)
                        }}
                        onKeyDown={handleFilterKeyPress}
                    />
                    {searchApplied && (
                        <button
                            className="flex search__clear-button"
                            type="button"
                            onClick={clearSearch}
                            aria-label="Clear Search"
                        >
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
            <div data-testid="api-token-page" className="api-token-container flexbox-col flex-grow-1">
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
                            reload={getData}
                        />
                    </Route>
                    <Redirect to={`${path}/list`} />
                </Switch>
            </div>
        )
    }

    const redirectToCreate = () => {
        history.push(`${path}/create`)
    }

    const renderGenerateButton = () => {
        return (
            <button className="flex cta h-32" onClick={redirectToCreate} type="button">
                Generate new token
            </button>
        )
    }

    const renderEmptyState = (): JSX.Element => {
        return (
            <GenericEmptyState
                image={emptyGeneratToken}
                title={EMPTY_STATE_STATUS.GENERATE_API_TOKEN.TITLE}
                subTitle={EMPTY_STATE_STATUS.GENERATE_API_TOKEN.SUBTITLE}
                isButtonAvailable
                renderButton={renderGenerateButton}
                classname="flex-grow-1"
            />
        )
    }

    if (loader) {
        return <Progressing data-testid="api-token-page-loading" pageLoader />
    }
    if (errorStatusCode > 0) {
        return (
            <div className="error-screen-wrapper flex column h-100">
                <ErrorScreenManager code={errorStatusCode} />
            </div>
        )
    }
    if (!pathname.includes('/create') && (!tokenList || tokenList.length === 0)) {
        return renderEmptyState()
    }
    return renderAPITokenRoutes()
}

export default ApiTokens
