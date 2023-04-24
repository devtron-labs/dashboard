import React from 'react'
import { ReactComponent as InjectTag } from '../../../assets/icons/inject-tag.svg'
import Tippy from '@tippyjs/react'
import { TagChipsContainerType } from '../types'

export default function TagChipsContainer({ labelTags }: TagChipsContainerType) {
    return (
        <div className="flex left flex-wrap dc__gap-8" data-testid="tag-chip-container">
            {labelTags.length > 0 ? (
                labelTags.map((tag, index) => (
                    <div key={tag.id} className="flex">
                        <div
                            className={`flex bc-n50 cn-9 fw-4 fs-12 en-2 bw-1 pr-6 pl-6 pb-2 pt-2 ${
                                !tag.value ? ' br-4' : ' dc__left-radius-4'
                            }`}
                        >
                            {tag.propagate && <InjectTag className="icon-dim-16 mt-2 mr-4" />}
                            <Tippy
                                className="default-tt dc__word-break-all"
                                arrow={false}
                                placement="bottom"
                                content={tag.key}
                                trigger="mouseenter"
                                interactive={true}
                            >
                                <div
                                    className="dc__mxw-400 dc__ellipsis-right"
                                    data-testid={`tag-key-overview-${index}`}
                                >
                                    {tag.key}
                                </div>
                            </Tippy>
                        </div>
                        {tag.value && (
                            <Tippy
                                className="default-tt dc__word-break-all"
                                arrow={false}
                                placement="bottom"
                                content={tag.value}
                                trigger="mouseenter"
                                interactive={true}
                            >
                                <div
                                    className="bcn-0 cn-9 fw-4 fs-12 en-2 bw-1 pr-6 pl-6 pb-2 pt-2 dc__right-radius-4 dc__no-left-border dc__mxw-400 dc__ellipsis-right"
                                    data-testid={`tag-value-overview-${index}`}
                                >
                                    {tag.value}
                                </div>
                            </Tippy>
                        )}
                    </div>
                ))
            ) : (
                <span className="fs-13 fw-4 cn-7" data-testid="overview-tags-value">
                    No tags added.
                </span>
            )}
        </div>
    )
}
