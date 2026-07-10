import Link from '@/components/Link'

export default function NotFound() {
  return (
    <div className="page-reveal py-10 sm:py-16">
      <div className="lost-note hero-note mx-auto max-w-2xl rounded-sm px-5 py-8 sm:px-8 sm:py-10">
        <div className="relative z-10">
          <div className="section-kicker">Lost note</div>
          <p className="lost-note-code" aria-label="404">
            404
          </p>
          <h1 className="lost-note-title mt-3 text-3xl font-extrabold leading-tight tracking-tight text-gray-950 dark:text-gray-50 sm:text-5xl">
            This page slipped out of the notebook.
          </h1>
          <p className="lost-note-copy mt-4 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            The route is empty, but the archive is still here. Step back into the notes or return to
            the front page.
          </p>
          <div className="mt-7 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/" className="note-link">
              Home <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link href="/blog" className="note-link">
              Blog <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
