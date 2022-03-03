
// 해커뉴스 api 명세 https://github.com/tastejs/hacker-news-pwas/blob/master/docs/api.md

const container = document.getElementById('root');
const content = document.createElement('div');

const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';

// 공유되는 자원
const store ={
    currentPage: 1,
    feeds: [],
}

function getData(url) {
    const ajax = new XMLHttpRequest();
    ajax.open('GET', url, false);
    ajax.send();

    return JSON.parse(ajax.response);
}

function makeFeed(feeds){
    for(let i =0; i<feeds.length; i++){
        // read 속성 추가
        feeds[i].read = false;
    }

    return feeds;
}

// 목록
function newsFeed() {
    let newsFeed = store.feeds;
    let lastPage = Math.round(newsFeed.length/10);
    const newsList = [];

    if(newsFeed.length === 0 ){
        newsFeed = store.feeds = makeFeed(getData(NEWS_URL));
    }

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
    `;

    for (let i = (store.currentPage-1)*10; i < (store.currentPage*10); i++) {
        newsList.push(`
            <li class = "${newsFeed[i].read ? 'text-pink-700' : 'text-white'} bg-[#533CA6] p-10 mb-10 rounded-xl text-white flex justify-between">
                <p>
                    <a href="#/show/${newsFeed[i].id}" class="block">
                        ${newsFeed[i].title}
                    </a>
                    <span class="mr-5"><i class="fa-solid fa-user mr-2"></i>${newsFeed[i].user}</span>
                    <span class="mr-7"><i class="fa-solid fa-heart"></i>${newsFeed[i].points}</span>
                    <span class="text-[12px]"><i class="fa-solid fa-clock-rotate-left mr-2"></i>${newsFeed[i].time_ago}</span>
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
    template = template.replace('{{__prev__page__}}', store.currentPage >1 ? store.currentPage-1 : 1);
    template = template.replace('{{__next__page__}}', store.currentPage < lastPage ? store.currentPage+1 : lastPage );

    container.innerHTML = template;
}

// 세부내용
function newsDetail(){
    const id = location.hash.substr(7);
    const newsContent = getData(CONTENT_URL.replace('@id', id));

    for(let i =0; i<store.feeds.length; i++){
        if(store.feeds[i].id === Number(id)){
            store.feeds[i].read = true;
            break;
        }
    }

    let template = `
        <div class="continer m-auto p-10">
            <div class="flex justify-between">
                <h1 class="mb-10">Hacker News</h1>
                <span><a href="#/page/${store.currentPage}"><i class="fa-solid fa-xmark"></i></a></span>
            </div>
            
            <div class="bg-[#533CA6] rounded-xl text-white p-10">
                <h1>${newsContent.title}</h1>
                <div>{{__content__}}</div>
                <div>{{__comments__}}</div>
            </div>
        </div>
    `;

    function makeContent(content){
        if(content){
            return content;

        }else{
            return `<a href="${content.url}" target="_black">link click</a>`;
        }
    }

    template = template.replace('{{__content__}}', makeContent(newsContent.content));

    function makeComments(comments, called = 0){
        let commentsList = [];
        for(let i=0; i<comments.length; i++){
            commentsList.push(`
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
                commentsList.push(makeComments(comments[i].comments, called+1));
            }
        }

        return commentsList.join('');
    }

    template = template.replace('{{__comments__}}', makeComments(newsContent.comments));


    container.innerHTML = template;

}

function router(){
    const routePath = location.hash;

    if(routePath === ''){
        newsFeed();

    }else if(routePath.indexOf('#/page/') >= 0){
        store.currentPage = Number(routePath.substr(7));
        newsFeed();

    }else{
        newsDetail();
    }
}

window.addEventListener('hashchange', router);

// newsFeed();
router();






