const axios = require('axios')

async function getUpcomingMovies(){
    const options = {
        method: 'GET',
        url: 'https://imdb8.p.rapidapi.com/title/get-coming-soon-movies',
        params: {homeCountry: 'US', purchaseCountry: 'US', currentCountry: 'US'},
        headers: {
          'x-rapidapi-host': process.env.X_HOST,
          'x-rapidapi-key': process.env.X_KEY
        }
    }
    const ids = await axios.request(options)
    return ids.data
}

export { getUpcomingMovies }