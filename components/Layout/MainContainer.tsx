import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function SectionContainer({ children }: Props) {
  return (
    <section className="mx-auto max-w-3xl border-x-[1px] border-line xl:max-w-4xl">
      {children}
    </section>
  )
}
