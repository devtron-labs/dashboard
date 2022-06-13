import React, { Fragment, useEffect, useState } from 'react'
import './apiToken.scss'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { getGeneratedAPITokenList } from './service'
import { showError, Progressing, ErrorScreenManager, ConfirmationDialog } from '../common'
import EmptyState from '../EmptyState/EmptyState'
import emptyGeneratToken from '../../assets/img/ic-empty-generate-token.png'
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom'
import APITokenList from './APITokenList'
import CreateAPIToken from './CreateAPIToken'
import EditAPIToken from './EditAPIToken'
import { FormType, TokenResponseType } from './authorization.type'

function ApiTokens() {
    const history = useHistory()
    const { url, path } = useRouteMatch()
    const [searchText, setSearchText] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)
    const [loader, setLoader] = useState(false)
    const [tokenList, setTokenlist] = useState([])
    const [errorStatusCode, setErrorStatusCode] = useState(0)
    const [deleteConfirmation, setDeleteConfirmation] = useState(false)
    const [showEditToken, setShowEditToken] = useState(false)
    const [showGenerateModal, setShowGenerateModal] = useState(false)
    const [showRegenerateTokenModal, setShowRegenerateTokenModal] = useState(false)
    const [selectedExpirationDate, setSelectedExpirationDate] = useState<{ label: string; value: number }>({
        label: '',
        value: 0,
    })
    const [formData, setFormData] = useState<FormType>({
        name: '',
        description: '',
        expireAtInMs: undefined,
    })

    const [tokenResponse, setTokenResponse] = useState<TokenResponseType>({
        success: false,
        token: '',
        userId: 0,
        userIdentifier: 'API-TOKEN:test',
    })

    useEffect(() => {
        getData()
    }, [])

    const getData = (): void => {
        setLoader(true)
        getGeneratedAPITokenList()
            .then((response) => {
                if (response.result) {
                    setTokenlist(response.result)
                }
                setLoader(false)
            })
            .catch((error) => {
                showError(error)
                setErrorStatusCode(error.code)
                setLoader(false)
            })
    }

    const handleGenerateRowActionButton = (key: 'create' | 'edit') => {
        history.push(key)
    }

    const handleFilterChanges = (selected, key): void => {}

    const renderSearchToken = () => {
        return (
            <div className="flexbox content-space">
                <form
                    onSubmit={(e) => handleFilterChanges(e, 'search')}
                    className="search position-rel margin-right-0 en-2 bw-1 br-4"
                >
                    <Search className="search__icon icon-dim-18" />
                    <input
                        type="text"
                        placeholder="Search charts"
                        value={searchText}
                        className="search__input bcn-0"
                        onChange={(event) => {
                            setSearchText(event.target.value)
                        }}
                    />
                    {searchApplied ? (
                        <button
                            className="search__clear-button"
                            type="button"
                            onClick={(e) => handleFilterChanges(e, 'clear')}
                        >
                            <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                        </button>
                    ) : null}
                </form>
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
                <div className="api-token__container">
                    <Switch>
                        {/* <Redirect to={`${path}/api/list`} /> */}
                        <Route
                            path={`${path}/list`}
                            render={(props) => (
                                <APITokenList
                                    tokenList={tokenList}
                                    setShowEditToken={setShowEditToken}
                                    setDeleteConfirmation={setDeleteConfirmation}
                                    renderSearchToken={renderSearchToken}
                                    handleGenerateRowActionButton={handleGenerateRowActionButton}
                                />
                            )}
                        />
                        <Route
                            path={`${path}/create`}
                            render={(props) => (
                                <CreateAPIToken
                                    setShowGenerateModal={setShowGenerateModal}
                                    showGenerateModal={showGenerateModal}
                                    handleGenerateTokenActionButton={handleActionButton}
                                    setSelectedExpirationDate={setSelectedExpirationDate}
                                    selectedExpirationDate={selectedExpirationDate}
                                    formData={formData}
                                    setFormData={setFormData}
                                    tokenResponse={tokenResponse}
                                    setTokenResponse={setTokenResponse}
                                />
                            )}
                        />
                        <Route
                            path={`${path}/edit`}
                            render={(props) => (
                                <EditAPIToken
                                    handleRegenerateActionButton={handleActionButton}
                                    setShowRegeneratedModal={setShowRegenerateTokenModal}
                                    showRegeneratedModal={showRegenerateTokenModal}
                                    setSelectedExpirationDate={setSelectedExpirationDate}
                                    selectedExpirationDate={selectedExpirationDate}
                                    formData={formData}
                                    setFormData={setFormData}
                                />
                            )}
                        />
                    </Switch>
                </div>
            </Fragment>
        )
    }

    const renderEmptyState = (): JSX.Element => {
        return (
            <EmptyState>
                <EmptyState.Image>
                    <img src={emptyGeneratToken} alt="Empty api token links" />
                </EmptyState.Image>
                <EmptyState.Title>
                    <h4 className="title">Generate a token to access the Devtron API</h4>
                </EmptyState.Title>
                <EmptyState.Subtitle>
                    API tokens function like ordinary OAuth access tokens. They can be used instead of a password for
                    Git over HTTPS, or can be used to authenticate to the API over Basic Authentication.
                </EmptyState.Subtitle>
                {/* <EmptyState.Button>{handleGenerateRowActionButton('create')}</EmptyState.Button> */}
            </EmptyState>
        )
    }

    const renderEmptyNotAuthorized = () => {
        return (
            <EmptyState>
                <EmptyState.Image>
                    <img src={emptyGeneratToken} alt="Empty api token links" />
                </EmptyState.Image>
                <EmptyState.Title>
                    <h4 className="title">Not authorized</h4>
                </EmptyState.Title>
                <EmptyState.Subtitle>
                    Information on this page is available only to superadmin users.
                </EmptyState.Subtitle>
            </EmptyState>
        )
    }

    if (loader) {
        return <Progressing pageLoader />
    }
    if (errorStatusCode > 0) {
        return (
            <div className="error-screen-wrapper flex column h-100">
                <ErrorScreenManager
                    code={errorStatusCode}
                    subtitle="Information on this page is available only to superadmin users."
                />
            </div>
        )
    }
    if (tokenList.length === 0) {
        return renderEmptyNotAuthorized()
    }

    return (
        <div>{tokenList.length === 0 ? <div className="h-100">{renderEmptyState()}</div> : renderAPITokenRoutes()}</div>
    )
}

export default ApiTokens
