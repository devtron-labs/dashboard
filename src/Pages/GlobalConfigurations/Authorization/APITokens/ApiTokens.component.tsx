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
import {
    showError,
    Progressing,
    ErrorScreenManager,
    GenericEmptyState,
    SearchBar,
} from '@devtron-labs/devtron-fe-common-lib'
import { Redirect, Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import emptyGeneratToken from '@Images/ic-empty-generate-token.png'
import { EMPTY_STATE_STATUS } from '@Config/constantMessaging'
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
    const [loader, setLoader] = useState(false)
    const [tokenList, setTokenList] = useState<TokenListType[]>(undefined)
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
                    setTokenList(sortedResult)
                    setFilteredTokenList(sortedResult)
                } else {
                    setTokenList([])
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

    const handleFilterKeyPress = (_searchText: string): void => {
        setSearchText(_searchText)
        handleFilterChanges(_searchText)
    }

    const [tokenResponse, setTokenResponse] = useState<TokenResponseType>({
        success: false,
        token: '',
        userId: 0,
        userIdentifier: 'API-TOKEN:test',
    })

    const renderSearchToken = () => (
        <SearchBar
            initialSearchText={searchText}
            containerClassName="dc__mxw-250 flex-grow-1"
            handleEnter={handleFilterKeyPress}
            inputProps={{
                placeholder: 'Search Token',
            }}
            dataTestId="search-token-input"
        />
    )

    const handleActionButton = () => {
        setShowGenerateModal(false)
        setShowRegenerateTokenModal(false)
    }

    const renderAPITokenRoutes = (): JSX.Element => (
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

    const redirectToCreate = () => {
        history.push(`${path}/create`)
    }

    const renderGenerateButton = () => (
        <button className="flex cta h-32" onClick={redirectToCreate} type="button">
            Generate new token
        </button>
    )

    const renderEmptyState = (): JSX.Element => (
        <GenericEmptyState
            image={emptyGeneratToken}
            title={EMPTY_STATE_STATUS.GENERATE_API_TOKEN.TITLE}
            subTitle={EMPTY_STATE_STATUS.GENERATE_API_TOKEN.SUBTITLE}
            isButtonAvailable
            renderButton={renderGenerateButton}
            classname="flex-grow-1"
        />
    )

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
