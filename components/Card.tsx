import Image from './Image'
import Link from './Link'

const Card = ({ title, description, imgSrc, href }) => (
  <article className="project-card">
    <div className={`${imgSrc ? 'h-full' : ''} project-card-inner`}>
      {imgSrc &&
        (href ? (
          <Link href={href} aria-label={`Link to ${title}`} className="project-card-media">
            <span className="project-card-pin" aria-hidden="true" />
            <Image
              alt={title}
              src={imgSrc}
              className="project-card-image"
              width={544}
              height={306}
            />
          </Link>
        ) : (
          <div className="project-card-media">
            <span className="project-card-pin" aria-hidden="true" />
            <Image
              alt={title}
              src={imgSrc}
              className="project-card-image"
              width={544}
              height={306}
            />
          </div>
        ))}
      <div className="project-card-body">
        <h2 className="project-card-title">
          {href ? (
            <Link href={href} aria-label={`Link to ${title}`}>
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        <p className="project-card-description">{description}</p>
        {href && (
          <Link
            href={href}
            className="note-link project-card-link"
            aria-label={`Link to ${title}`}
          >
            查看详情 <span aria-hidden="true">&rarr;</span>
          </Link>
        )}
      </div>
    </div>
  </article>
)

export default Card
