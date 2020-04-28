const prompt = require('prompt')
const builder = require('xmlbuilder')
const fs = require('fs')
const api = require('./api')

let mediaType = {
  properties: {
    typeID: {
      description: 'Enter Media Type: 1) Movie, 2) TV',
      type: 'integer',
      pattern: /^1$|^2$/,
      message: 'Invalid Option'
    }
  }
}

prompt.start()

prompt.get(mediaType, function (err, result) {
  if (err) { return onErr(err) }
  if (result.typeID == 1) {
    startMoviePrompt()
  } else {
    startTvPrompt()
  }
})

function startMoviePrompt() {
  let moviePrompt = {
    properties: {
      imdbId: {
        description: 'Enter IMDB ID',
        type: 'string',
        pattern: /(tt)\d*/,
        message: 'IMDB ID begins with tt and ends with numbers. '
      },
      movieDbId: {
        description: 'Enter MovieDB ID',
        type: 'string',
        pattern: /(movie\/)\d*/,
        message: 'MovieDB ID for Movie begins with movie/ and ends with numbers. '
      }
    }
}

  prompt.start()

  prompt.get(moviePrompt, function (err, result) {
    if (err) { return onErr(err) }
    generateMovieXml(result.imdbId, result.movieDbId)
  })

  function onErr(err) {
    console.log(err)
    return 1
  }
}

function startTvPrompt() {
  let tvPrompt = {
    properties: {
      imdbId: {
        description: 'Enter IMDB ID',
        type: 'string',
        pattern: /(tt)\d*/,
        message: 'IMDB ID begins with tt and ends with numbers. '
      },
      movieDbId: {
        description: 'Enter MovieDB ID',
        type: 'string',
        pattern: /(tv\/)\d*/,
        message: 'MovieDB ID for TV begins with tv/ and ends with numbers. '
      },
      tvDbId: {
        description: 'Enter TVDB ID',
        type: 'integer',
        pattern: /\d*/,
        message: 'TVDB ID only contains numbers. '
      }
    }
  }

  prompt.start()

  prompt.get(tvPrompt, function (err, result) {
    if (err) { return onErr(err) }
    generateTvXml(result.imdbId, result.movieDbId, result.tvDbId)
  })

  function onErr(err) {
    console.log(err)
    return 1
  }
}

function generateMovieXml(imdbId, movieDbId) {
  console.log(imdbId, movieDbId)
  let movieData = builder.create('Tags', { version: '1.0', encoding: 'UTF-8'} ).dtd('matroskatags.dtd').up()

  let obj1 = {
    'Tag': {
      'Targets': { 'TargetTypeValue': '50' },
      'Simple': {
        'Name': 'IMDB',
        'String': imdbId
      }
    }
  }

  let obj2 = {
    'Simple': {
      'Name': 'TMDB',
      'String': movieDbId
    }
  }

  movieData = movieData.ele(obj1).ele(obj2).end({ pretty: true })
  
  fs.writeFile(`${imdbId}.xml`, movieData, (err) => {
      if (err) throw err
      console.log('File saved!')
  })
}

function generateTvXml(imdbId, movieDbId, tvDbId) {
  // let imdbTvData = api.imdb(imdbId)
  console.log(imdbId, movieDbId, tvDbId)
}
