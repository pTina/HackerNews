// 2022-03-02
// 라우터가 실질적으로 동작하는 코드 작성

// 라우터의 View클래스는 어떤 것이 될지 모른다.
// 단지, 공통점이 있다면 View 클래스를 상속받았다는 것
// 실제로 UI를 업데이트 하는 render() 메소드는 View 클래스가 가질 수 없다.
// 왜? View 클래스르 상속받은 클래스가 구현해야 하는 코드이니까.
// 어떻게 해야 할까?
// (1) render 라는 메소는 UI를 업데이트 하겠다는 공통된 약속
// router가 어떤 것이든 그 이름을 부르면 UI가 업데이트 된다는 약속 하에
// 움직일 수 있는 코드를 만들어 낼 수 있기 때문

// (2) 상위 클래스인 View 클래스 입장에서 보면
// 그 약속을 자식한테 강제시킬 수 있음
// 반드시 View 클래스를 상속받으면 하위 클래스들은 render() 메소드를 구현해라

// 클래스의 속성들에 대해 속성 접근자
// protected, public 지정
// protected 지정해주지 않으면 모두 public이 디폴트로 붙게 되어 있음, 생략도 가능
// => 외부에서 접근하면 안되는 것들이 외부에서 접근이 가능한 경우가 생길 수 있다.

// 인스턴스 객체로 외부에서 접근하는 경우
// (1) 상속받은 클래스 자식 클래스 안에서 접근하는 경우
// (2) 상속 관계가 없는 아얘 바깥쪽에서 인스턴스 객체에 접근하는 경우

// private
// 클래스 안에서만 접근 가능할 수 있게 만드는 속성 접근자
// 자식에서 접근할 수 없다.

// protected
// 외부에서 접근하지 않고 자식요소에서만 접근이 가능한 것

// 클래스와 메소드의 속성의 접근 범위를 적절히 제어함으로써
// 훨씬 더 안전하고 실수를 방지할 수 있는 깨끗한 코드를 만들 수 있다.
// public을 최소한으로 줄일 수 있는 적절한 상태로 만들 수 있게 노력 필요.

interface Store {
    currentPage: number;
    feeds: NewsFeed[];
}

interface News{
    readonly id: number;
    readonly time_ago: string;
    readonly title: string;
    readonly url: string;
    readonly user: string;
    readonly content: string;
}

interface NewsFeed extends News {
    readonly comments_count: number;
    readonly points: number;
    read?: boolean; 
}

interface NewsDetail extends News {
    readonly comments: NewsComment[];
}

interface NewsComment extends News {
    readonly comments: NewsComment[];
}

interface RouteInfo {
    path: string;
    page: View;
}

const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';

const store: Store = {
    currentPage: 1,
    feeds: [],
}

class Api{
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

class NewsFeedApi extends Api{
    getData(): NewsFeed[]{
        return this.getRequest<NewsFeed[]>();
    }
}

class NewsDetailApi extends Api{
    getData(): NewsDetail{
        return this.getRequest<NewsDetail>();
    }
}

// 추상 메소드를 가지는 클래스는 
// 클래스 자체가 abstract 키워드를 가지고 있어야 한다.
abstract class View{
    private template: string;
    // 내부에 template 원본을 유지하고
    // 데이터를 바꿀 때만 원본에서 key를 바꿀 수 있도록
    private renderTemplate: string;
    private container: HTMLElement;
    private htmlList: string[];

    constructor(containerId: string, template: string){
        const containerElement = document.getElementById(containerId);

        if(!containerElement){
            throw '최상위 컨테이터너가 없어 UI를 진행하지 못합니다.';
        }

        this.template = template;
        this.renderTemplate = template;
        this.container = containerElement;
        this.htmlList = [];
    }

    // 외부에서 접근하지 않고 자식요소에서만 접근이 가능한 것
    protected updateView(): void{
        this.container.innerHTML = this.renderTemplate;
        this.renderTemplate = this.template;
    }

    protected addHtml(htmlString: string): void{
        this.htmlList.push(htmlString);
    }

