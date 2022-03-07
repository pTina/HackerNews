import View from '../core/view';
import { NewsFeedApi } from '../core/api';
import { NewsStore, NewsFeed } from '../types';
import { NEWS_URL } from '../config';

const template =`
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

export default class NewsFeedView extends View{
    private api: NewsFeedApi;
    private lastPage: number;
    private store: NewsStore;

    constructor(containerId:string, store: NewsStore){
        super(containerId, template);
        this.store = store;
        this.api = new NewsFeedApi(NEWS_URL);
        this.lastPage = 0;
        

        // if (this.store.hasFeeds) {
        //     this.store.setFeeds(this.api.getData());
        // }

        // this.lastPage = Math.round(this.store.feedsLength / 10);
        
    }

    render = (page: string = '1'): void => {
        this.store.currentPage = Number(page);

        // 라우터가 렌더 함수를 호출할 때
        // 생성자에서 호출했던 데이터의 응답이
        // 왔을지 안왔을지 보장할 수 없음
        // 호출 순서: 생성자, api 
        // 아직 응답이 오지 않았는데 router가 render를 호출했다?
        // => 데이터가 없으므로 보여줄 게 없음
        // 그럼 api를 다시 호출해야할까?
        // 근데 아까 생성자에서 호출했던 api응답이 왔어다면?
        // 이땐 어뜨케?? => 이런 문제들이 발생하기 때문에
        // 생성자에서 api호출하는 부분을 render함수로 이동시킴
        if (this.store.hasFeeds) {
            this.api.getDataWithPromise((feeds: NewsFeed[])=>{
                this.store.setFeeds(feeds);
                // 데이터가 있으면 그려지고
                this.renderView();
                this.lastPage = Math.round(this.store.feedsLength / 10);
            })
            
        }

        // 없으면 아무 동작X
        this.renderView();
        this.lastPage = Math.round(this.store.feedsLength / 10);
    }

    renderView = () => {
        for (let i = (this.store.currentPage - 1) * 10; i < (this.store.currentPage * 10); i++) {
            const { id, title, user, points, comments_count, read} = this.store.getFeed(i);
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
        this.setTemplateData('prev__page', String(this.store.prevPage));
        this.setTemplateData('next__page', String(this.store.nextPage));
    
        this.updateView();

    }
}
