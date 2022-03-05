import View from "../core/view";

export interface NewsStore{
    getAllFeed: () => NewsFeed[];
    getFeed: (position: number) => NewsFeed;
    setFeeds: (feeds: NewsFeed[]) => void;
    makeRead: (id: number) => void;
    // 아래 있는 것들은 setter, getter함수지만
    // 외부에서는 속성처럼 보여야 하기 때문에 
    // 외부로 보여지는 형식으로 작성
    hasFeeds: boolean; 
    currentPage: number;
    nextPage : number;
    prevPage: number;
    numberOfFeed: number;
    feedsLength: number;
} 

export interface Store {
    currentPage: number;
    feeds: NewsFeed[];
}

export interface News{
    readonly id: number;
    readonly time_ago: string;
    readonly title: string;
    readonly url: string;
    readonly user: string;
    readonly content: string;
}

export interface NewsFeed extends News {
    readonly comments_count: number;
    readonly points: number;
    read?: boolean; 
}

export interface NewsDetail extends News {
    readonly comments: NewsComment[];
}

export interface NewsComment extends News {
    readonly comments: NewsComment[];
}

export interface RouteInfo {
    path: string;
    page: View;
}