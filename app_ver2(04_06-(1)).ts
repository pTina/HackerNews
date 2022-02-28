
// 22-02-27
// 클래스명 대문자로 시작하는 표기법 사용
// 클래스는 인스턴스를 만들고 시작해야하기 때문에
// 일반 함수 호출과는 구분된다는 측면에서 커뮤니티에서 사용하는 컨벤션 중 하나

// 렌더링: 코드 자체가 UI를 그리는 작업

// 의사코드: pseudocode
// 프로그램을 작성할 때 각 모듈이 작동하는 논리를 표현하기 위한 언어
// 문법적인 언어가 아닌 일반적인 언어
// 코드를 흉내 내어 알고리즘을 써놓은 코드

// 22-02-28
// 상위 클래스로부터 extends 받으면 반드시 상위 클래스의 생성자를 명시적으로 호출해주어야 함
// -> super()
// 같은 목적으로 코드가 합쳐짐
// -> 합쳐진 것에서 오는 이득을 취하는 형태로 코드가 변경됨

// 클래스에 속성이 추가되면 cunstructor에서 항상 초기화를 해주어야 한다.
// 구조 분해 할당(ES5 이후에 추가된 문법)

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

// const container: HTMLElement | null = document.getElementById('root');

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

// newsFeedView, NewsDetailView에서 공통 요소를 뽑는다 
// -> 공통 요소를 class를 만든다. "class View"
// => 해당 클래스를 상속받아 개별 뷰에서 사용하는 방식
// 공통 요소를 많이 뽑아내면 뽑아낼수록 이득
// 왜? 자식클래스에서 할 일이 그만큼 없어지니까

// 개별 뷰의 render() 함수에 빈 배열에 조합한 html을 넣고, updateView()를 호출하는 것
// => 공통으로 올릴 수 있음
// => 여기서는 패턴 파악이 중요
// 파악 가능한 패턴
// (1) 빈 문자열 배열
// (2) 해당 배열에 html을 계속 추가
//      데이터를 외부로 직접적으로 드러내는 방법은 좋지 않다.
//      기능만 외부에 노출시키는 방법이 가장 좋다.
// (3) 작업 종료 후 배열의 모든 문자열을 하나로 합치는 동작
// => 요 기능을 View 클래스에 추가
class View{
    template: string;
    container: HTMLElement;
    htmlList: string[];

    // container의 id 'root'를 받아야함
    // template의 내용은 자식으로부터 받야함
    constructor(containerId: string, template: string){
        // containerId가 null을 반환할 수도 있음 - 예외처리 해야함
        const containerElement = document.getElementById(containerId);

        // containerElement가 없으면? 앱 자체 동작 불가능
        // -> 종료 시킴
        // throw 명령어로 예외를 던짐
        if(!containerElement){
            throw '최상위 컨테이터너가 없어 UI를 진행하지 못합니다.';
        }

        this.template = template;
        this.container = containerElement;
        this.htmlList = [];
        
    }

    updateView(html:string): void{
        this.container.innerHTML = html;
        
    }

    // 기능만 외부에 노출시키기 위함
    addHtml(htmlString: string): void{
        this.htmlList.push(htmlString);
    }

    getHtml(): string{
        return this.htmlList.join('');
    }
}


// 1) newsFeed 함수 -> class newsFeedView로 변경
// newsFeed에 있던 모든 코드를 NesFeedView에 넣어 놓게 되면
// 이 코드를 실행시키기 위해선
// 매번 인스턴스를 계속 만들어 둬야 함
// => 기존에 만들었던 인스턴스는 쓸모가 없어지게 되는 것과 같음
// => 함수와 똑같은 형식이 되므로
//      클래스를 만드는 이유가 없어짐
// 그렇다면?
// 인스턴스를 처음 만들 때만 필요한 코드만 남겨두고
// 나머지 코드들은 해당하는 목적의 메소드로 분류하면 된다.

class newsFeedView extends View{
    api: NewsFeedApi;
    feeds: NewsFeed[];
    lastPage: number;

    // containerId를 외부에서 받는 이유는
    // 컨테이너가 여러가지 형태일 수 있어서 상위 컨네이너의 id가 root가 아닐 수 있다.
    // (상위 컨테이너의 id가 달라질 수 있다.)
    // super('root') 이렇게 해버리면 유연성이 떠어지므로
    // 외부에서 받게 함으로써 유연성을 크게 한다.
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

