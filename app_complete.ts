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

abstract class View{
    private template: string;
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

    abstract render() : void;

}

class Router {
    routeTable: RouteInfo[]; 
    defaultRoute:  RouteInfo | null;
    constructor(){
        
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

    route(){
        const routePath = location.hash;

        if(routePath === '' && this.defaultRoute){
            this.defaultRoute.page.render();
        }

        for (const routeInfo of this.routeTable){
            if(routePath.indexOf(routeInfo.path)>= 0){
                routeInfo.page.render();
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






