
// import { 가지고 올 것의 이름 명시 } from 파일경로
// from 하위는 어느 파일을 불러올 것이냐
// ../types/index.ts 파일 불러올 것이다.
// index.ts 파일을 불러올 것이라면 이름 생갹 가능하다.
// NewsFeed, NewsDetail를 가지고 올 것이다.
import { NewsFeed, NewsDetail} from '../types';

export class Api{
    ajax: XMLHttpRequest;
    url: string;

    constructor(url: string){
        this.ajax = new XMLHttpRequest();
        this.url = url;
    }

    getRequest<AjaxResponse>(): AjaxResponse{
        this.ajax.open('GET', this.url, false);
        this.ajax.send();

        return JSON.parse(this.ajax.response);
    }
}

export class NewsFeedApi extends Api{
    getData(): NewsFeed[]{
        return this.getRequest<NewsFeed[]>();
    }
}

export class NewsDetailApi extends Api{
    getData(): NewsDetail{
        return this.getRequest<NewsDetail>();
    }
}