    //  * 같은 목적을 위해 동작하는 코드 묶는 작업 *
    // - render() 함수
    // UI를 업데이트하는 부분 분리
    // 왜? 업데이트 시점이 불분명하기 때문
    render():void {
        for (let i = (store.currentPage - 1) * 10; i < (store.currentPage * 10); i++) {
            // 구조 분해 할당(ES5 이후에 추가된 문법)
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
    
        template = template.replace('{{__news_feed__}}', this.getHtml());
        template = template.replace('{{__prev__page__}}', String(store.currentPage > 1 ? store.currentPage - 1 : 1));
        template = template.replace('{{__next__page__}}', String(store.currentPage < lastPage ? store.currentPage + 1 : lastPage));
    
        updateView(template);
    }

    // makeFeed()
    // -> newsFeedView에서만 작동하는 코드
    // -> 원래 밖에 있던 함수인데 안으로 이동
    // feeds: 클래스의 멤버로 등록했으므로 따로 인자로 받고 리턴할 필요가 없음
    // makeFeed(feeds: NewsFeed[]): NewsFeed[] {
    makeFeed(): void {
        for (let i = 0; i < this.feeds.length; i++) {
            this.feeds[i].read = false;
        }
    }


}



// function newsFeed():void {
//     let api = new NewsFeedApi(NEWS_URL);
//     let newsFeed: NewsFeed[] = store.feeds;
//     let lastPage = Math.round(newsFeed.length / 10);
//     const newsList = [];

//     if (newsFeed.length === 0) {
//         newsFeed = store.feeds = makeFeed(api.getData());
//     }

//     let template =`
//         <div class="continer m-auto p-10">
//             <h1 class="mb-10">Hacker News</h1>
//             <ul>
//                 {{__news_feed__}}
//             </ul>

//             <div class="absolute top-[35px] right-[90px]">
//                 <a href="#/page/{{__prev__page__}}" class="mr-10"><i class="fa-solid fa-angle-left text-[50px]"></i></a>
//                 <a href="#/page/{{__next__page__}}"><i class="fa-solid fa-angle-right text-[50px]"></i></a>
//             </div>
//         </div>
//     `;

//     for (let i = (store.currentPage - 1) * 10; i < (store.currentPage * 10); i++) {
//         newsList.push(`
//             <li class = "${newsFeed[i].read ? 'text-pink-700' : 'text-black'} bg-[#533CA6] p-10 mb-10 rounded-xl text-white flex justify-between">
//                 <p>
//                     <a href="#/show/${newsFeed[i].id}" class="block">
//                         ${newsFeed[i].title}
//                     </a>
//                     <span class="mr-5"><i class="fa-solid fa-user mr-2"></i>${newsFeed[i].user}</span>
//                     <span><i class="fa-solid fa-heart mr-2"></i>${newsFeed[i].points}</span>
//                 </p>
//                 <p class="flex items-center">
//                     <i class="fa-solid fa-comments mr-2"></i>
//                     <a href="#/show/${newsFeed[i].id}">
//                         ${newsFeed[i].comments_count}
//                     </a>
//                 </p>
//             </li>
//         `);
//     }

//     template = template.replace('{{__news_feed__}}', newsList.join(''));
//     template = template.replace('{{__prev__page__}}', String(store.currentPage > 1 ? store.currentPage - 1 : 1));
//     template = template.replace('{{__next__page__}}', String(store.currentPage < lastPage ? store.currentPage + 1 : lastPage));

//     updateView(template);

// }

//




// 2) newsDetail 함수 -> class NewsDetailView로 변경
// newsDetail은 id가 결정 -> api 호출 -> UI 업데이트
// 그러므로 NewsDetailView 처음 만들어졌을 때의 생성시점에
// api호출되고 UI 업데이트 코드는 없는게 맞음

// makeContent(), makeComment() : newsDetail에서만 작동하는 코드
class NewsDetailView extends View{
    
    constructor(containerId:string){
        let template = `
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
    
        template = template.replace('{{__content__}}', this.makeContent(newsDetail));
        template = template.replace('{{__comments__}}', this.makeComment(newsDetail.comments));
    
        this.updateView(template); 
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

// function newsDetail():void {
//     const id = location.hash.substr(7);
//     const api = new NewsDetailApi(CONTENT_URL.replace('@id', id));
//     const newsDetail: NewsDetail = api.getData();

//     let template = `
//         <div class="continer m-auto p-10">
//             <div class="flex justify-between">
//                 <h1 class="mb-10">Hacker News</h1>
//                 <span><a href="#/page/${store.currentPage}"><i class="fa-solid fa-xmark"></i></a></span>
//             </div>
            
//             <div class="bg-[#533CA6] rounded-xl text-white p-10">
//                 <h1>${newsDetail.title}</h1>
//                 <div>{{__content__}}</div>
//                 <div>{{__comments__}}</div>
//             </div>
//         </div>
//     `;

//     for (let i = 0; i < store.feeds.length; i++) {
//         if (store.feeds[i].id === Number(id)) {
//             store.feeds[i].read = true;
//             break;
//         }
//     }

//     template = template.replace('{{__content__}}', makeContent(newsDetail));
//     template = template.replace('{{__comments__}}', makeComment(newsDetail.comments));

//     updateView(template);
// }

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

// updateView -> 바깥에 있는 함수를 끌어들이고 있지 않음
// View 클래스 안으로 이동!
// function updateView(html:string): void{
//     if (container) {
//         container.innerHTML = html;
//     } else {
//         console.log('container 없음');
//     }
// }

window.addEventListener('hashchange', router);

router();






