'use client'

import './styles/duneScroll.css'
import { useEffect } from 'react'

const DunePage = () => {
  useEffect(() => {
    function updateScroller() {
      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      const top = Math.round((scrollY / (documentHeight - viewportHeight)) * 100)
      const bottom = Math.round(
        ((scrollY + viewportHeight - documentHeight) / (documentHeight - viewportHeight)) * 100
      )

      const startPoint = document.querySelector('.start_point')
      const endPoint = document.querySelector('.end_point')
      const scroll = document.querySelector('.scroll') as HTMLDivElement

      if (startPoint && endPoint && scroll) {
        startPoint.textContent = `${top}%`
        endPoint.textContent = `${bottom}%`

        if (viewportHeight + window.pageYOffset > 1.2 * viewportHeight) {
          scroll.style.opacity = '1'
        } else {
          scroll.style.opacity = '0'
        }
      }
    }

    window.addEventListener('scroll', updateScroller)
    window.addEventListener('resize', updateScroller)
    updateScroller()

    return () => {
      window.removeEventListener('scroll', updateScroller)
      window.removeEventListener('resize', updateScroller)
    }
  }, [])

  return (
    <div>
      <div className="ruler">
        <div className="mask start_point">0%</div>
        <div className="mask end_point">0%</div>
        <div className="lines">
          {[...Array(25)].map((_, index) => (
            <span key={index}></span>
          ))}
        </div>
      </div>

      <main id="main">
        <div className="line top"></div>

        <article>
          <h1>Dune</h1>
          <p>
            A beginning is the time for taking the most delicate care that the balances are correct.
            This every sister of the Bene Gesserit knows. To begin your study of the life of
            Muad'Dib, then, take care that you first place him in his time: born in the 57th year of
            the Padishah Emperor, Shaddam IV. And take the most special care that you locate
            Muad'Dib in his place: the planet Arrakis. Do not be deceived by the fact that he was
            born on Caladan and lived his first fifteen years there. Arrakis, the planet known as
            Dune, is forever his place.
          </p>

          <p>—from "Manual of Muad'Dib" by the Princess Irulan</p>

          <p>
            In the week before their departure to Arrakis, when all the final scurrying about had
            reached a nearly unbearable frenzy, an old crone came to visit the mother of the boy,
            Paul.
          </p>

          <p>
            It was a warm night at Castle Caladan, and the ancient pile of stone that had served the
            Atreides family as home for twenty-six generations bore that cooled-sweat feeling it
            acquired before a change in the weather.
          </p>

          <p>
            The old woman was let in by the side door down the vaulted passage by Paul's room and
            she was allowed a moment to peer in at him where he lay in his bed.
          </p>

          <p>
            By the half-light of a suspensor lamp, dimmed and hanging near the floor, the awakened
            boy could see a bulky female shape at his door, standing one step ahead of his mother.
            The old woman was a witch shadow—hair like matted spiderwebs, hooded 'round darkness of
            features, eyes like glittering jewels.
          </p>

          <p>
            “Is he not small for his age, Jessica?” the old woman asked. Her voice wheezed and
            twanged like an untuned baliset.
          </p>

          <p>
            Paul’s mother answered in her soft contralto: “The Atreides are known to start late
            getting their growth, Your Reverence.”
          </p>

          <p>“So I’ve heard, so I’ve heard,” wheezed the old woman. “Yet he’s already fifteen.”</p>

          <p>“Yes, Your Reverence.”</p>

          <p>
            “He’s awake and listening to us,” said the old woman. “Sly little rascal.” She chuckled.
            “But royalty has need of slyness. And if he’s really the Kwisatz Haderach … well….”
          </p>

          <p>
            Within the shadows of his bed, Paul held his eyes open to mere slits. Two bird-bright
            ovals—the eyes of the old woman—seemed to expand and glow as they stared into his.
          </p>

          <p>
            “Sleep well, you sly little rascal,” said the old woman. “Tomorrow you’ll need all your
            faculties to meet my gom jabbar.”
          </p>

          <p>And she was gone, pushing his mother out, closing the door with a solid thump.</p>

          <p>Paul lay awake wondering: What’s a gom jabbar?</p>

          <p>
            In all the upset during this time of change, the old woman was the strangest thing he
            had seen.
          </p>

          <p>
            <i>Your Reverence.</i>
          </p>

          <p>
            And the way she called his mother Jessica like a common serving wench instead of what
            she was—a Bene Gesserit Lady, a duke’s concubine and mother of the ducal heir.
          </p>

          <p>Is a gom jabbar something of Arrakis I must know before we go there? he wondered.</p>

          <p>He mouthed her strange words: Gom jabbar … Kwisatz Haderach.</p>

          <p>
            There had been so many things to learn. Arrakis would be a place so different from
            Caladan that Paul’s mind whirled with the new knowledge. Arrakis—Dune—Desert Planet.
          </p>

          <a
            href="https://www.penguinrandomhouse.ca/books/352036/dune-by-frank-herbert/9780441013593/excerpt"
            target="_blank"
          >
            Excerpt from Dune by Frank Herbert
          </a>
        </article>

        <div className="line bottom"></div>
      </main>

      <a className="scroll" href="#main">
        <div className="container">
          {[...Array(9)].map((_, index) => (
            <div className="rectangle" key={index}></div>
          ))}
        </div>
        <span className="text">Throttle up</span>
      </a>
    </div>
  )
}

export default DunePage
