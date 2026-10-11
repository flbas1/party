
import type { ComponentProps } from '../types/ComponentTypes'

export default function HtmlComponent({ node }: ComponentProps) {
    const html = typeof node.content === 'string' ? node.content : ''

    return (
        <div
            className="html-content"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}
