import { components } from 'react-select';
import React from 'react';
import { ReactComponent as ArrowDown } from '../../assets/icons/ic-chevron-down.svg';
import { ReactComponent as Slack } from '../../assets/img/slack-logo.svg';
import { ReactComponent as Email } from '../../assets/icons/ic-mail.svg';

export const multiSelectStyles = {
    control: (base, state) => ({
        ...base,
        border: state.isFocused ? '1px solid #06c' : '1px solid #d6dbdf',
        boxShadow: 'none',
        height: '100%',
    }),
    menu: (base, state) => ({
        ...base,
        top: `38px`,
    }),
    option: (base, state) => {
        return ({
            ...base,
            color: 'var(--N900)',
            display: `flex`,
            alignItems: `center`,
            fontSize: '12px',
            padding: '8px 24px',
        })
    },
    multiValue: (base, state) => {
        return ({
            ...base,
            backgroundColor: 'var(--N000)',
            borderRadius: `4px`,
            border: `solid 1px var(--N200)`,
            padding: `2px`,
            textTransform: `lowercase`,
            fontSize: `12px`,
            lineHeight: `1.5`,
            letterSpacing: `normal`,
            color: `var(--N900)`,
            userSelect: `none`,
            display: `inline-flex`,
        })
    },
    multiValueLabel: (base, state) => {
        return ({
            ...base,
            display: `flex`,
            alignItems: `center`,
            fontSize: '12px',
            padding: '0px'
        })
    }
}

export function DropdownIndicator(props) {
    return <components.DropdownIndicator {...props}>
        <ArrowDown className="icon-dim-20 icon-n5" />
    </components.DropdownIndicator>
}

export function MultiValueLabel(props) {
    let item = props.data;
    return <components.MultiValueLabel {...props} >
        {item.data.dest === "ses" || item.data.dest === "email" || item.data.dest === "" ? <Email className="icon-dim-20 mr-5" /> : null}
        {item.data.dest === "slack" ? <Slack className="icon-dim-20 mr-5" /> : null}
        {props.children}
    </components.MultiValueLabel>
}

export function Option(props) {
    let item = props.data;
    if (item && item?.__isNew__) {
        return <components.Option {...props} >
            {props.children}
        </components.Option>
    }
    else return <components.Option {...props} >
        {item.data.dest === "ses" || item.data.dest === "email" ? <Email className="icon-dim-20 mr-5" /> : null}
        {item.data.dest === "slack" ? <Slack className="icon-dim-20 mr-5" /> : null}
        {props.children}
    </components.Option>
}
