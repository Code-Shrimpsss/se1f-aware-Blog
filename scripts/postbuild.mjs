import rss from './rss.mjs'

async function postbuild() {
  await rss()
  console.log('postbuild')
}

postbuild()
