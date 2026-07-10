import Link from '../Link'
import Image from 'next/image'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'

export default function Footer() {
  return (
    <footer>
      <div className="mt-12 flex flex-col items-center border-t border-[var(--mountain-line)] bg-transparent pt-6 dark:border-slate-700">
        <div className="mb-4 flex max-w-full flex-col items-center justify-center gap-x-2 gap-y-0 px-5 text-center text-sm leading-6 text-gray-500 dark:text-gray-400 sm:flex-row sm:flex-wrap">
          <div className="min-w-0 break-words">观心，造物，持续成为自己。</div>
          <div className="min-w-0 break-words">{`Copyright © ${new Date().getFullYear()}`}</div>
          <div className="hidden sm:block" aria-hidden="true">{` • `}</div>
          <Link href="/" className="min-w-0 break-words">
            {siteMetadata.title}
          </Link>
        </div>
        {/* <div className="mb-8 text-center text-sm text-gray-500 dark:text-gray-400"> */}
        {/* <Link href="http://beian.miit.gov.cn">湘ICP备2023013145号-1</Link> */}
        {/* <Link
            href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=43012102000901"
            className="flex items-center"
          >
            <Image
              width={16}
              height={16}
              src="/static/images/gongan.png"
              className="mr-1 h-4 w-4"
              alt=""
            />
            湘公网安备430121023331231号
          </Link> */}
        {/* </div> */}
      </div>
    </footer>
  )
}
