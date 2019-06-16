/* global describe, it, expect */

import ssr from './ssr'

describe('Server-side rendering', () => {
  it('returns the HTML for a page', () => {
    const meta = {
      title: 'SSR Test',
      description: 'This is a test of the SSR function'
    }
    const actual = ssr('<p>Hello world</p>', meta, 'debug')
    const expected = `<!DOCTYPE html>
<html>
  <head>
    <title>SSR Test</title>
    <link rel="apple-touch-icon" sizes="180x180" href="https://s3.amazonaws.com/thefifthworld/website/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="https://s3.amazonaws.com/thefifthworld/website/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="https://s3.amazonaws.com/thefifthworld/website/favicon-16x16.png" />
    <link rel="manifest" href="https://s3.amazonaws.com/thefifthworld/website/manifest.json" />
    <link rel="mask-icon" href="https://s3.amazonaws.com/thefifthworld/website/safari-pinned-tab.svg" color="#5bbad5" />
    <meta name="theme-color" content="#ffffff" />

    <link rel="stylesheet" media="all" href="/css/style.css" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="This is a test of the SSR function" />

    <!-- Twitter Card data -->
    <meta name="twitter:title" content="SSR Test" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@thefifthworld" />
    <meta name="twitter:description" content="This is a test of the SSR function" />
    <meta name="twitter:image" content="https://s3.amazonaws.com/thefifthworld/website/images/social/default.jpg" />

    <!-- Open Graph data -->
    <meta property="og:title" content="SSR Test" />
    <meta property="og:site_name" content="The Fifth World" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://thefifthworld.com" />
    <meta property="og:description" content="This is a test of the SSR function" />
    <meta property="og:image" content="https://s3.amazonaws.com/thefifthworld/website/images/social/default.jpg" />
    <meta property="fb:app_id" content="241682169673933" />
  </head>
  <body>
    <div id="root"><p>Hello world</p></div>
    <script>window.__INITIAL_STATE__ = "debug"</script>
    <script src="/bundle.js" defer="defer"></script>
  </body>
</html>`
    expect(actual).toEqual(expected)
  })

  it('handles Twitter and OpenGraph values', () => {
    const meta = {
      title: 'SSR Test',
      description: 'This is a test of the SSR function',
      twitter: {
        description: 'Twitter Card test',
        image: 'twitter.png'
      },
      og: {
        title: 'SSR Test for OpenGraph',
        url: 'test',
        image: 'og.png'
      }
    }
    const actual = ssr('<p>Hello world</p>', meta, 'debug')
    const expected = `<!DOCTYPE html>
<html>
  <head>
    <title>SSR Test</title>
    <link rel="apple-touch-icon" sizes="180x180" href="https://s3.amazonaws.com/thefifthworld/website/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="https://s3.amazonaws.com/thefifthworld/website/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="https://s3.amazonaws.com/thefifthworld/website/favicon-16x16.png" />
    <link rel="manifest" href="https://s3.amazonaws.com/thefifthworld/website/manifest.json" />
    <link rel="mask-icon" href="https://s3.amazonaws.com/thefifthworld/website/safari-pinned-tab.svg" color="#5bbad5" />
    <meta name="theme-color" content="#ffffff" />

    <link rel="stylesheet" media="all" href="/css/style.css" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="This is a test of the SSR function" />

    <!-- Twitter Card data -->
    <meta name="twitter:title" content="SSR Test" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@thefifthworld" />
    <meta name="twitter:description" content="Twitter Card test" />
    <meta name="twitter:image" content="twitter.png" />

    <!-- Open Graph data -->
    <meta property="og:title" content="SSR Test for OpenGraph" />
    <meta property="og:site_name" content="The Fifth World" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="test" />
    <meta property="og:description" content="This is a test of the SSR function" />
    <meta property="og:image" content="og.png" />
    <meta property="fb:app_id" content="241682169673933" />
  </head>
  <body>
    <div id="root"><p>Hello world</p></div>
    <script>window.__INITIAL_STATE__ = "debug"</script>
    <script src="/bundle.js" defer="defer"></script>
  </body>
</html>`
    expect(actual).toEqual(expected)
  })

  it('can handle arbitrary meta tags', () => {
    const meta = {
      title: 'SSR Test',
      description: 'This is a test of the SSR function',
      test: 'pass'
    }
    const actual = ssr('<p>Hello world</p>', meta, 'debug')
    const expected = `<!DOCTYPE html>
<html>
  <head>
    <title>SSR Test</title>
    <link rel="apple-touch-icon" sizes="180x180" href="https://s3.amazonaws.com/thefifthworld/website/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="https://s3.amazonaws.com/thefifthworld/website/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="https://s3.amazonaws.com/thefifthworld/website/favicon-16x16.png" />
    <link rel="manifest" href="https://s3.amazonaws.com/thefifthworld/website/manifest.json" />
    <link rel="mask-icon" href="https://s3.amazonaws.com/thefifthworld/website/safari-pinned-tab.svg" color="#5bbad5" />
    <meta name="theme-color" content="#ffffff" />

    <link rel="stylesheet" media="all" href="/css/style.css" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="This is a test of the SSR function" />

    <!-- Twitter Card data -->
    <meta name="twitter:title" content="SSR Test" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@thefifthworld" />
    <meta name="twitter:description" content="This is a test of the SSR function" />
    <meta name="twitter:image" content="https://s3.amazonaws.com/thefifthworld/website/images/social/default.jpg" />

    <!-- Open Graph data -->
    <meta property="og:title" content="SSR Test" />
    <meta property="og:site_name" content="The Fifth World" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://thefifthworld.com" />
    <meta property="og:description" content="This is a test of the SSR function" />
    <meta property="og:image" content="https://s3.amazonaws.com/thefifthworld/website/images/social/default.jpg" />
    <meta property="fb:app_id" content="241682169673933" />

    <!-- Other -->
    <meta name="test" content="pass" />
  </head>
  <body>
    <div id="root"><p>Hello world</p></div>
    <script>window.__INITIAL_STATE__ = "debug"</script>
    <script src="/bundle.js" defer="defer"></script>
  </body>
</html>`
    expect(actual).toEqual(expected)
  })

  it('can handle null meta', () => {
    const actual = ssr('<p>Hello world</p>', null, 'debug')
    const expected = `<!DOCTYPE html>
<html>
  <head>
    <title>The Fifth World</title>
    <link rel="apple-touch-icon" sizes="180x180" href="https://s3.amazonaws.com/thefifthworld/website/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="https://s3.amazonaws.com/thefifthworld/website/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="https://s3.amazonaws.com/thefifthworld/website/favicon-16x16.png" />
    <link rel="manifest" href="https://s3.amazonaws.com/thefifthworld/website/manifest.json" />
    <link rel="mask-icon" href="https://s3.amazonaws.com/thefifthworld/website/safari-pinned-tab.svg" color="#5bbad5" />
    <meta name="theme-color" content="#ffffff" />

    <link rel="stylesheet" media="all" href="/css/style.css" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Four centuries from now, humanity thrives beyond civilization." />

    <!-- Twitter Card data -->
    <meta name="twitter:title" content="The Fifth World" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@thefifthworld" />
    <meta name="twitter:description" content="Four centuries from now, humanity thrives beyond civilization." />
    <meta name="twitter:image" content="https://s3.amazonaws.com/thefifthworld/website/images/social/default.jpg" />

    <!-- Open Graph data -->
    <meta property="og:title" content="The Fifth World" />
    <meta property="og:site_name" content="The Fifth World" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://thefifthworld.com" />
    <meta property="og:description" content="Four centuries from now, humanity thrives beyond civilization." />
    <meta property="og:image" content="https://s3.amazonaws.com/thefifthworld/website/images/social/default.jpg" />
    <meta property="fb:app_id" content="241682169673933" />
  </head>
  <body>
    <div id="root"><p>Hello world</p></div>
    <script>window.__INITIAL_STATE__ = "debug"</script>
    <script src="/bundle.js" defer="defer"></script>
  </body>
</html>`
    expect(actual).toEqual(expected)
  })
})
