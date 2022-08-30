import React from 'react'

export function NavigationArrow({ color = '#06c', style = {}, ...props }) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '24px', height: '24px', ...style }}
            viewBox="0 0 24 24"
        >
            <g fill="none" fillRule="evenodd">
                <path d="M0 0h24v24H0z" />
                <path fill={color} fillRule="nonzero" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
            </g>
        </svg>
    )
}

export function Pod({ color = '#06c', style = {}, onClick = null }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '24px', height: '24px', ...style }} viewBox="0 0 24 24">
            <g fill="none" fillRule="evenodd">
                <path d="M0 0h24v24H0z" />
                <path
                    fill={color}
                    fillRule="nonzero"
                    d="M4 20v2H2v-2h2zm4 0v2H6v-2h2zm4 0v2h-2v-2h2zm4 0v2h-2v-2h2zm4 0v2h-2v-2h2zm2-19a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h15zM4 16v2H2v-2h2zM21 3H8v13h13V3zM4 12v2H2v-2h2zm0-4v2H2V8h2zm0-4v2H2V4h2z"
                />
            </g>
        </svg>
    )
}

export function Clipboard({ color = 'black', rootClassName = '', style = {}, onClick = null }) {
    return (
        <svg
            onClick={onClick}
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '17px', height: '17px', ...style }}
            viewBox="0 0 24 24"
            className={`${rootClassName}`}
        >
            <g fill="none" fillRule="evenodd">
                <path d="M0 0h24v24H0z" />
                <path
                    fill={color}
                    fillRule="nonzero"
                    d="M15.727 2H4.818C3.818 2 3 2.818 3 3.818v12.727h1.818V3.818h10.91V2zm-.909 3.636H8.455c-1 0-1.81.819-1.81 1.819l-.009 12.727c0 1 .81 1.818 1.81 1.818h10.009c1 0 1.818-.818 1.818-1.818V11.09l-5.455-5.455zM8.455 20.182V7.455h5.454V12h4.546v8.182h-10z"
                />
            </g>
        </svg>
    )
}

export function Trash({ color = '#F32E2E', style = {}, onClick = null, ...rest }) {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M2.5 5.00001H4.16667M4.16667 5.00001H17.5M4.16667 5.00001L4.16667 16.6667C4.16667 17.5872 4.91286 18.3333 5.83333 18.3333H14.1667C15.0871 18.3333 15.8333 17.5872 15.8333 16.6667V5.00001M6.66667 5.00001V3.33334C6.66667 2.41286 7.41286 1.66667 8.33334 1.66667H11.6667C12.5871 1.66667 13.3333 2.41286 13.3333 3.33334V5.00001M8.33333 9.16667V14.1667M11.6667 9.16667V14.1667"
                stroke="#596168"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    )
}

export const Branch: React.SFC<{ color: string; style?: any; onClick?: () => {} }> = ({
    color = '#F32E2E',
    style = {},
    onClick = null,
}) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '24px', height: '24px', ...style }} viewBox="0 0 24 24">
            <g fill="none" fillRule="evenodd">
                <path d="M0 0h24v24H0z" />
                <g stroke={color} strokeWidth="2" transform="translate(4 4)">
                    <circle cx="14" cy="2" r="2" />
                    <circle cx="2" cy="14" r="2" />
                    <circle cx="14" cy="14" r="2" />
                    <path d="M4 14h8M2 12V6a4 4 0 0 1 4-4h6" />
                </g>
            </g>
        </svg>
    )
}

export function Redirect({ color = 'var(--N700)', style = {}, onClick = null }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '24px', height: '24px', ...style }}
            viewBox="0 0 24 24"
            onClick={onClick}
        >
            <g fill="none" fillRule="evenodd">
                <path d="M0 0h24v24H0z" />
                <path
                    fill={color}
                    fillRule="nonzero"
                    d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"
                />
            </g>
        </svg>
    )
}

export function Pencil({ color = 'var(--N700)', style = {}, ...props }) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '24px', height: '24px', ...style }}
            viewBox="0 0 24 24"
        >
            <g fill="none" fillRule="evenodd">
                <path
                    fill={color}
                    fillRule="nonzero"
                    d="M4.5 16.375V19.5h3.125l9.217-9.217-3.125-3.125L4.5 16.375zm14.758-8.508a.83.83 0 0 0 0-1.175l-1.95-1.95a.83.83 0 0 0-1.175 0l-1.525 1.525 3.125 3.125 1.525-1.525z"
                />
            </g>
        </svg>
    )
}
export function Page({ style = {}, color = '#06c', ...props }) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '24px', height: '24px', ...style }}
            viewBox="0 0 24 24"
        >
            <g fill="none" fillRule="evenodd">
                <path d="M0 24V0h24v24z" />
                <path
                    stroke={`${color}`}
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M2 18v-7l7-7h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"
                />
                <path stroke={`${color}`} strokeLinejoin="round" strokeWidth="1.5" d="M2 11l7-7v5a2 2 0 0 1-2 2H2z" />
                <path
                    stroke={`${color}`}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M13.5 16V8M17.5 16v-6"
                />
            </g>
        </svg>
    )
}
export function DropdownIcon({ style = {}, color = '#06c', ...props }) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '24px', height: '24px', ...style }}
            viewBox="0 0 24 24"
        >
            <g fill="transparent" fillRule="evenodd">
                <path d="M0 0h24v24H0z" />
                <path
                    stroke={`${color}`}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 11l4 4 4-4"
                />
            </g>
        </svg>
    )
}

export function Info({ color = '#06c', style = {}, ...rest }) {
    return (
        <svg
            {...rest}
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '24px', height: '24px', ...style }}
            viewBox="0 0 32 32"
        >
            <g fill="none" fillRule="evenodd">
                <path d="M0 0h32v32H0z" />
                <path
                    fill={color}
                    d="M16 2.667C8.64 2.667 2.667 8.64 2.667 16S8.64 29.333 16 29.333 29.333 23.36 29.333 16 23.36 2.667 16 2.667z"
                />
                <path
                    fill="#FFF"
                    d="M16 14.667c.736 0 1.333.597 1.333 1.333v5.333a1.333 1.333 0 1 1-2.666 0V16c0-.736.597-1.333 1.333-1.333zm0-5.334A1.333 1.333 0 1 1 16 12a1.333 1.333 0 0 1 0-2.667z"
                />
            </g>
        </svg>
    )
}
