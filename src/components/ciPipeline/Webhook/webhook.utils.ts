import { TabDetailsType } from "./types";

export const TOKEN_TAB_LIST: TabDetailsType[] = [
  { key: 'selectToken', value: 'Select API token' },
  { key: 'autoToken', value: 'Auto-generate token' },
]
export const PLAYGROUND_TAB_LIST: TabDetailsType[] = [
  { key: 'webhookURL', value: 'Webhook URL' },
  { key: 'sampleCurl', value: 'Sample cURL request' },
  { key: 'try', value: 'Try it out' },
]
export const REQUEST_BODY_TAB_LIST: TabDetailsType[] = [
  { key: 'json', value: 'JSON' },
  { key: 'schema', value: 'Schema' },
]
export const RESPONSE_TAB_LIST: TabDetailsType[] = [
  { key: 'example', value: 'Example value' },
  { key: 'schema', value: 'Schema' },
]

export const CURL_PREFIX = `curl --location --request POST \\
'{webhookURL}' \\
--header 'Content-Type: application/json' \\
--header 'api-token: {token}' \\
--data-raw '{data}'`

export const SELECT_TOKEN_STYLE = {
    control: (base, state) => ({
        ...base,
        border: '1px solid var(--N200)',
        boxShadow: 'none',
        minHeight: 'auto',
        height: '32px',
        fontSize: '13px',
    }),
    option: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        fontSize: '13px',
        padding: '5px 10px',
    }),
    dropdownIndicator: (styles) => ({ ...styles, padding: 0 }),
    valueContainer: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        background: 'var(--N50) !important',
        padding: '0px 10px',
        display: 'flex',
        height: '30px',
        fontSize: '13px',
        pointerEvents: 'all',
        whiteSpace: 'nowrap',
        borderRadius: '4px',
    }),
    indicatorsContainer: (base, state) => ({
        ...base,
        background: 'var(--N50) !important',
    }),
}