    protected getHtml(): string{
        const snapshot = this.htmlList.join('');

        this.clearHtmlList();

        return snapshot;
    }

    protected setTemplateData(key:string, value: string): void{
        this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, value);
    }

    private clearHtmlList():void{
        this.htmlList = [];
    }

    // 자식들에게 반드시 구현하라고 하는 의미의 마킹
    // => 추상메소드 (abstract 키워드 사용)
    // 반드시 이런 규격의 메소드를 자식 메소드는 구현해야 하는 의무가 생김
    abstract render() : void;


}

class Router {
    routeTable: RouteInfo[]; 
    defaultRoute:  RouteInfo | null;
    constructor(){
        

        
        // window.addEventListener('hashchange', this.route);
        // route 메소드는 브라우저의 이벤트 시스템이 호출시킴
        // 호출이 됐을 때 this 컨텍스트는 Router의 인스턴스가 아니게 된다.
        // 넘겨줄 때 this를 고정 시켜주어야 한다.
        // 현재 등록 시점의 this context
        window.addEventListener('hashchange', this.route.bind(this));

        this.routeTable = [];
        this.defaultRoute = null;
    }

    setDefaultPage(page: View): void{
        this.defaultRoute = { path:'', page};
    }

    addRoutePath(path:string, page: View): void{
        this.routeTable.push({
            path,
            page,
        })

    }

    // 라우터가 실질적으로 동작하는 코드 
    // hash를 가져옴
    // 디폴트 페이지 체크
    route(){
        const routePath = location.hash;

        if(routePath === '' && this.defaultRoute){
            // 현재 모든 뷰 페이지 클래스는
            // View 클래스를 상속 받음
            // UI를 업데이트하는 메소드 -> render 라는 동일한 이름을 가지고 있음

            // 라우터가 View 클래스마다 어떤 메소드가 UI를 업데이트 하는지 알 수 없기 때문에
            // 여태껏 해왔던 약속이 필요한 것이다.

            this.defaultRoute.page.render();
        }

        // routePath에 빈 값이 아닌 다른 값이 들어있으면?
        // routeTable에 들어있는 값들 중에 어떤 값이 맞는지 확인해 가면서
        // 맞으면 해당 페이지에 render()함수를 호출해주면 될 것이다.

        // 기존 for문에 비해 for of의 장점
        // index를 컨트롤하는 0 부터 시작해서 n보다 작은 동안 등의
        // 코드를 작성하지 않아도 되므로 깔끔함
        for (const routeInfo of this.routeTable){
            // 해당 routeInfo.path가 routePath에 있다면
            if(routePath.indexOf(routeInfo.path)>= 0){
                // 해당 페이지에 render() 함수 호출
                routeInfo.page.render();
                // 다른 라우팅은 볼 필요가 없으므로 빠져나감
                break;
            }
        }
        
    }

}

class NewsFeedView extends View{
    private api: NewsFeedApi;
    private feeds: NewsFeed[];
    lastPage: number;

    constructor(containerId:string){
        let template =`
            <div class="continer m-auto p-10">
                <h1 class="mb-10">Hacker News</h1>
                <ul>
                    {{__news_feed__}}
                </ul>
    
                <div class="absolute top-[35px] right-[90px]">
                    <a href="#/page/{{__prev__page__}}" class="mr-10"><i class="fa-solid fa-angle-left text-[50px]"></i></a>
                    <a href="#/page/{{__next__page__}}"><i class="fa-solid fa-angle-right text-[50px]"></i></a>
                </div>
            </div>
        `;

        super(containerId, template);

        this.api = new NewsFeedApi(NEWS_URL);
        this.feeds = store.feeds;
    
        if (this.feeds.length === 0) {
            this.feeds = store.feeds = this.api.getData();
            this.makeFeed();
        }

        this.lastPage = Math.round(this.feeds.length / 10);
        
    }

