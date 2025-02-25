export const LoginIcons = ({ ssoName }: { ssoName: string }) => (
    <svg className="icon-dim-24 mr-8" viewBox="0 0 24 24">
        <use href={`${LoginIcons}#${ssoName}`} />
    </svg>
)
