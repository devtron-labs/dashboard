import React from 'react';
import marked from 'marked';
import { useLocation} from 'react-router'

export function MarkDown({ markdown = "", className = "", ...props }) {
    const { hash } = useLocation()
    const renderer = new marked.Renderer();
    renderer.table = function (header, body) {
        return `
        <div class="table-container">
            <table>
                ${header}
                ${body}
            </table>
        </div>
        `
    };

    renderer.heading = function (text, level) {
        const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

        return `
          <a name="${escapedText}" rel="noreferrer noopener" class="anchor" href="#${escapedText}">
                <h${level}>
              <span class="header-link"></span>
              ${text}
              </h${level}>
            </a>`;
    };

    marked.setOptions({
        renderer,
        gfm: true,
        smartLists: true,
    });

    function createMarkup() {
        return { __html: marked(markdown) };
    }
    return (
        <article {...props} className={`deploy-chart__readme-markdown ${className}`}
            dangerouslySetInnerHTML={createMarkup()}
        />
    )
}