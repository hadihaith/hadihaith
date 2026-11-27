import sizes from './media/sizes.json'

/**
 * Photos and logos, as WebP at two widths: 640 for cards and plates, 1280 for
 * the full view. Small sources only exist at 640. Dimensions are recorded so
 * every image reserves its space before it loads.
 */
const files = import.meta.glob('./media/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const dims = sizes as unknown as Record<string, [number, number]>

export type Photo = { small: string; large: string; w: number; h: number; srcSet: string }

const logoFiles = import.meta.glob('./media/logos/*.{svg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>

/** An issuer's logo by file name in src/media/logos (SVG preferred, WebP for the detailed seals). */
export const logo = (name: string): string => {
  const url = logoFiles[`./media/logos/${name}.svg`] ?? logoFiles[`./media/logos/${name}.webp`]
  if (!url) throw new Error(`missing logo: ${name}`)
  return url
}

export const photo = (name: string): Photo => {
  const small = files[`./media/${name}-640.webp`] ?? files[`./media/${name}.webp`]
  const largeUrl = files[`./media/${name}-1280.webp`]
  const [w, h] = dims[`${name}-640`] ?? dims[name] ?? [640, 640]
  const [lw] = dims[`${name}-1280`] ?? [w]
  if (!small) throw new Error(`missing media: ${name}`)
  return {
    small,
    large: largeUrl ?? small,
    w,
    h,
    srcSet: largeUrl ? `${small} ${w}w, ${largeUrl} ${lw}w` : `${small} ${w}w`,
  }
}

const certFiles = import.meta.glob('./media/certs/*.jpg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>

/** A certificate's image by file name in src/media/certs (PDFs are rendered to JPEG). */
export const certImage = (name: string): string => {
  const url = certFiles[`./media/certs/${name}.jpg`]
  if (!url) throw new Error(`missing certificate image: ${name}`)
  return url
}
