import View from '../core/view';
import { NewsDetailApi } from '../core/api';
import { NewsDetail, NewsComment } from '../types';
import { CONTENT_URL } from '../config';

const template = `
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

export default class NewsDetailView extends View{
    
    constructor(containerId:string){
        

        super(containerId, template);
        
    }

    render():void{
        const id = location.hash.substr(7);
        const api = new NewsDetailApi(CONTENT_URL.replace('@id', id));
        const newsDetail: NewsDetail = api.getData();

        for (let i = 0; i < window.store.feeds.length; i++) {
            if (window.store.feeds[i].id === Number(id)) {
                window.store.feeds[i].read = true;
                break;
            }
        }
    
        this.setTemplateData('content', this.makeContent(newsDetail));
        this.setTemplateData('comments', this.makeComment(newsDetail.comments));
        this.setTemplateData('currentPage', String(window.store.currentPage));
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