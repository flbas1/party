import type { ComponentProps } from '../types/ComponentTypes'
import { resolveAssetUrl } from '../utils/resolveAssetUrl'

export default function VideoComponent({ node, context }: ComponentProps) {
    const src = typeof node.src === 'string' ? node.src : ''

    if (!src) return null

    const className = typeof node.className === 'string'
                    ? node.className
                    : undefined

    return (
        <div className={`${className ?? 'video'}-screen`}>
        <video
            id={typeof node.id === 'string' ? node.id : undefined}
            className={ className  }
            src={resolveAssetUrl(src, context.partyId)}
            controls={node.controls !== false}
            autoPlay={node.autoplay === true}
            loop={node.loop === true}
            playsInline
            preload="metadata"
        />
        </div> 
    )
}