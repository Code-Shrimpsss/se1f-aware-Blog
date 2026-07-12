type BrandMarkProps = {
  className?: string
  title?: string
}

/**
 * The responsive, inline form of Se1fAware's perception-aperture mark.
 * It inherits no global SVG styles and remains sharp at favicon-scale sizes.
 */
export default function BrandMark({ className, title = 'Se1fAware' }: BrandMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 96 96"
      fill="none"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13 48C20.9 28.1 34.1 17 48 17c13.9 0 27.1 11.1 35 31-7.9 19.9-21.1 31-35 31-13.9 0-27.1-11.1-35-31Z"
        className="brand-mark-outline"
      />
      <circle cx="48" cy="48" r="15" className="brand-mark-orbit" />
      <path d="m45 40 6-6v29" className="brand-mark-one" />
      <circle cx="77" cy="22" r="5" className="brand-mark-point" />
    </svg>
  )
}
