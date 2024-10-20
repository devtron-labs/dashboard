/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useEffect, useRef } from 'react'
import { MarkDownProps } from './Types'
import './markdown.scss'

const uncheckedCheckboxInputElement = `<input checked="" disabled="" type="checkbox">`
const checkedCheckboxInputElement = `<input disabled="" type="checkbox">`
const renderer = new marked.Renderer()

const MarkDown = ({ setExpandableIcon, markdown, className, breaks, disableEscapedText, ...props }: MarkDownProps) => {
    const mdeRef = useRef(null)

    const getHeight = () => {
        const editorHeight = mdeRef.current?.clientHeight
        const minHeight = 320
        const showExpandableViewIcon = editorHeight > minHeight
        if (typeof setExpandableIcon === 'function') {
            setExpandableIcon(showExpandableViewIcon)
        }
    }
    useEffect(() => {
        getHeight()
    }, [markdown])

    const isReadmeInputCheckbox = (text: string) => {
        if (text.includes(uncheckedCheckboxInputElement) || text.includes(checkedCheckboxInputElement)) {
            return true
        }
        return false
    }

    renderer.listitem = (text: string) => {
        if (isReadmeInputCheckbox(text)) {
            // eslint-disable-next-line no-param-reassign
            text = text
                .replace(
                    uncheckedCheckboxInputElement,
                    '<input type="checkbox" style="margin: 0 0.2em 0.25em -1.4em;" class="dc__vertical-align-middle" checked disabled>',
                )
                .replace(
                    checkedCheckboxInputElement,
                    '<input type="checkbox" style="margin: 0 0.2em 0.25em -1.4em;" class="dc__vertical-align-middle" disabled>',
                )
            return `<li style="list-style: none">${text}</li>`
        }
        return `<li>${text}</li>`
    }

    renderer.image = (href: string, title: string, text: string) =>
        `<img src="${href}" alt="${text}" title="${title}" class="max-w-100">`

    renderer.table = (header, body) => `
        <div class="table-container">
            <table>
                ${header}
                ${body}
            </table>
        </div>
        `

    renderer.heading = (text, level) => {
        const escapedText = disableEscapedText ? '' : text.toLowerCase().replace(/[^\w]+/g, '-')

        return `
          <a name="${escapedText}" rel="noreferrer noopener" class="anchor" href="#${escapedText}">
                <h${level} data-testid="deployment-template-readme-version">
              <span class="header-link"></span>
              ${text}
              </h${level}>
            </a>`
    }

    marked.setOptions({
        renderer,
        gfm: true,
        smartLists: true,
        ...(breaks && { breaks: true }),
    })

    const createMarkup = () => ({ __html: DOMPurify.sanitize(marked(markdown), { USE_PROFILES: { html: true } }) })

    return (
        <article
            {...props}
            ref={mdeRef}
            className={`markdown ${className}`}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={createMarkup()}
            data-testid="markdown-rendered-content"
        />
    )
}

export default MarkDown
