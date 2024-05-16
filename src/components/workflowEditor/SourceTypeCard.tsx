import React from 'react'
import Tippy from '@tippyjs/react'
import { ConditionalWrap } from '@devtron-labs/devtron-fe-common-lib'
import { SourceTypeCardProps } from './types'

const SourceTypeCard = ({
    title,
    subtitle,
    image,
    alt,
    dataTestId,
    type,
    handleCardAction,
    disableInfo,
}: Readonly<SourceTypeCardProps>) => {
    const renderTippy = (children) => {
        return (
            <Tippy className="default-tt w-200" placement="top" content={disableInfo} arrow={false}>
                {/* Since in disabled state Tippy does'nt work */}
                <span>{children}</span>
            </Tippy>
        )
    }

    return (
        <ConditionalWrap wrap={renderTippy} condition={!!disableInfo}>
            <div className={disableInfo ? 'cursor-not-allowed dc__position-rel' : ''}>
                <div
                    className={`flexbox p-12 dc__gap-12 dc__align-self-stretch br-4 dc__border-n1 bcn-0 dc__hover-n50  ${
                        disableInfo ? 'dc__disable-click dc__opacity-0_5' : ''
                    }`}
                    role="button"
                    data-testid={dataTestId}
                    data-pipeline-type={type}
                    onClick={handleCardAction}
                    onKeyDown={handleCardAction}
                    tabIndex={disableInfo ? -1 : 0}
                    aria-disabled={!!disableInfo}
                >
                    <div>
                        <img src={image} className="flex br-8" alt={alt} width={40} height={40} />
                    </div>

                    <div className="flexbox-col pr-12">
                        {/* TITLE */}
                        <p className="m-0 cn-9 fs-13 fw-6 lh-20">{title}</p>

                        {/* SUBTITLE */}
                        <p className="m-0 cn-7 fs-12 fw-4 lh-16">{subtitle}</p>
                    </div>
                </div>
            </div>
        </ConditionalWrap>
    )
}

export default SourceTypeCard
