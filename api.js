module.exports = {
  imdbMovie: function (imdbID, apiKey, callback) {
    const request = require("request")

    const options = {
      method: 'GET',
      url: 'https://imdb8.p.rapidapi.com/title/get-overview-details',
      qs: {tconst: imdbID},
      headers: {
        'x-rapidapi-host': 'imdb8.p.rapidapi.com',
        'x-rapidapi-key': apiKey
      }
    }

    request(options, function (error, response, body) {
      if (error) return callback(error)
      else callback(null, body)
    })
  },

  imdbTv: function (imdbID, apiKey, callback) {
    const request = require("request")

    const options = {
      method: 'GET',
      url: 'https://imdb8.p.rapidapi.com/title/get-seasons',
      qs: {tconst: imdbID},
      headers: {
        'x-rapidapi-host': 'imdb8.p.rapidapi.com',
        'x-rapidapi-key': apiKey
      }
    }

    request(options, function (error, response, body) {
      if (error) return callback(error)
      else callback(null, body)
    })
  }
}