import React from 'react'
import { components } from 'react-select'
import Tippy from '@tippyjs/react'
import { ReactComponent as ClusterIcon } from '../../../assets/icons/ic-cluster.svg'
import { ReactComponent as NamespaceIcon } from '../../../assets/icons/ic-env.svg'
import { ReactComponent as ErrorIcon } from '../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as SearchIcon } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as ClearIcon } from '../../../assets/icons/ic-error.svg'
import { getCustomOptionSelectionStyle } from '../../v2/common/ReactSelect.utils'
import { CLUSTER_NOT_REACHABLE, NAMESPACE_NOT_APPLICABLE_TEXT } from '../Constants'
import { ShortcutKeyBadge } from '../../common/formFields/Widgets/Widgets'

export const clusterUnreachableTippyContent = (errorMsg: string) => {
    return (
        <div>
            <span className="fs-12 fw-6 lh-18">{CLUSTER_NOT_REACHABLE}</span>
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
                    <div className="flex left dc__position-abs w-100">
                        <span className="icon-dim-20">
                            {selectProps.placeholder.includes('Cluster') ? (
                                <ClusterIcon className="icon-dim-20 scn-6" />
                            ) : (
                                <NamespaceIcon className="icon-dim-20 fcn-6" />
                            )}
                        </span>
                        {!selectProps.inputValue && (
                            <>
                                {selectProps.value.label ? (
                                    <span className="cn-9 dc__ellipsis-right ml-8">{selectProps.value.label}</span>
                                ) : (
                                    <span className="cn-5 dc__ellipsis-right ml-8">{selectProps.placeholder}</span>
                                )}
                            </>
                        )}
                    </div>
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

export const KindSearchValueContainer = (props) => {
    const { selectProps } = props
    return (
        <components.ValueContainer {...props}>
            <div className="flex left dc__position-abs w-100">
                <span className="flex icon-dim-20">
                    <SearchIcon className="kind-search-icon icon-dim-16" />
                </span>
                {!selectProps.inputValue && (
                    <span className="cn-5 dc__ellipsis-right ml-8">{selectProps.placeholder}</span>
                )}
            </div>
            {React.cloneElement(props.children[1])}
        </components.ValueContainer>
    )
}

export const KindSearchClearIndicator = (props) => {
    return (
        <components.ClearIndicator {...props}>
            <div className="icon-dim-16">
                {props.selectProps.inputValue && (
                    <ClearIcon className="clear-kind-search-icon icon-dim-16" onClick={props.selectProps.onBlur} />
                )}
                {!props.isFocused && <ShortcutKeyBadge shortcutKey="k" rootClassName="kind-search-shortcut-key" />}
            </div>
        </components.ClearIndicator>
    )
}
