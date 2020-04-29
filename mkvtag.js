const prompt = require('prompt')
const builder = require('xmlbuilder')
const fs = require('fs')
const api = require('./api')

let apiKey = ''
let inputArgs = process.argv.slice(2)

if (inputArgs.length === 0) {
  if (fs.existsSync('./apiKey.json')){
    getApiKey()
    startFirstPrompt()
  } else {
    console.log('You have not setup your API key. Please run [ mkvtag setup ]. ')
  }
} else if (inputArgs[0] === 'setup') {
  writeApiKey()
} else {
  console.log('Invalid Argument. ')
}

function getApiKey() {
  let apiKeyFile = JSON.parse(fs.readFileSync('apiKey.json'))
  apiKey = apiKeyFile.key
}

function writeApiKey() {
  let keyPrompt = {
    properties: {
      apiKeyInput: {
        description: 'Enter your API key obtained from http://rapidapi.com/apidojo/api/imdb8',
        type: 'string'
      }
    }
  }

  prompt.start()

  prompt.get(keyPrompt, function (err, result) {
    if (err) { return onErr(err) }
    let keyFile = { 'key': result.apiKeyInput }
    let writeData = JSON.stringify(keyFile)
    fs.writeFileSync('apiKey.json', writeData)
    console.log('Setup finished. Please run [ mkvtag ]. ')
  })
}

function startFirstPrompt() {
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
}

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
  let movieXml = builder.create('Tags', { version: '1.0', encoding: 'UTF-8'} ).dtd('matroskatags.dtd').up()

  let objImdb = {
    'Tag': {
      'Targets': { 'TargetTypeValue': '50' },
      'Simple': {
        'Name': 'IMDB',
        'String': imdbId
      }
    }
  }

  let objTmdb = {
    'Simple': {
      'Name': 'TMDB',
      'String': movieDbId
    }
  }

  movieXml = movieXml.ele(objImdb).ele(objTmdb).end({ pretty: true })

  api.imdbMovie(imdbId, apiKey, function(err, res) { 
    if (err) { console.log(err) } else {
      saveMovieXml(JSON.parse(res).title)
    }
  })

  function saveMovieXml(data) {
    if (!fs.existsSync('./output')){
      fs.mkdirSync('./output');
    }
    fs.writeFile(`./output/${data.title}.${data.year}.xml`, movieXml, (err) => {
      if (err) throw err
      console.log(`XML for movie [ ${data.title} (${data.year}) ] has been saved to the output folder. `)
    })
  }
}

function generateTvXml(imdbId, movieDbId, tvDbId) {
  api.imdbTv(imdbId, apiKey, function(err, res) { 
    if (err) { console.log(err) } else {
      saveTvXml(JSON.parse(res))
    }
  })

  function saveTvXml(data) {
    api.imdbMovie(imdbId, apiKey, function(err, res) { 
      if (err) { console.log(err) } else {
        startLoop(JSON.parse(res).title.title)
      }
    })

    function startLoop(tvTitle) {
      for (var m = 0; m < data.length; m++) {
        let seasonNumber = m + 1
        for (var n = 0; n < data[m].episodes.length; n++) {
          let episodeNumber = n + 1
          let episodeTotal = data[m].episodes.length
          let episodeTitle = data[m].episodes[n].title
          let episodeId = data[m].episodes[n].id.replace(/\//g, '').replace('title', '')

          let tvXml = builder.create('Tags', { version: '1.0', encoding: 'UTF-8'} ).dtd('matroskatags.dtd').up()

          let objTvImDb = {
            'Tag': {
              'Targets': { 'TargetTypeValue': '70' },
              'Simple': {
                'Name': 'IMDB',
                'String': imdbId
              }
            }
          }

          let objTvTmDb = {
            'Simple': {
              'Name': 'TMDB',
              'String': movieDbId
            }
          }

          let objTvTvDb = {
            'Simple': {
              'Name': 'TVDB',
              'String': tvDbId
            }
          }

          tvXml = tvXml.ele(objTvImDb).ele(objTvTmDb).up().ele(objTvTvDb).up().up()

          let objSeasonNumber = {
            'Tag': {
              'Targets': { 'TargetTypeValue': '60' },
              'Simple': {
                'Name': 'PART_NUMBER',
                'String': seasonNumber
              }
            }
          }

          let objTotlaEpisode = {
            'Simple': {
              'Name': 'TOTAL_PARTS',
              'String': episodeTotal
            }
          }

          tvXml = tvXml.ele(objSeasonNumber).ele(objTotlaEpisode).up().up()

          let objEpisodeNumber = {
            'Tag': {
              'Targets': { 'TargetTypeValue': '50' },
              'Simple': {
                'Name': 'PART_NUMBER',
                'String': episodeNumber
              }
            }
          }

          let objEpisodeImdb = {
            'Simple': {
              'Name': 'IMDB',
              'String': episodeId
            }
          }

          tvXml = tvXml.ele(objEpisodeNumber).ele(objEpisodeImdb).end({ pretty: true })

          let tvTitleNoSpace = tvTitle.replace(/\s/g, '.')
          let seasonNumberPadded = pad(seasonNumber, 2)
          let episodeNumberPadded = pad(episodeNumber, 2)

          if (!fs.existsSync('./output')){
            fs.mkdirSync('./output');
          }

          if (!fs.existsSync(`./output/${tvTitleNoSpace}.S${seasonNumberPadded}`)){
            fs.mkdirSync(`./output/${tvTitleNoSpace}.S${seasonNumberPadded}`);
          }

          fs.writeFile(`./output/${tvTitleNoSpace}.S${seasonNumberPadded}/${tvTitleNoSpace}.S${seasonNumberPadded}.E${episodeNumberPadded}.xml`, tvXml, (err) => {
            if (err) throw err
            console.log(`XML for TV [ ${tvTitle} S${seasonNumberPadded} E${episodeNumberPadded} ] has been saved to the output folder. `)
          })
        }
      }
    }
  }
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}