import View from '../core/view';
import { NewsFeedApi } from '../core/api';
import { NewsStore } from '../types';
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
    
        if (this.store.hasFeeds) {
            this.store.setFeeds(this.api.getData());
        }

        this.lastPage = Math.round(this.store.feedsLength / 10);
        
    }

    render = (page: string = '1'): void => {
        this.store.currentPage = Number(page);
        
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
