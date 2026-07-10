import { ReactNode } from 'react'
import type { Authors } from 'contentlayer/generated'
import SocialIcon, { SocialIconKind } from '@/components/social-icons'
import Image from 'next/image'
import React from 'react'

import { IconBrandPiedPiperHat } from '@/components/icons'

import { frontendSkills, languageSkills, otherSkills } from '@/layouts/(_components)/skillIcons'

import {
  IconSkillTypeScript,
  IconSkillReactDark,
  IconSkillReactLight,
  IconSkillNextjsDark,
  IconSkillNextjsLight,
  IconSkillTailwindcssDark,
  IconSkillTailwindcssLight,
} from '@/components/icons'

interface Props {
  children: ReactNode
  content: Omit<Authors, '_id' | '_raw' | 'body'>
  showHeader?: boolean
  showAvatar?: boolean
  showMainSkills?: boolean
  showSkillCategories?: boolean
  showSkillScroll?: boolean
  showAboutMe?: boolean
}

function SkillScroll({
  size,
  skills,
  reverse = false,
}: {
  size: number
  skills: Array<{ icon: React.ReactElement<React.HTMLAttributes<HTMLElement>>; darkIcon?: React.ReactElement<React.HTMLAttributes<HTMLElement>> }>
  reverse?: boolean
}) {
  const animationClass = reverse ? 'animate-infinite-scroll-reverse' : 'animate-infinite-scroll'
  const iconSize = Math.min(size, 72)
  const tokenSize = iconSize + 20

  return (
    <div className="skill-lane mb-[16px] inline-flex w-full flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]">
      {[0, 1].map((key) => (
        <ul
          key={key}
          className={`flex ${animationClass} items-center [&_li]:mx-[12px]`}
          aria-hidden={key === 1}
        >
          {skills.map((skill, idx) => (
            <li
              key={idx}
              className={`skill-token flex items-center justify-center whitespace-nowrap rounded-full bg-white/85 text-gray-800 dark:bg-slate-900/85 dark:text-gray-200`}
              style={{ width: `${tokenSize}px`, height: `${tokenSize}px` }}
            >
              {skill.darkIcon ? (
                <>
                  {React.cloneElement(skill.icon, {
                    style: { width: `${iconSize}px`, height: `${iconSize}px` },
                    className: 'dark:hidden',
                  })}
                  {React.cloneElement(skill.darkIcon, {
                    style: { width: `${iconSize}px`, height: `${iconSize}px` },
                    className: 'hidden dark:block',
                  })}
                </>
              ) : (
                React.cloneElement(skill.icon, {
                  style: { width: `${iconSize}px`, height: `${iconSize}px` },
                })
              )}
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}

export default function AuthorLayout({
  children,
  content,
  showHeader = true,
  showAvatar = true,
  showMainSkills = false,
  showSkillCategories = false,
  showSkillScroll = true,
  showAboutMe = true,
}: Props) {
  const { name, avatar, occupation, company, email, github, juejin, leetCode } = content

  const socialLinks = [
    { kind: 'mail', href: `mailto:${email}` },
    { kind: 'github', href: github },
    { kind: 'juejin', href: juejin },
    { kind: 'leetCode', href: leetCode },
  ]

  const mainSkills = [
    {
      name: 'TypeScript',
      icon: <IconSkillTypeScript className="mx-1 inline-block translate-y-0.5" />,
    },
    {
      name: 'React',
      icon: <IconSkillReactDark className="mx-1 inline-block translate-y-0.5 dark:hidden" />,
      darkIcon: <IconSkillReactLight className="mx-1 hidden translate-y-0.5 dark:inline-block" />,
    },
    {
      name: 'Next.js',
      icon: <IconSkillNextjsDark className="mx-1 inline-block translate-y-0.5 dark:hidden" />,
      darkIcon: <IconSkillNextjsLight className="mx-1 hidden translate-y-0.5 dark:inline-block" />,
    },
    {
      name: 'Tailwind CSS',
      icon: <IconSkillTailwindcssDark className="mx-1 inline-block translate-y-0.5 dark:hidden" />,
      darkIcon: (
        <IconSkillTailwindcssLight className="mx-1 hidden translate-y-0.5 dark:inline-block" />
      ),
    },
  ]

  const skillCategories = [
    { name: 'Base', skills: ['HTML', 'CSS', 'JavaScript', 'C++', 'Python'] },
    { name: 'Framework', skills: ['Vue (*eco)', 'Svelte', 'Django'] },
    { name: 'Build', skills: ['RollupJS', 'Webpack', 'Vite'] },
    { name: 'CSS', skills: ['Less', 'Emotion'] },
    { name: 'UniTest', skills: ['Cypress', 'Jest'] },
    { name: 'Back-End Tech', skills: ['Nodejs', 'Expressjs', 'GraphQL'] },
  ]

  return (
    <div className="page-reveal">
      {showHeader && (
        <div className="border-b border-dashed border-slate-300 pb-6 pt-6 dark:border-slate-700 md:space-y-5">
          <div className="section-kicker">关于 Vito</div>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight tracking-tight text-gray-950 dark:text-gray-50 sm:text-5xl md:text-6xl">
            在工程与自我之间
          </h1>
        </div>
      )}
      <div className="items-start space-y-2">
        {showAvatar && (
          <div className="hero-note mt-8 flex flex-col items-center rounded-sm px-5 py-8">
            {avatar && (
              <div className="avatar-orbit">
                <Image
                  src={avatar}
                  alt={name}
                  width={112}
                  height={112}
                  className="relative z-10 h-28 w-28 rounded-full border border-white/70 object-cover shadow-2xl dark:border-slate-700"
                  priority
                />
              </div>
            )}
            <h3 className="relative z-10 pb-2 pt-6 text-3xl font-bold leading-8 tracking-tight text-gray-950 dark:text-gray-50">
              {name}
            </h3>
            <div className="relative z-10 text-gray-600 dark:text-gray-300">
              <IconBrandPiedPiperHat className="mx-1 translate-y-0.5" />
              {occupation}
            </div>
            <div className="relative z-10 text-gray-500 dark:text-gray-400">{company}</div>
            <div className="relative z-10 flex space-x-3 pt-6">
              {socialLinks.map((link) => (
                <SocialIcon key={link.kind} kind={link.kind as SocialIconKind} href={link.href} />
              ))}
            </div>
          </div>
        )}
        <div className="prose max-w-none pb-8 pt-8 dark:prose-invert xl:col-span-2">
          {showMainSkills && (
            <>
              <h2>
                <IconBrandPiedPiperHat className="mx-1 translate-y-0.5" />
                能力坐标
              </h2>
              <h3>主要工程栈</h3>
              <div>
                {mainSkills.map((skill, index) => (
                  <React.Fragment key={skill?.name}>
                    {index > 0 && ' + '}
                    {skill?.icon}
                    {skill?.darkIcon &&
                      React.cloneElement(skill.darkIcon, {
                        className: 'mx-1 hidden translate-y-0.5 dark:inline-block',
                      })}
                    {skill?.name}
                  </React.Fragment>
                ))}
              </div>
            </>
          )}
          {showSkillCategories && (
            <>
              <h3>能力覆盖</h3>
              <div>
                {skillCategories.map((category) => (
                  <li key={category.name}>
                    <span>{category.name}: </span>
                    {category.skills.join(', ')}
                  </li>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {showAboutMe && (
        <div className="mb-8 w-full">
          {/* <h2 className="mb-4 text-center text-2xl font-bold">More</h2> */}
          <div className="about-note prose max-w-none border-y border-dashed border-slate-300 py-8 dark:border-slate-700 dark:prose-invert">
            <p>
              As a passionate developer, I'm always eager to learn and grow. Here's a bit more about
              who I am:
            </p>
            <ul>
              <li>
                <strong>Continuous Learner:</strong> Technology evolves rapidly, and I'm committed
                to staying up-to-date with the latest trends and best practices.
              </li>
              <li>
                <strong>Problem Solver:</strong> I enjoy tackling complex challenges and finding
                efficient, elegant solutions.
              </li>
              <li>
                <strong>Team Player:</strong> I believe in the power of collaboration and enjoy
                working with diverse teams to achieve common goals.
              </li>
              <li>
                <strong>Open Source Enthusiast:</strong> I contribute to and learn from open source
                projects, believing in the importance of giving back to the community.
              </li>
              <li>
                <strong>User-Centric Approach:</strong> I always keep the end-user in mind, striving
                to create intuitive and accessible experiences.
              </li>
            </ul>
            <p>
              When I'm not coding, you might find me exploring new technologies, reading tech blogs,
              or participating in local developer meetups. I'm always open to new opportunities and
              collaborations, so feel free to reach out!
            </p>
          </div>
        </div>
      )}

      {showSkillScroll && (
        <div className="skill-stage mb-4 w-full page-reveal reveal-delay-2">
          <h2 className="skill-stage-title mb-5 text-center text-2xl font-bold text-gray-950 dark:text-gray-50">
            所有走过的路，最终都成为能力的一部分。
          </h2>
          <SkillScroll size={68} skills={languageSkills} />
          <SkillScroll size={108} skills={frontendSkills} reverse={true} />
          <SkillScroll size={68} skills={otherSkills} />
        </div>
      )}
    </div>
  )
}
