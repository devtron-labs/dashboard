/*
 * Copyright (c) 2024. Devtron Inc.
 */

import React from 'react'
import { ClipboardButton } from '@Common/index'
import { ReactComponent as ICInfoOutline } from '@Icons/ic-info-outlined.svg'
import { IndexedTextDisplayPropsType } from '../types'

const EmptyState: React.FC<{ href: string }> = ({ href }) => (
    <div className="flex flex-grow-1">
        <div className="flexbox-col dc__gap-8 dc__align-items-center fs-13 fw-6">
            <ICInfoOutline className="icon-dim-24 fcn-3" />
            <span>Code snippet is not available</span>
            {href && (
                <a href={href} rel="noopener noreferrer" target="_blank">
                    Go to file
                </a>
            )}
        </div>
    </div>
)

const IndexedTextDisplay: React.FC<IndexedTextDisplayPropsType> = ({ title, lines, link }) => (
    <div className="flexbox-col dc__align-self-stretch bcn-0 dc__outline dc__border-radius-4-imp">
        <div className="flexbox pt-8 pb-8 pl-12 pr-12 dc__align-items-center dc__align-self-stretch dc__gap-4 dc__border-bottom-n1 bc-n50 dc__ff-monospace">
            {link ? (
                <a className="dc__ff-monospace" href={link} target="_blank" rel="noreferrer">
                    {title}
                </a>
            ) : (
                <span className="dc__ff-monospace">{title}</span>
            )}
            <ClipboardButton content={title} />
        </div>

        <pre className="flexbox-col p-6 m-0 mh-150 bcn-0 dc__no-border">
            {lines?.map((line) => (
                <div className="flexbox dc__gap-12 dc__ff-monospace">
                    <span className={line.isCause ? 'cr-5' : ''}>{line.number}</span>
                    <span key={line.number}>{line.content}</span>
                </div>
            )) || <EmptyState href={link} />}
        </pre>
    </div>
)

export default IndexedTextDisplay
