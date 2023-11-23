import React from 'react'
import Tippy from '@tippyjs/react'
import { ConditionalWrap } from '@devtron-labs/devtron-fe-common-lib'
import { DisableType, SourceTypeCardProps } from './types'

export default function SourceTypeCard({
    title,
    subtitle,
    image,
    alt,
    dataTestId,
    type,
    handleCardAction,
    disableInfo,
}: Readonly<SourceTypeCardProps>) {
    function renderTippy(children) {
        return (
            <Tippy className="default-tt" placement="top" content={disableInfo} arrow={false}>
                {/* Since in disabled state Tippy does'nt work */}
                <span>{children}</span>
            </Tippy>
        )
    }

    return (
        <ConditionalWrap wrap={renderTippy} condition={!!disableInfo && disableInfo !== DisableType.COMING_SOON}>
            <div className={disableInfo ? 'cursor-not-allowed dc__position-rel' : ''}>
                {disableInfo === DisableType.COMING_SOON && (
                    <div className="ribbon-wrapper dc__position-abs dc__top-0 dc__overflow-hidden dc__align-center w-120">
                        <div className="ribbon-content flex fs-8 fw-6 cn-7 lh-12 pl-8 pr-8 pt-0 pb-0 bcn-1 dc__flip-45 dc__position-rel">
                            {DisableType.COMING_SOON}
                        </div>
                    </div>
                )}

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
