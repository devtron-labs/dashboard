import React from 'react'
import { components } from 'react-select'
import { ReactComponent as Info } from '../../../../assets/icons/info-filled.svg'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help.svg'
import { ReactComponent as OpenInNew } from '../../../../assets/icons/ic-open-in-new.svg'
import { DOCUMENTATION } from '../../../../config'
import { multiSelectStyles } from '../../../common'

export const styles = {
    ...multiSelectStyles,
    menu: (base) => ({ ...base, zIndex: 9999, textAlign: 'left', width: '150%' }),
    control: (base, state) => ({
        ...base,
        backgroundColor: 'transparent',
        minHeight: '12px',
        cursor: 'pointer',
        border: 0,
        outline: 'none',
        boxShadow: 'none',
        fontSize: '13px',
    }),
    singleValue: (base, state) => ({
        ...base,
        fontWeight: 600,
        color: '#06c',
        marginLeft: 0,
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
        color: 'var(--N900)',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        padding: '0 4px',
    }),
    valueContainer: (base, state) => ({
        ...base,
        height: '20px',
        padding: 0,
    }),
    indicatorsContainer: (base) => ({
        ...base,
        padding: 0,
    }),
    dropdownIndicator: (styles) => ({ ...styles, padding: 0 }),
}

export function Option(props) {
    return (
        <components.Option {...props}>
            <div className={`flex left pt-8 pb-8 pl-8 pr-8 ${props.isSelected ? 'bcb-1' : ''}`}>
                <div
                    className={`dc__app-summary__icon icon-dim-22 ${props.data.status
                        .toLocaleLowerCase()
                        .replace(/\s+/g, '')} mr-8`}
                ></div>
                <div>
                    <div className="cn-9 fs-13"> {props.label}</div>
                    <div className="cn-7 flex left">
                        <span className="dc__capitalize">Deploy</span> <div className="dc__bullet ml-4 dc__bullet--d2 mr-4" />{' '}
                        {props.data.author === 'system' ? 'auto-triggered' : props.data.author}
                    </div>
                </div>
            </div>
        </components.Option>
    )
}

const renderLogsNotAvailable = (subtitle?: string): JSX.Element => {
  return (
      <div className="flexbox dc__content-center flex-align-center dc__height-inherit">
          <div>
          <div className="text-center"><Info className="icon-dim-20"/></div>
          <div className="text-center cn-0 fs-14 fw-6">Logs not available</div>
          <div className="text-center cn-0 fs-13 fw-4">{subtitle || 'Blob storage was not configured at pipeline run.'}</div>
          </div>
      </div>
  )
}

const renderBlobNotConfigured = (): JSX.Element => {
  return (
      <>
          {renderLogsNotAvailable('Logs are available only at runtime.')}
          <div className="flexbox configure-blob-container pt-8 pr-12 pb-8 pl-12 bcv-1 br-4">
              <Question className="icon-dim-20 fcv-5" />
              <span className="fs-13 fw-4 mr-8 ml-8">Want to store logs to view later?</span>
              <a className="fs-13 fw-6 cb-5 no-decor" href={DOCUMENTATION.ADMIN_PASSWORD} target="_blank">
                  Configure blob storage
              </a>
              <OpenInNew className="icon-dim-20 ml-8" />
          </div>
      </>
  )
}

export const renderConfigurationError = (isBlobStorageConfigured: boolean): JSX.Element => {
  return (
      <div className="flexbox dc__content-center flex-align-center dc__height-inherit">
          {!isBlobStorageConfigured ? renderBlobNotConfigured() : renderLogsNotAvailable()}
      </div>
  )
}
