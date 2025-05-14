import { DOCUMENTATION_HOME_PAGE, DOCUMENTATION_VERSION } from '@devtron-labs/devtron-fe-common-lib'

export const appendUtmToUrl = (docLink: string) => `${docLink}?utm_source=product`

export const getDocumentationUrl = (docLink: string) =>
    `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}${appendUtmToUrl(docLink)}`

export const DocLink = ({ docLink, docLinkText = 'Learn more', dataTestId, className = 'dc__link' }: DocLinkProps) => (
    <a
        href={getDocumentationUrl(docLink)}
        target="_blank"
        rel="noreferrer noopener"
        data-testid={dataTestId || ''}
        className={className}
    >
        {docLinkText}
    </a>
)

export interface DocLinkProps {
    docLink: string
    dataTestId: string
    docLinkText?: string
    className?: string
}
