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
    Ratings: Rating[],	
    Metascore: string,
    imdbRating: string,
    imdbVotes: string,
    DVD: string,
    BoxOffice: string,
    Production: string,
    Website: string,
    Response: string,
}

type Rating = {
    Source: string,
    Value: string,
}

export { ShortMovieInfo, FullMovieInfo, Rating }