    render():void {
        // 커런트 페이지를 가져오는 코드 추가
        // 디폴트인 경우 store.currentPage는 없을 것이다.
        // 디폴트로 들어와도 뉴스피드는 보여야 하니깐
        // 없을 땐 1로 넣어라고 지정
        store.currentPage = Number(location.hash.substr(7) || 1);

        for (let i = (store.currentPage - 1) * 10; i < (store.currentPage * 10); i++) {
            const { id, title, user, points, comments_count, read} = this.feeds[i];
            this.addHtml(`
                <li class = "${read ? 'text-pink-700' : 'text-black'} bg-[#533CA6] p-10 mb-10 rounded-xl text-white flex justify-between">
                    <p>
                        <a href="#/show/${id}" class="block">
                            ${title}
                        </a>
                        <span class="mr-5"><i class="fa-solid fa-user mr-2"></i>${user}</span>
                        <span><i class="fa-solid fa-heart mr-2"></i>${points}</span>
                    </p>
                    <p class="flex items-center">
                        <i class="fa-solid fa-comments mr-2"></i>
                        <a href="#/show/${id}">
                            ${comments_count}
                        </a>
                    </p>
                </li>
            `);
        }
    
        this.setTemplateData('news_feed', this.getHtml());
        this.setTemplateData('prev__page', String(store.currentPage > 1 ? store.currentPage - 1 : 1));
        this.setTemplateData('next__page', String(store.currentPage < this.lastPage ? store.currentPage + 1 : this.lastPage));
    
        this.updateView();
    }

    private makeFeed(): void {
        for (let i = 0; i < this.feeds.length; i++) {
            this.feeds[i].read = false;
        }
    }


}

class NewsDetailView extends View{
    
    constructor(containerId:string){
        let template = `
            <div class="continer m-auto p-10">
                <div class="flex justify-between">
                    <h1 class="mb-10">Hacker News</h1>
                    <span><a href="#/page/{{__currentPage__}}"><i class="fa-solid fa-xmark"></i></a></span>
                </div>
                
                <div class="bg-[#533CA6] rounded-xl text-white p-10">
                    <h1>{{__title__}}</h1>
                    <div>{{__content__}}</div>
                    <div>{{__comments__}}</div>
                </div>
            </div>
        `;

        super(containerId, template);
        
    }

    render():void{
        const id = location.hash.substr(7);
        const api = new NewsDetailApi(CONTENT_URL.replace('@id', id));
        const newsDetail: NewsDetail = api.getData();

        for (let i = 0; i < store.feeds.length; i++) {
            if (store.feeds[i].id === Number(id)) {
                store.feeds[i].read = true;
                break;
            }
        }
    
        this.setTemplateData('content', this.makeContent(newsDetail));
        this.setTemplateData('comments', this.makeComment(newsDetail.comments));
        this.setTemplateData('currentPage', String(store.currentPage));
        this.setTemplateData('title', newsDetail.title);

        

        
    
        this.updateView(); 
    }

    private makeContent(newsDedtail:NewsDetail): string{
        if(newsDedtail.content){
            return newsDedtail.content;
    
        }else{
            return `<a href="${newsDedtail.url}" target="_black">link click</a>`;
        }
    }

    private makeComment(comments: NewsComment[], called = 0): string{
        for(let i=0; i<comments.length; i++){
            this.addHtml(`
                <div class="ml-${10*called}">
                    <div class="bg-[#fff] text-[#000]">
                        <i class="fa-solid fa-caret-down"></i>
                        <span class="mr-2">${comments[i].user}</span>
                        <span><i class="fa-solid fa-clock-rotate-left mr-2"></i>${comments[i].time_ago}</span>
                    </div>
                    <div class="ml-10">${comments[i].content}</div>
                </div>
            `);
    
            if(comments[i].comments.length > 0){
                this.addHtml(this.makeComment(comments[i].comments, called+1));
            }
        }
    
        return this.getHtml();
    }


}

const router: Router = new Router(); 
const newFeedView = new NewsFeedView('root');
const newsDetailView = new NewsDetailView('root');

router.setDefaultPage(newFeedView);
router.addRoutePath('/page/', newFeedView);
router.addRoutePath('/show/', newsDetailView);

router.route();






