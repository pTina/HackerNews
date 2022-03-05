import { NewsFeed } from './types';

// implements 실제 Store 인터페이스를 구현한 클래스다를 의미함
export default class Store implements Store{
    // private 사용하지 않으면
    // 외부에 다른 class 코드에서 feed나 currentPage를 직접적으로 제어하게 됨
    // 읽는건 상관 없지만
    // 값을 넣는 것은 제어가 안 됨
    // 어떤 값을 넣으지 실수는 항상 존재함
    // => 원천적으로 잘못 세팅되는 것을 방어 하기 위해
    // private 사용해서 외부에 노출시지키 않게 함

    // private 선언으로 외부에서 해당 데이터를 사용할 수 없게됨
    // 외부에서 사용할 수 있도록 기능을 제공해주면 됨 
    private feeds: NewsFeed[];
    private _currentPage: number;
    constructor(){
        this.feeds = [];
        this._currentPage = 1;
    }

    // 내부에서는 함수처럼 작동하지만 외부에서는 속성처럼 보이게 하는
    // getter, setter 문법 사용

    get currentPage(){
        return this._currentPage;
    }

    // _currentPage는 외부로부터 데이터를 세팅하기도 함
    // setter => 대입문으로 쓸 수 있게 만들어주는 것
    set currentPage(page: number){
        this._currentPage = page;
    }

    get nextPage():number{
        return this._currentPage +1;
    } 

    get prevPage():number{
        return this._currentPage > 1 ? this._currentPage -1 : 1;
    } 

    get numberOfFeed(): number{
        return this.feeds.length;
    }

    get hasFeeds(): boolean{
        // this.feeds.length가 0보다 크면 true 거짓이면 false를 리턴하게 됨
        return this.feeds.length > 0;
    }

    get feedsLength(): number{
        return this.feeds.length;
    }

    // 전체 피드 내보내는 함수
    getAllFeed(): NewsFeed[]{
        return this.feeds;
    }

    // 특정 위치에 있는 피드 하나를 꺼내오는 함수
    getFeed(position: number): NewsFeed {
        return this.feeds[position];
    }

    // read 속성을 추가하고 false로 초기화해주는 함수
    setFeeds(feeds: NewsFeed[]): void{
        this.feeds = feeds.map(feed => ({
            ...feed,    // 스프레드 오퍼레이터
            read: false // 추가된 속성 read의 값을 false로 초기화
        }));
    }

    // read를 true로 만들어주는 함수
    makeRead(id: number): void{
        // 인자로 feed가 넘어오고
        // feed.id와 넘어온 인자인 id가 같으면 같은 것이 있으면 그 값이 리턴됨
        const feed = this.feeds.find((feed: NewsFeed) => feed.id === id);

        // 만약에 있으면
        // feed.read 값을 true를 바꿔주세요.
        if(feed){
            feed.read = true;
        }
    }

}