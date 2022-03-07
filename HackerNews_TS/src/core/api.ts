
// import { 가지고 올 것의 이름 명시 } from 파일경로
// from 하위는 어느 파일을 불러올 것이냐
// ../types/index.ts 파일 불러올 것이다.
// index.ts 파일을 불러올 것이라면 이름 생갹 가능하다.
// NewsFeed, NewsDetail를 가지고 올 것이다.
import { NewsFeed, NewsDetail} from '../types';

export class Api{
    xhr: XMLHttpRequest;
    url: string;

    constructor(url: string){
        this.xhr = new XMLHttpRequest();
        this.url = url;
    }

    getRequestWithXHR<AjaxResponse>(cb: (data: AjaxResponse) => void): void{
        this.xhr.open('GET', this.url);

        this.xhr.addEventListener('load', () =>{
            // 콜백함수 안에 들어있으므로 리턴할 대상이 없는 상태임
            // 콜백 함수를 받아서 콜백 함수한테 전달해주어야 함
            cb(JSON.parse(this.xhr.response) as AjaxResponse);
        })

        this.xhr.send();

        // 동기식으로 사용할게 open( , ,true) 옵션값을 지우면
        // 바로 response값을 읽을 수 없다.
        // 응답이 오는 데까지 걸리는 시간이 있기 때문에 바로 읽을 수 없다.
        // return JSON.parse(this.ajax.response);
    }

    getRequestWithPromise<AjaxResponse>(cb: (data: AjaxResponse) => void): void{
        fetch(this.url)
            // 응답값을 받아서 바로 받은 값에 JSON 메소드를 호출하면
            // 비동기적으로 JSON을 객체화해서 바꾼다.
            .then(response => response.json())
            // 응답으로 받은 콜백을 넘겨서 데이터를 전달해주는 형태를 취함
            .then(cb)
            // api 호출할 때 에러가 났을 때
            // catch에 제공된 콜백 함수한테 전달이 되면서
            // 에러처리를 할 수 있게 된다 (이론화된 에러처리)
            .catch(()=>{
                console.log('데이터를 불러오지 못했습니다.');
            })
    }
}

export class NewsFeedApi extends Api{
    constructor(url: string){
        super(url);
    }

    getDataWithXHR(cb: (data: NewsFeed[]) => void): void{
        return this.getRequestWithXHR<NewsFeed[]>(cb);
    }

    getDataWithPromise(cb: (data: NewsFeed[]) => void): void{
        return this.getRequestWithPromise<NewsFeed[]>(cb);
    }
}

export class NewsDetailApi extends Api{
    constructor(url: string){
        super(url);
    }

    getDataWithXHR(cb: (data: NewsDetail) => void): void{
        return this.getRequestWithXHR<NewsDetail>(cb);
    }

    getDataWithPromise(cb: (data: NewsDetail) => void): void{
        return this.getRequestWithPromise<NewsDetail>(cb);
    }
}