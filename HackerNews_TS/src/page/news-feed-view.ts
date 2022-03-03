import View from '../core/view';
import { NewsFeedApi } from '../core/api';
import { NewsFeed } from '../types';
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
    private feeds: NewsFeed[];
    lastPage: number;

    constructor(containerId:string){
        super(containerId, template);

        this.api = new NewsFeedApi(NEWS_URL);
        this.feeds = window.store.feeds;
    
        if (this.feeds.length === 0) {
            this.feeds = window.store.feeds = this.api.getData();
            this.makeFeed();
        }

        this.lastPage = Math.round(this.feeds.length / 10);
        
    }

    render():void {
        window.store.currentPage = Number(location.hash.substr(7) || 1);

        for (let i = (window.store.currentPage - 1) * 10; i < (window.store.currentPage * 10); i++) {
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
        this.setTemplateData('prev__page', String(window.store.currentPage > 1 ? window.store.currentPage - 1 : 1));
        this.setTemplateData('next__page', String(window.store.currentPage < this.lastPage ? window.store.currentPage + 1 : this.lastPage));
    
        this.updateView();
    }

    private makeFeed(): void {
        for (let i = 0; i < this.feeds.length; i++) {
            this.feeds[i].read = false;
        }
    }


}
