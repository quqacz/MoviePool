import { ShortMovieInfo, FullMovieInfo } from './types/types'
import axios, { AxiosResponse, AxiosError } from 'axios'

function getMovieInfo(id: string, apiKey:string) {
    const promise = axios.get<FullMovieInfo>(`http://www.omdbapi.com/?i=${id}&apikey=${apiKey}&`)
    const dataPromise = promise.then((response: AxiosResponse) => response.data)

    return dataPromise
}

export { getMovieInfo }