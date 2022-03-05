
import { RouteInfo } from '../types';
// ./ => 현재 디렉터리 의미, .ts 확장자 생략 가능
// default export는 바로 이름을 지어주면 된다.(쓰고 싶은 이름으로 지을 수 있음, 보통 같은 이름 사용)
import View from './view';

// export default => 기본으로 가져가겠다.
export default class Router {
    routeTable: RouteInfo[]; 
    defaultRoute:  RouteInfo | null;
    constructor(){
        
        window.addEventListener('hashchange', this.route.bind(this));

        this.routeTable = [];
        this.defaultRoute = null;
    }

    setDefaultPage(page: View): void{
        this.defaultRoute = { path:'', page};
    }

    addRoutePath(path:string, page: View): void{
        this.routeTable.push({
            path,
            page,
        })

    }

    route(){
        const routePath = location.hash;

        if(routePath === '' && this.defaultRoute){
            this.defaultRoute.page.render();
        }

        for (const routeInfo of this.routeTable){
            if(routePath.indexOf(routeInfo.path)>= 0){
                routeInfo.page.render();
                break;
            }
        }
        
    }

}