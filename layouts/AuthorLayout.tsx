import { ReactNode } from 'react'
import type { Authors } from 'contentlayer/generated'
import SocialIcon, { SocialIconKind } from '@/components/social-icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  return (
    <div className="mb-[16px] inline-flex w-full flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]">
      {[0, 1].map((key) => (
        <ul
          key={key}
          className={`flex ${animationClass} items-center [&_li]:mx-[8px]`}
          aria-hidden={key === 1}
        >
          {skills.map((skill, idx) => (
            <li
              key={idx}
              className={`flex items-center justify-center whitespace-nowrap rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200`}
            >
              {skill.darkIcon ? (
                <>
                  {React.cloneElement(skill.icon, {
                    style: { width: `${size}px`, height: `${size}px` },
                    className: 'dark:hidden',
                  })}
                  {React.cloneElement(skill.darkIcon, {
                    style: { width: `${size}px`, height: `${size}px` },
                    className: 'hidden dark:block',
                  })}
                </>
              ) : (
                React.cloneElement(skill.icon, {
                  style: { width: `${size}px`, height: `${size}px` },
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
    <>
      {showHeader && (
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            About Me
          </h1>
        </div>
      )}
      <div className="items-start space-y-2 ">
        {showAvatar && (
          <div className="flex flex-col items-center space-x-2 pt-8">
            {avatar && (
              <Avatar className="h-28 w-28 rounded-full">
                <AvatarImage src={avatar} alt="avatar" />
                <AvatarFallback delayMs={600}>{name}</AvatarFallback>
              </Avatar>
            )}
            <h3 className="pb-2 pt-4 text-2xl font-bold leading-8 tracking-tight">{name}</h3>
            <div className="text-gray-500 dark:text-gray-400">
              <IconBrandPiedPiperHat className="mx-1 translate-y-0.5" />
              {occupation}
            </div>
            <div className="text-gray-500 dark:text-gray-400">{company}</div>
            <div className="flex space-x-3 pt-6">
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
                My Skills
              </h2>
              <h3>Mainly Coding Follow</h3>
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
              <h3>I'm good at using these skills.</h3>
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
          <div className="prose max-w-none dark:prose-invert">
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
        <div className="mb-4 w-full">
          <h2 className="mb-4 text-center text-2xl font-bold">
            I'am the sum of all my past experiences.
          </h2>
          <SkillScroll size={68} skills={languageSkills} />
          <SkillScroll size={108} skills={frontendSkills} reverse={true} />
          <SkillScroll size={68} skills={otherSkills} />
        </div>
      )}
    </>
  )
}
