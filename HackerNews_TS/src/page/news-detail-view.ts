import View from '../core/view';
import { NewsDetailApi } from '../core/api';
import { NewsComment, NewsDetail, NewsStore } from '../types';
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
    private store: NewsStore;

    constructor(containerId:string, store: NewsStore){
        super(containerId, template);

        this.store = store;
    }

    render = (id: string): void => {
        const api = new NewsDetailApi(CONTENT_URL.replace('@id', id));
        api.getDataWithPromise((data: NewsDetail)=>{
            const { title, content, comments } = data;

            this.store.makeRead(Number(id));
        
            this.setTemplateData('currentPage', String(this.store.currentPage));
            this.setTemplateData('comments', this.makeComment(comments));
            this.setTemplateData('title', title);
            // this.setTemplateData('content', this.makeContent(content));
            
            this.updateView(); 

        })
       
    }

    // private makeContent(content:NewsComment[]): string{
    //     if(newsDedtail.content){
    //         return newsDedtail.content;
    
    //     }else{
    //         return `<a href="${newsDedtail.url}" target="_black">link click</a>`;
    //     }
    // }

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