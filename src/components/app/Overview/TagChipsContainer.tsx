import React from 'react'
import { ReactComponent as InjectTag } from '../../../assets/icons/inject-tag.svg'
import Tippy from '@tippyjs/react'
import { TagChipsContainerType } from '../types'

export default function TagChipsContainer({
    labelTags,
    onAddTagButtonClick,
    resourceName,
    whiteBackground = false,
}: TagChipsContainerType) {
    return (
        <div className="flex left flex-wrap dc__gap-8" data-testid="tag-chip-container">
            {labelTags.length > 0 ? (
                labelTags.map((tag, index) => (
                    <div key={tag.id} className="display-grid grid-auto-flow-column">
                        <div
                            className={`flex ${
                                whiteBackground ? 'bcn-0' : 'bc-n50'
                            } cn-9 fw-4 fs-12 lh-16 en-2 bw-1 pr-6 pl-6 pb-2 pt-2 dc__ellipsis-right ${
                                !tag.value ? ' br-4' : ' dc__left-radius-4'
                            }`}
                        >
                            {tag.propagate && <InjectTag className="icon-dim-16 mt-2 mr-4 mw-16" />}
                            <Tippy
                                className="default-tt dc__word-break-all"
                                arrow={false}
                                placement="bottom"
                                content={tag.key}
                                trigger="mouseenter"
                                interactive={true}
                            >
                                <div className="dc__ellipsis-right" data-testid={`tag-key-overview-${index}`}>
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
                                    className="bcn-0 cn-9 fw-4 fs-12 lh-16 en-2 bw-1 pr-6 pl-6 pb-2 pt-2 dc__right-radius-4 dc__no-left-border dc__mxw-400 dc__ellipsis-right"
                                    data-testid={`tag-value-overview-${index}`}
                                >
                                    {tag.value}
                                </div>
                            </Tippy>
                        )}
                    </div>
                ))
            ) : (
                <div className="fs-13 fw-4 lh-20 cn-7">
                    Add tags to this {resourceName}. Desired tags can also be propagated to Kubernetes resources as
                    labels.&nbsp;
                    <span className="cb-5 cursor" onClick={onAddTagButtonClick}>
                        Add Tags
                    </span>
                </div>
            )}
        </div>
    )
}
