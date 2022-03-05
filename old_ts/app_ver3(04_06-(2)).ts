// 2022-03-01
// template.replace() 부분 수정

// 터미널 PROBLEMS 탭 확인하면서 수정 진행.

// router 수정 진행

// 클래스를 만드는 방법
// (1) class쪽에서 먼저 구현 하고 -> 사용하는 쪽에서 사용하는 방법을 형태를 바꾸는 형식
// (2) 사용하는 쪽에서 사용하는 형태를 만들고 -> 그것을 class쪽에서 구현하는 형식

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

class View{
    template: string;
    // 내부에 template 원본을 유지하고
    // 데이터를 바꿀 때만 원본에서 key를 바꿀 수 있도록
    renderTemplate: string;
    container: HTMLElement;
    htmlList: string[];

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

    // updateView(html:string): void{
    //     // 결과적으로 넣는 html은 template에 들어있으므로
    //     // this.template로 변경
    //     this.container.innerHTML = html;
        
    // }

    updateView(): void{
        // => setTemplateData에서 this.template가 replace되고 있음
        // 그렇다면 key가 들어있고, value로 변경된 다음
        // 그 template을 다른 내용으로 변경하려면?  
        // key가 사라졌기 때문에 바꿀 수 없음
        // => 그러므로 기존의 teplate 원본이 유지되어 있어야함
        // 계속된 업데이트에서도 새로운 데이터로 업데이트가 가능하다.
        this.container.innerHTML = this.renderTemplate;

        // updateView()가 호출됐다는 것은
        // 데이터 변환 작업이 끝났고, UI를 업데이트 하겠다.
        // 이후에 upDateView 하기 전까지
        // setTemplateData가 다시 호출될 가능성이 있음
        // 그러므로 this.renderTemplate를 원본 데이터로 초기화 해야함
        this.renderTemplate = this.template;

        
    }

    addHtml(htmlString: string): void{
        this.htmlList.push(htmlString);
        // htmlList 배열을 한 번도 초기화하지 않음
        // 다른 뷰에서 add했던 데이터들도 계속 남아있을 수 있음
        // 그러므로 적절한 시점에 클리어 되어야 함
        // 그 시점은? 모든 html만들어진 getHtml()을 호출한 이후
    }

    getHtml(): string{
        // htmlList 초기화 하는 작업 추가
        const snapshot = this.htmlList.join('');

        // this.htmlList = [];
        // this.htmlList를 직접 초기화하는 것은 좋은 방법은 아니다.
        // 다른 곳에서 초기화할 수도 있기 때문에 => 메소드로 제공하는 것으로 변경 clearHtmlList()
        this.clearHtmlList();

        return snapshot;
    }

    // template.replace() 기능을 여기로 이동
    setTemplateData(key:string, value: string): void{
        this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, value);

    }

    clearHtmlList():void{
        this.htmlList = [];
    }


}

// Router
// 라우팅
// 해시가 변경되었을 때 해당하는 페이지를 보여주는 것
// 페이지가 여러 개라고 했을 때 router class를
// if, else를 이용해 변경해주는 것이 좋은 모양일까?
// 그렇지 않다.
// Router class는 기능을 제공하고
// 그 기능을 이용해서 외부에서 특정한 Hash 값이 되면
// 어떤 페이지로 이동하게끔 설정할 수 있는 모양으로 변경되어야 함
class Router {
    routeTable: RouteInfo[]; 
    // 디폴트 페이지가 없을수도 있으니까
    defaultRoute:  RouteInfo | null;
    constructor(){
        

        const routePath = location.hash;
        window.addEventListener('hashchange', router);

        this.routeTable = [];
        this.defaultRoute = null;
    }

    setDefaultPage(page: View): void{
        this.defaultRoute = { path:'', page};
    }

    // 계속 추가가 되어야 하는 구조
    // 배열이 하나 필요함
    // 이름과 값이 같은 경우 생략 가능
    addRoutePath(path:string, page: View): void{
        this.routeTable.push({
            path,
            page,
        })

    }

}

class NewsFeedView extends View{
    api: NewsFeedApi;
    feeds: NewsFeed[];
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
    
        // View class에서 모두 등장하는 기능
        // 상위 클래스로 이동
        // 직접 하지 않고 기능을 제공한다 컨셉 유지
        this.setTemplateData('news_feed', this.getHtml());
        this.setTemplateData('prev__page', String(store.currentPage > 1 ? store.currentPage - 1 : 1));
        this.setTemplateData('next__page', String(store.currentPage < this.lastPage ? store.currentPage + 1 : this.lastPage));
    
        this.updateView();
    }

    makeFeed(): void {
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

    makeContent(newsDedtail:NewsDetail): string{
        if(newsDedtail.content){
            return newsDedtail.content;
    
        }else{
            return `<a href="${newsDedtail.url}" target="_black">link click</a>`;
        }
    }

    makeComment(comments: NewsComment[], called = 0): string{
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

// function router(): void {
//     const routePath = location.hash;

//     if (routePath === '') {
//         newsFeed();

//     } else if (routePath.indexOf('#/page/') >= 0) {
//         store.currentPage = Number(routePath.substr(7));
//         newsFeed();

//     } else {
//         newsDetail();
//     }
// }


// window.addEventListener('hashchange', router);

// router();

// 라우터한테 
// 이런 hash값이 들어갔을 때 이 페이지로 이동시켜 줘
// 페이지에 class 인스턴스를 넘겨 주면 라우터가 알아서 작동하는 형태로 만들면 좋을듯
const router: Router = new Router(); 
const newFeedView = new NewsFeedView('root');
const newsDetailView = new NewsDetailView('root');

router.setDefaultPage(newFeedView);
router.addRoutePath('/page/', newFeedView);
router.addRoutePath('/show/', newsDetailView);






