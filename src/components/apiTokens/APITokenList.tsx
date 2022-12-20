import moment from 'moment'
import React, { useState } from 'react'
import { MomentDateFormat } from '../../config'
import { ReactComponent as Key } from '../../assets/icons/ic-key-bulb.svg'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as Trash } from '../../assets/icons/ic-delete-interactive.svg'
import { useHistory } from 'react-router-dom'
import { APITokenListType, TokenListType } from './authorization.type'
import { isTokenExpired } from './authorization.utils'
import DeleteAPITokenModal from './DeleteAPITokenModal'
import NoResults from '../../assets/img/empty-noresult@2x.png'
import './apiToken.scss'
import EmptyState from '../EmptyState/EmptyState'
import { API_LIST_MESSAGING } from './constants'
import { EmptyStateMessaging } from '../../config/constantMessaging'

function NoMatchingResults() {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={NoResults} width="250" height="200" alt={EmptyStateMessaging.NoMatchingResults} />
            </EmptyState.Image>
            <EmptyState.Title>
                <h2 className="fs-16 fw-4 c-9">{EmptyStateMessaging.NoMatchingResults}</h2>
            </EmptyState.Title>
            <EmptyState.Subtitle>{EmptyStateMessaging.NoMatchingTokens}</EmptyState.Subtitle>
        </EmptyState>
    )
}

function APITokenList({ tokenList, renderSearchToken, reload }: APITokenListType) {
    const history = useHistory()
    const [showDeleteConfirmation, setDeleteConfirmation] = useState(false)
    const [selectedToken, setSelectedToken] = useState<TokenListType>()

    const handleGenerateRowActionButton = (key: 'create' | 'edit', id?) => {
        history.push(id ? `${key}/${id}` : key)
    }

    const handleDeleteButton = (tokenList) => {
        setSelectedToken(tokenList)
        setDeleteConfirmation(true)
    }
    return (
        <div>
            <div className="cn-9 fw-6 fs-16">{API_LIST_MESSAGING.API_TOKEN_TITLE}</div>
            <p className="fs-12 fw-4">{API_LIST_MESSAGING.API_TOKEN_SUBTITLE}</p>
            <div className="flex dc__content-space mb-16">
                <button className="flex cta h-32" onClick={() => handleGenerateRowActionButton('create')}>
                    {API_LIST_MESSAGING.API_TOKEN_BUTTON}
                </button>
                {renderSearchToken()}
            </div>
            <div className="api-token__list en-2 bw-1 bcn-0 br-8">
                <div className="api-list-row fw-6 cn-7 fs-12 dc__border-bottom pt-10 pb-10 pr-20 pl-20 dc__uppercase">
                    <div></div>
                    <div>{API_LIST_MESSAGING.ROW_NAME}</div>
                    <div>{API_LIST_MESSAGING.ROW_LAST_USED}</div>
                    <div>{API_LIST_MESSAGING.ROW_LAST_USED_BY_IP}</div>
                    <div>{API_LIST_MESSAGING.ROW_EXPIRES_ON}</div>
                    <div></div>
                </div>
                {!tokenList || tokenList.length === 0 ? (
                    <NoMatchingResults />
                ) : (
                    tokenList.map((list, index) => (
                        <div
                            key={`api_${index}`}
                            className="api-list-row flex-align-center fw-4 cn-9 fs-13 pr-20 pl-20"
                            style={{ height: '45px' }}
                        >
                            <button
                                type="button"
                                className="dc__transparent cursor flex"
                                onClick={() => handleGenerateRowActionButton('edit', list.id)}
                            >
                                <Key
                                    className={`api-key-icon icon-dim-20 ${
                                        isTokenExpired(list.expireAtInMs) ? 'api-key-expired-icon' : ''
                                    }`}
                                />
                            </button>
                            <div
                                className={`flexbox cb-5 cursor`}
                                onClick={() => handleGenerateRowActionButton('edit', list.id)}
                            >
                                <span className="dc__ellipsis-right">{list.name}</span>
                            </div>
                            <div className="dc__ellipsis-right">
                                {list.lastUsedAt ? moment(list.lastUsedAt).format(MomentDateFormat) : 'Never used'}
                            </div>
                            <div>{list.lastUsedByIp ? list.lastUsedByIp : '-'}</div>
                            <div className={`${isTokenExpired(list.expireAtInMs) ? 'cr-5' : ''}`}>
                                {list.expireAtInMs === 0 ? (
                                    'No expiration date'
                                ) : (
                                    <>
                                        {isTokenExpired(list.expireAtInMs) ? 'Expired on ' : ''}
                                        {moment(list.expireAtInMs).format(MomentDateFormat)}
                                    </>
                                )}
                            </div>
                            <div className="api__row-actions flex right">
                                <button
                                    type="button"
                                    className="dc__transparent mr-18"
                                    onClick={() => handleGenerateRowActionButton('edit', list.id)}
                                >
                                    <Edit className="icon-dim-20" />
                                </button>
                                <button type="button" className="dc__transparent" onClick={() => handleDeleteButton(list)}>
                                    <Trash className="scn-6 icon-dim-20" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
                {showDeleteConfirmation && selectedToken && (
                    <DeleteAPITokenModal
                        tokenData={selectedToken}
                        reload={reload}
                        setDeleteConfirmation={setDeleteConfirmation}
                    />
                )}
            </div>
        </div>
    )
}

export default APITokenList
