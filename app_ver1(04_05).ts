

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

const container: HTMLElement | null = document.getElementById('root');

const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';

// 타입스크립트의 공식 문서에서도 소개되어 있는 믹스인 관련된 코드
// 가져다 써도 전혀 문제 없음, 안정적으로 작동되는 코드
// 믹스인을 구현하기 위한 방법 중 하나
// targetClass에 제공된 class에 baseClass로 제공된 n개의 class들의 기능들을 합성시킨다.
// function applyApiMixins(targetClass: any, baseClass: any[]):void{
//     baseClass.forEach(baseClass =>{
//         Object.getOwnPropertyNames(baseClass.prototype).forEach(name => {
//             const descriptor = Object.getOwnPropertyDescriptor(baseClass.prototype, name);

//             if(descriptor){
//                 Object.defineProperty(targetClass.prototype, name, descriptor);
//             }
//         })
//     })
// }

const store: Store = {
    currentPage: 1,
    feeds: [],
}

class Api{
    // 프로퍼티를 미리 등록 후 사용
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
        // this.getRequest => error?
        // 코드 상으로 해당 Api class와 NewsFreedApi가 아무런 연관 관계가 없음
        // => 믹스인 함수를 통해 Api, NesFeedApi 2개의 class가 합성된다는 것까지 추적하지 못함
        // => this.getRequest 호출을 용납하지 못함
        // TS 컴파일러에게 합성될 클래스를 알려주어야 함 
        return this.getRequest<NewsFeed[]>();
    }
}

class NewsDetailApi extends Api{
    getData(): NewsDetail{
        return this.getRequest<NewsDetail>();
    }
}

// interface NewsFeedApi extends Api{};

// 내가 기능을 확장할 대상 class를 먼저 적는다.
// nessFeedApi가 api에게 어떤 기능을 추가해 줄 거야
// 어떤기능? Api class에 있는 기능
// applyApiMixins 함수는 어떤 기능을 가져야 하냐?
// -> 첫 번째 인자로 받은 클래스한테 두번째 인자로 받은 클래스의 내용을 상속시켜주는 기능
// 두 번째 인자로 받는 class의 내용들을 첫 번째 인자로 옮겨주는 역할
// (class의 extends가 문법적으로 해 줬던 역할을 대신한다고 말할 수 있음)
// 다중상속을 위해 두번째 인자는 배열로!
// applyApiMixins(NewsFeedApi, [Api]);
// applyApiMixins(NewsDetailApi, [Api]);

function makeFeed(feeds: NewsFeed[]): NewsFeed[] {
    for (let i = 0; i < feeds.length; i++) {
        feeds[i].read = false;
    }

    return feeds;
}

function newsFeed():void {
    let api = new NewsFeedApi(NEWS_URL);
    let newsFeed: NewsFeed[] = store.feeds;
    let lastPage = Math.round(newsFeed.length / 10);
    const newsList = [];

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

    if (newsFeed.length === 0) {
        newsFeed = store.feeds = makeFeed(api.getData());
    }

    for (let i = (store.currentPage - 1) * 10; i < (store.currentPage * 10); i++) {
        newsList.push(`
            <li class = "${newsFeed[i].read ? 'text-pink-700' : 'text-black'} bg-[#533CA6] p-10 mb-10 rounded-xl text-white flex justify-between">
                <p>
                    <a href="#/show/${newsFeed[i].id}" class="block">
                        ${newsFeed[i].title}
                    </a>
                    <span class="mr-5"><i class="fa-solid fa-user mr-2"></i>${newsFeed[i].user}</span>
                    <span><i class="fa-solid fa-heart mr-2"></i>${newsFeed[i].points}</span>
                </p>
                <p class="flex items-center">
                    <i class="fa-solid fa-comments mr-2"></i>
                    <a href="#/show/${newsFeed[i].id}">
                        ${newsFeed[i].comments_count}
                    </a>
                </p>
            </li>
        `);
    }

    template = template.replace('{{__news_feed__}}', newsList.join(''));
    template = template.replace('{{__prev__page__}}', String(store.currentPage > 1 ? store.currentPage - 1 : 1));
    template = template.replace('{{__next__page__}}', String(store.currentPage < lastPage ? store.currentPage + 1 : lastPage));

    updateView(template);

}

// newsDetail
function makeContent(newsDedtail:NewsDetail): string{
    if(newsDedtail.content){
        return newsDedtail.content;

    }else{
        return `<a href="${newsDedtail.url}" target="_black">link click</a>`;
    }
}

function makeComment(comments: NewsComment[], called = 0): string{
    const commentString = [];

    for(let i=0; i<comments.length; i++){
        commentString.push(`
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
            commentString.push(makeComment(comments[i].comments, called+1));
        }
    }

    return commentString.join('');
}

function newsDetail():void {
    const id = location.hash.substr(7);
    const api = new NewsDetailApi(CONTENT_URL.replace('@id', id));
    const newsDetail: NewsDetail = api.getData();

    let template = `
        <h1>${newsDetail.title}</h1><div><a href="#/page/${store.currentPage}">목록으로</a></div>
        <div class="continer m-auto p-10">
            <div class="flex justify-between">
                <h1 class="mb-10">Hacker News</h1>
                <span><a href="#/page/${store.currentPage}"><i class="fa-solid fa-xmark"></i></a></span>
            </div>
            
            <div class="bg-[#533CA6] rounded-xl text-white p-10">
                <h1>${newsDetail.title}</h1>
                <div>{{__content__}}</div>
                <div>{{__comments__}}</div>
            </div>
        </div>
    `;

    for (let i = 0; i < store.feeds.length; i++) {
        if (store.feeds[i].id === Number(id)) {
            store.feeds[i].read = true;
            break;
        }
    }

    template = template.replace('{{__content__}}', makeContent(newsDetail));
    template = template.replace('{{__comments__}}', makeComment(newsDetail.comments));

    updateView(template);
}

function router(): void {
    const routePath = location.hash;

    if (routePath === '') {
        newsFeed();

    } else if (routePath.indexOf('#/page/') >= 0) {
        store.currentPage = Number(routePath.substr(7));
        newsFeed();

    } else {
        newsDetail();
    }
}

function updateView(html:string): void{
    if (container) {
        container.innerHTML = html;
    } else {
        console.log('container 없음');
    }
}

window.addEventListener('hashchange', router);

router();






