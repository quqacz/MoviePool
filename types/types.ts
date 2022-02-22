interface ShortMovieInfo{
    Title: string,
    Year: string,
    imdbId: string,
    Type: string,
    Poster: string
}

interface FullMovieInfo extends ShortMovieInfo {
    Rated: string,
    Released: string,
    Runtime: string,
    Genre: string,
    Director: string,
    Writer: string,
    Actors: string,
    Plot: string,
    Language: string,
    Country: string,
    Awards: string,
    Metascore: string,
    imdbRating: string,
    imdbVotes: string,
}

type Rating = {
    Source: string,
    Value: string,
}

type FoundMovie = {
    Title: String,
    Year: String,
    imdbID: String,
    Type: String,
    Poster: String
}

export { ShortMovieInfo, FullMovieInfo, Rating, FoundMovie }