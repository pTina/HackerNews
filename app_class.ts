
// 인터페이스
// 이퀄을 사용하지 않는다.

// union 타입 => 인터페이스에서 지원하지 못함
// 타입을 결합시켜 사용하는 것을 지원하지 않는다. intersection, &
// 어떤 유형의 설명을 보다 더 명확하고 명시적으로 할 수 있다는 느낌을 갖게 해 준다.
// (글로써 표현하는 듯한 느낌)
// 코드를 읽는다는 관점에서 타입을 표현함에 있어서 확장되는 형식의 타입은 인터페이스를 선호함

// 그렇다면 어떻게 결합시키냐? -> extends

interface Store {
    currentPage: number;
    feeds: NewsFeed[];
}

// 지시어 readonly => 바꿀 수 없다는 값이라는 것을 명시함
interface News{
    readonly id: number;
    readonly time_ago: string;
    readonly title: string;
    readonly url: string;
    readonly user: string;
    readonly content: string;
}

// New라는 인터페이스를 기반으로 NewsFeed를 만든다.
// 즉, News를 확장해서 새로운 타입을 만든다.
interface NewsFeed extends News {
    readonly comments_count: number;
    readonly points: number;
    read?: boolean; 
}

interface NewsDetail extends News {
    readonly coments: NewsComment[];
}

interface NewsComment extends News {
    readonly comments: NewsComment[];
}


const container: HTMLElement | null = document.getElementById('root');

const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';

const store: Store = {
    currentPage: 1,
    feeds: [],
}

// 클래스는 최초의 초기화되는 과정이 필요 => 생성자가 있어야 함
class Api{
    // 외부로 부터 받은 url을 내부에 저장도 해야함
    url: string;
    // ajax => 모든 API 호출에 필요함
    ajax: XMLHttpRequest;

    // constructor => 생성자
    // 초기화 과정을 처리하는 함수
    // 외부로 부터 url를 받음
    // 어떠한 url을 가진 API라도 호출을 할 수 있어야 함
    constructor(url: string){
        // 여기서 초기화 작업

        // this
        // 클래스 내부 요소로 접근하는
        // 인스턴스 객체에 접근하는 지시어
        this.url = url;
        this.ajax = new XMLHttpRequest();
    }

    // Api 클래스와 Api 클래스를 확장한 하위 클래스에서 사용할 용도의 메소드
    // 외부에서 호출되면 안됨, 호출할 필요 없음
    // getRequest()
    // protected -> 클래스의 속성과 메소드 등을 외부로 노출시키지 않는 지시어
    // 클래스 밖에서 인스턴스 객체로 등장하지 않게됨
    protected getRequest<AjaxResponse>(){
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
    // 외부에서 api 호출을 하기위한 메소드
    // getData()
    getData(): NewsDetail{
        return this.getRequest<NewsDetail>();
    }
}

// function getData<AjaxResponse>(url: string): AjaxResponse{
//     const ajax: XMLHttpRequest = new XMLHttpRequest();
//     ajax.open('GET', url, false);
//     ajax.send();

//     return JSON.parse(ajax.response);
// }

function makeFeed(feeds: NewsFeed[]): NewsFeed[] {
    for (let i = 0; i < feeds.length; i++) {
        feeds[i].read = false;
    }

    return feeds;
}

function newsFeed():void {
    // 가독성 향상됨
    const api = new NewsFeedApi(NEWS_URL);

    let newsFeed: NewsFeed[] = store.feeds;
    let lastPage = Math.round(newsFeed.length / 10);
    const newsList = [];

    if (newsFeed.length === 0) {
        newsFeed = store.feeds = makeFeed(api.getData());
    }

    console.log(newsFeed);

    let template =
        `
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
    `

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

function newsDetail():void {
    const id = location.hash.substr(7);
    const api = new NewsDetailApi(CONTENT_URL.replace('@id', id));
    const newsContent = api.getData();

    updateView(`<h1>${newsContent.title}</h1><div><a href="#/page/${store.currentPage}">목록으로</a></div>`);

    for (let i = 0; i < store.feeds.length; i++) {
        if (store.feeds[i].id === Number(id)) {
            store.feeds[i].read = true;
            break;
        }
    }

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






