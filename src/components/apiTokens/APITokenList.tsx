import moment from 'moment'
import React, { useState } from 'react'
import { MomentDateFormat } from '../../config'
import { ReactComponent as Key } from '../../assets/icons/ic-key-bulb.svg'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as Trash } from '../../assets/icons/ic-delete-interactive.svg'
import { useHistory } from 'react-router-dom'
import { APITokenListType, TokenListType } from './authorization.type'
import { getDateInMilliseconds } from './authorization.utils'
import DeleteAPITokenModal from './DeleteAPITokenModal'
import './apiToken.scss'

function APITokenList({ tokenList, renderSearchToken, reload }: APITokenListType) {
    const history = useHistory()
    const [showDeleteConfirmation, setDeleteConfirmation] = useState(false)
    const [selectedToken, setSelectedToken] = useState<TokenListType>()

    const handleGenerateRowActionButton = (key: 'create' | 'edit', id?) => {
        history.push(id ? `${key}/${id}` : key)
    }

    const isTokenExpired = (expiredDate: number): boolean => {
        return getDateInMilliseconds(new Date().valueOf()) > getDateInMilliseconds(expiredDate)
    }

    return (
        <div>
            <div className="cn-9 fw-6 fs-16">API tokens</div>
            <p className="fs-13 fw-4">Tokens you have generated that can be used to access the Devtron API.</p>
            <div className="flex content-space">
                <button className="cta" onClick={() => handleGenerateRowActionButton('create')}>
                    Generate new token
                </button>
                {renderSearchToken()}
            </div>
            <div
                className="mt-16 en-2 bw-1 bcn-0 br-8"
                style={{ minHeight: 'calc(100vh - 235px)', overflow: 'hidden' }}
            >
                <div className="api-list-row fw-6 cn-7 fs-12 border-bottom pt-10 pb-10 pr-20 pl-20 text-uppercase">
                    <div></div>
                    <div>Name</div>
                    <div>Last Used On</div>
                    <div>Ip address</div>
                    <div>Expires on</div>
                    <div></div>
                </div>
                {tokenList?.map((list, index) => (
                    <div
                        key={`api_${index}`}
                        className="api-list-row flex-align-center fw-4 cn-9 fs-13 pr-20 pl-20"
                        style={{ height: '45px' }}
                    >
                        <button
                            type="button"
                            className="transparent cursor flex"
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
                            {list.name}
                        </div>
                        <div className="ellipsis-right">{moment(list.lastUsedAt).format(MomentDateFormat)}</div>
                        <div>{list.lastUsedByIp}</div>
                        <div className={`${isTokenExpired(list.expireAtInMs) ? 'cr-5' : ''}`}>
                            {isTokenExpired(list.expireAtInMs) ? 'Expired on ' : ''}
                            {moment(list.expireAtInMs).format(MomentDateFormat)}
                        </div>
                        <div className="api__row-actions flex">
                            <button
                                type="button"
                                className="transparent mr-8 ml-8"
                                onClick={() => handleGenerateRowActionButton('edit', list.id)}
                            >
                                <Edit className="icon-dim-20" />
                            </button>
                            <button
                                type="button"
                                className="transparent"
                                onClick={() => {
                                    setSelectedToken(list)
                                    setDeleteConfirmation(true)
                                }}
                            >
                                <Trash className="scn-6 icon-dim-20" />
                            </button>
                        </div>
                    </div>
                ))}
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
