

// 변수명
// -> 보통 카멜 케이스 표기법(첫 글자 소문자 중간 글자는 대문자로 시작하는 표기법)

// 타이핑 하는 식별자(타입 or 인터페이스)
// -> 대문자로 시작하는 표기법을 많이 사용한다.
type Store = {
    currentPage: number;
    // [](빈배열) ->  어떤 게 들어갈지 제약하지 못함(모든 유형의 데이터가 들어갈 수 있음)
    // NewsFeed[] -> newsFeed 유형의 데이터가 들어가는 배열임을 의미함
    feeds: NewsFeed[];
}

// 중복 속성을 하나의 타입으로 만들기
type News ={
    id: number;
    time_ago: string;
    title: string;
    url: string;
    user: string;
    content: string;
}

// 공통 요소인 News를 어떻게 넣냐?
// 인터섹션 기능 사용
//      타입 알리아스의 기능
//      News & {} -> News 타입과 {}안에 있는 속성이 합쳐짐
type NewsFeed = News & {
    comments_count: number;
    points: number;
    read?: boolean; // 선택속성(있을수도 없을수도 있음, 선택적인 데이터)
}

type NewsDetail = News & {
    coments: NewsComment[];
}

type NewsComment = News & {
    comments: NewsComment[];
}

// container가 null일 경우도 있으므로
// container에 접근할 때 null이 아닌 경우에 접근할 수 있도록 작성해야함
// if(null) -> false 반환
const container: HTMLElement | null = document.getElementById('root');

const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';

// store에 순수하게 객체 형태의 데이터가 들어 있는 상태
// -> TS로 바꾸면? 객체 형태의 데이터의 유형 형식을 정의하게됨
const store: Store = {
    currentPage: 1,
    feeds: [],
}

// getData는 리턴 값으로 2가지 종료를 갖고 있음
// function getData(url: string): NewsFeed[] | NewsDetail {}
// 어떤 데이터가 올지 모호함
// => 제네릭으로 변경
// 어떤 유형(T)가 들어오면 함수에서 어디서 저 T가 계속 통용된다고 정의할 수 있음
// 리턴값을 T로 지정
// 보통 T, 약어로 쓰기도 하고 명시적으로 어떤 유형으로 길게 표현하기도 함
// function getData<T>(url: string): T{
// 호출하는 쪽에서 유형을 명시해 주면
// 그 유형을 받아서 그대로 getData에서 반환유형으로 사용하겠다.
// T의 이름을 AjaxResponse로 변경 (ajax의 응답 값)
function getData<AjaxResponse>(url: string): AjaxResponse{
    const ajax: XMLHttpRequest = new XMLHttpRequest();
    ajax.open('GET', url, false);
    ajax.send();

    return JSON.parse(ajax.response);
}

function makeFeed(feeds: NewsFeed[]): NewsFeed[] {
    for (let i = 0; i < feeds.length; i++) {
        feeds[i].read = false;
    }

    return feeds;
}

function newsFeed():void {
    let newsFeed: NewsFeed[] = store.feeds;
    let lastPage = Math.round(newsFeed.length / 10);
    const newsList = [];

    if (newsFeed.length === 0) {
        // 호출할 때 기술된 타입이 그대로 T로 넘어오고
        // 리턴 값을 T로 쓰게됨
        newsFeed = store.feeds = makeFeed(getData<NewsFeed[]>(NEWS_URL));
        // newsFeed = store.feeds = makeFeed(getData(NEWS_URL));
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
    const newsContent = getData<NewsDetail>(CONTENT_URL.replace('@id', id));

    updateView(`<h1>${newsContent.title}</h1><div><a href="#/page/${store.currentPage}">목록으로</a></div>`);

    // i에 타입을 타이핑하지 않았는데도 사용할 수 있는 이유?
    // [타입 추론]
    // 타입스크립트가 코드 상의 상황을 보고 인지함
    // 타입을 유추할 수 있는 상황이라면 내부적으로 타이핑 해줌
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

// 함수의 리턴값이 없을 때 => void
function updateView(html:string): void{
    // 당연히 데이터가 있다고 생각하고 속성을 접근했을 경우
    // null을 체크하는 코드 -> 타입 가드 (타입을 방어한다.)
    // => 앱이 죽거나 아무런 작동 하지 않는 상황을 최소화할 수 있는 방법
    if (container) {
        container.innerHTML = html;
    } else {
        console.log('container 없음');
    }
}

window.addEventListener('hashchange', router);

router();






