import { OptionType } from "../../app/types";
import { MetadataType, TabDetailsType } from "./types";

export const PAYLOAD_CHIPS_METADATA: MetadataType[] = [
  {
      key: 'dockerImage',
      keyInObj: ['dockerImage'],
      displayName: 'Container image tag',
      isSelected: true,
      readOnly: true,
  },
  {
      key: 'gitRepository',
      keyInObj: ['ciProjectDetails', 'gitRepository'],
      displayName: 'Git repository',
      isSelected: false,
      readOnly: false,
  },
  {
      key: 'checkoutPath',
      keyInObj: ['ciProjectDetails', 'checkoutPath'],
      displayName: 'Checkout path',
      isSelected: false,
      readOnly: false,
  },
  {
      key: 'commitHash',
      keyInObj: ['ciProjectDetails', 'commitHash'],
      displayName: 'Commit hash',
      isSelected: false,
      readOnly: false,
  },
  {
      key: 'commitTime',
      keyInObj: ['ciProjectDetails', 'commitTime'],
      displayName: 'Date & time of commit',
      isSelected: false,
      readOnly: false,
  },
  {
      key: 'branch',
      keyInObj: ['ciProjectDetails', 'branch'],
      displayName: 'Branch',
      isSelected: false,
      readOnly: false,
  },
  {
      key: 'message',
      keyInObj: ['ciProjectDetails', 'message'],
      displayName: 'Commit message',
      isSelected: false,
      readOnly: false,
  },
  {
      key: 'author',
      keyInObj: ['ciProjectDetails', 'author'],
      displayName: 'Author',
      isSelected: false,
      readOnly: false,
  },
]


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

export const CURL_PREFIX = `curl -X 'POST'
'https://demo1.devtron.info:32443/orchestrator/webhook/ext-ci'
-H 'Content-type: application/json'
`