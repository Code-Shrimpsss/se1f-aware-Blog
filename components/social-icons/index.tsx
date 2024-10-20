import {
  Mail,
  Github,
  Juejin,
  Csdn,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  Mastodon,
  Threads,
  Instagram,
  leetCode,
  dotNET,
} from './icons'

const components = {
  mail: Mail,
  github: Github,
  juejin: Juejin,
  csdn: Csdn,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  mastodon: Mastodon,
  threads: Threads,
  instagram: Instagram,
  leetCode: leetCode,
  dotNET: dotNET,
}

export type SocialIconKind = keyof typeof components

type SocialIconProps = {
  kind: SocialIconKind
  href: string | undefined
  size?: number
}

const SocialIcon = ({ kind, href, size = 8 }: SocialIconProps) => {
  if (!href || (kind === 'mail' && !/^mailto:\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/.test(href)))
    return null

  const SocialSvg = components[kind]

  return (
    <a
      className="text-sm text-gray-500 transition hover:text-gray-600"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
    >
      <span className="sr-only">{kind}</span>
      <SocialSvg
        className={`fill-current text-gray-700 hover:text-primary-500 dark:text-gray-200 dark:hover:text-primary-500 h-${size} w-${size}`}
      />
    </a>
  )
}

export default SocialIcon
