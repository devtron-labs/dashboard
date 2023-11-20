import React from 'react'
import Tippy from '@tippyjs/react'
import { ConditionalWrap } from '@devtron-labs/devtron-fe-common-lib'
import { SourceTypeCardProps } from './types'

export default function SourceTypeCard({
    title,
    subtitle,
    image,
    alt,
    dataTestId,
    type,
    handleCardAction,
    disableInfo,
}: SourceTypeCardProps) {
    function renderTippy(children) {
        return (
            <Tippy className="default-tt" placement="top" content={disableInfo} arrow={false}>
                {/* Since in disabled state Tippy does'nt work */}
                <span>{children}</span>
            </Tippy>
        )
    }

    return (
        <ConditionalWrap wrap={renderTippy} condition={!!disableInfo}>
            <div
                className={`flexbox p-12 dc__gap-12 dc__align-self-stretch br-4 dc__border-n1 bcn-0 dc__hover-n50 ${
                    disableInfo ? 'disabled-source-card' : ''
                }`}
                role="button"
                data-testid={dataTestId}
                data-pipeline-type={type}
                onClick={handleCardAction}
                aria-disabled={!!disableInfo}
            >
                <div>
                    <img src={image} className="flex br-8" alt={alt} width={40} height={40} />
                </div>

                <div className="flexbox-col">
                    {/* TITLE */}
                    <p className="m-0 cn-9 fs-13 fw-6 lh-20">{title}</p>

                    {/* SUBTITLE */}
                    <p className="m-0 cn-7 fs-12 fw-4 lh-16">{subtitle}</p>
                </div>
            </div>
        </ConditionalWrap>
    )
}
