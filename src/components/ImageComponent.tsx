
import type { ComponentProps } from '../types/ComponentTypes'
import { resolveAssetUrl } from '../utils/resolveAssetUrl'

export default function ImageComponent({ node, context }: ComponentProps) {
    const image = typeof node.image === 'string' ? node.image : ''

    if (!image) {
        return <p>Image path not configured.</p>
    }

    const className =
        typeof node.className === 'string' ? node.className : ''

    return (
        <div className={className || undefined}>
            <img
                src={resolveAssetUrl(image, context.partyId)}
                alt={typeof node.alt === 'string' ? node.alt : ''}
            />
        </div>
    )
}
