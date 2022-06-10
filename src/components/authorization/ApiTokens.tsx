import React, { Fragment, useEffect, useState } from 'react'
import './apiToken.scss'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import GenerateToken from './GenerateToken'
import { getGeneratedAPITokenList } from './service'
import { showError, Progressing, ErrorScreenManager } from '../common'
import EmptyState from '../EmptyState/EmptyState'
import emptyGeneratToken from '../../assets/img/ic-empty-generate-token.png'
import moment from 'moment'
import { Moment12HourFormat } from '../../config'

function ApiTokens() {
    const [showGenerateTokenModal, setShowGenerateToken] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)
    const [loader, setLoader] = useState(false)
    const [tokenList, setTokenlist] = useState([])
    const [errorStatusCode, setErrorStatusCode] = useState(0)

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

    const renderGeneratedTokenButton = (): JSX.Element => {
        return (
            <button onClick={() => setShowGenerateToken(true)} className="add-link cta flex cursor">
                Generetae new token
            </button>
        )
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

    const renderChartList = (): JSX.Element => {
        return (
            <Fragment>
                {!showGenerateTokenModal && (
                    <div className="api-token__container">
                        <div className="cn-9 fw-6 fs-16">API tokens</div>
                        <p className="fs-13 fw-4">
                            Tokens you have generated that can be used to access the Devtron API.
                        </p>
                        <div className="flex content-space">
                            {renderGeneratedTokenButton()}
                            {renderSearchToken()}
                        </div>
                        <div className="mt-16 en-2 bw-1 bcn-0 br-8" style={{ minHeight: 'calc(100vh - 235px)' }}>
                            <div className="api-list-row fw-6 cn-7 fs-12 border-bottom pt-10 pb-10 pr-20 pl-20 text-uppercase">
                                <div></div>
                                <div>Name</div>
                                <div>Last Used On</div>
                                <div>Ip address</div>
                                <div>Expires on</div>
                            </div>
                            {tokenList?.map((list) => (
                                <div className="api-list-row fw-4 cn-9 fs-13 border-bottom-n1 pt-14 pb-14 pr-20 pl-20">
                                    <div></div>
                                    <div className="flexbox">{list.name}</div>
                                    <div className="ellipsis-right">
                                        {moment(list.lastUsedAt).format(Moment12HourFormat)}
                                    </div>
                                    <div>{list.userIdentifier}</div>
                                    <div>{list.expireAtInMs}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {showGenerateTokenModal && <GenerateToken />}
            </Fragment>
        )
    }
    if (loader) {
        return <Progressing />
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
                <EmptyState.Button>{renderGeneratedTokenButton()}</EmptyState.Button>
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

    if (tokenList.length === 0) {
        return renderEmptyNotAuthorized()
    }

    return <div className="h-100">{tokenList.length === 0 ? renderEmptyState() : renderChartList()}</div>
}

export default ApiTokens
