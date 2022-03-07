
import { NewsFeed, NewsDetail} from '../types';

export class Api{
    xhr: XMLHttpRequest;
    url: string;

    constructor(url: string){
        this.xhr = new XMLHttpRequest();
        this.url = url;
    }

    // async를 붙여줌으로써 비동기 함수가 된다.
    // 리턴 값으로는 Promise 객체를 리턴하는 함수가 된다는 뜻이다.
    // 리턴 값에 Promise를 명시해주어야 한다.
    async request<AjaxResponse>(): Promise<AjaxResponse>{
        const response = await fetch(this.url);
        // 리턴하는게 Promise 객체이기 때문에 await을 붙여준다.
        return await response.json() as AjaxResponse;
    }
}

export class NewsFeedApi extends Api{
    constructor(url: string){
        super(url);
    }


    // 비동기 함수를 호출하는 함수도 비동기 함수여야 한다.
    async getData(): Promise<NewsFeed[]>{
        return this.request<NewsFeed[]>();
    }
}

export class NewsDetailApi extends Api{
    constructor(url: string){
        super(url);
    }

    async getData(): Promise<NewsDetail>{
        return this.request<NewsDetail>();
    }
}