import React from 'react'
import { components } from 'react-select'
import Tippy from '@tippyjs/react'
import { ReactComponent as ClusterIcon } from '../../../assets/icons/ic-cluster.svg'
import { ReactComponent as NamespaceIcon } from '../../../assets/icons/ic-env.svg'
import { ReactComponent as ErrorIcon } from '../../../assets/icons/ic-error-exclamation.svg'
import { getCustomOptionSelectionStyle } from '../../v2/common/ReactSelect.utils'
import { NAMESPACE_NOT_APPLICABLE_TEXT } from '../Constants'

export const clusterUnreachableTippyContent = (errorMsg: string) => {
    return (
        <div>
            <span className="fs-12 fw-6 lh-18">Cluster is not reachable</span>
            <p className="fs-12 fw-4 lh-18 dc__word-break">{errorMsg}</p>
        </div>
    )
}

export const tippyWrapper = (children) => {
    return (
        <Tippy className="default-tt w-200" placement="top" arrow={false} content={NAMESPACE_NOT_APPLICABLE_TEXT}>
            <div>{children}</div>
        </Tippy>
    )
}

export const ResourceValueContainerWithIcon = (props) => {
    const { selectProps } = props
    return (
        <components.ValueContainer {...props}>
            {selectProps.value ? (
                <>
                    {(!selectProps.menuIsOpen || !selectProps.inputValue) && (
                        <div className="flex left dc__position-abs w-100">
                            <span className="icon-dim-20">
                                {selectProps.placeholder.includes('Cluster') ? (
                                    <ClusterIcon className="icon-dim-20 scn-6" />
                                ) : (
                                    <NamespaceIcon className="icon-dim-20 fcn-6" />
                                )}
                            </span>
                            {selectProps.value.label ? (
                                <span className="cn-9 dc__ellipsis-right ml-8">{selectProps.value.label}</span>
                            ) : (
                                <span className="cn-5 dc__ellipsis-right ml-8">{selectProps.placeholder}</span>
                            )}
                        </div>
                    )}
                    {React.cloneElement(props.children[1])}
                </>
            ) : (
                <>{props.children}</>
            )}
        </components.ValueContainer>
    )
}

export const ClusterOptionWithIcon = (props) => {
    const { selectProps, data, style } = props
    selectProps.styles.option = getCustomOptionSelectionStyle(style)

    if (data.errorInConnecting) {
        return (
            <Tippy
                className="default-tt w-200"
                placement="left"
                arrow={false}
                content={clusterUnreachableTippyContent(data.errorInConnecting)}
            >
                <div>
                    <components.Option {...props}>
                        <div className="flex left">
                            <span className="dc__ellipsis-right">{data.label}</span>
                            <ErrorIcon className="icon-dim-16 ml-auto cursor" />
                        </div>
                    </components.Option>
                </div>
            </Tippy>
        )
    }

    return (
        <components.Option {...props}>
            <div className="flex left">
                <span className="dc__ellipsis-right">{data.label}</span>
            </div>
        </components.Option>
    )
}
