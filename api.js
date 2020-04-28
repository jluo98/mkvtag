module.exports = {
  imdb: function (imdbID) {
    console.log(imdbID)

    let request = require("request")

    let options = {
      method: 'GET',
      url: 'https://imdb8.p.rapidapi.com/title/get-seasons',
      qs: {tconst: imdbID},
      headers: {
        'x-rapidapi-host': 'imdb8.p.rapidapi.com',
        'x-rapidapi-key': 'f51de4a793mshf4fbb2145270d6dp1914aejsnb80c8124ce77'
      }
    }

    request(options, function (error, response, body) {
      if (error) throw new Error(error)

      console.log(body)
    })
  }
}