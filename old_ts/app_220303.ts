import Router from './core/router';
import { NewsFeedView, NewsDetailView } from './page'; 
import { Store } from './types'

// 다른 파일에서 Store를 접근하는데
// 분리된 파일에서 여기에만 있는 Store를 접근할 수 없음
// => 어디에서든 접근할 수 있게 알려주어야 함
// 방법(1) 그렇게 좋은 방법은 아니지만 가장 손쉬운 방법
// 브라우저 안에 어디에서나 접근 가능한 윈도우라고 하는 전역 객체가 있는데
// 이 전역 객체에 Store를 넣어두는 것
// => 다른 코드에서는 sotre를 윈도우 안에서 찾아서 접근하는 식으로 하게 한다.
const store: Store = {
    currentPage: 1,
    feeds: [],
}

// (1) 윈도우에 추가할 속성의 타입 정의
declare global{
    interface Window{
        // 추가할 속성 추가
        store: Store;
    }
}

// (2) 윈도우 전역 객체에 store 속성 추가
// window는 어디에서든 접근 가능한 전역 객체
window.store = store;

const router: Router = new Router(); 
const newFeedView = new NewsFeedView('root');
const newsDetailView = new NewsDetailView('root');

router.setDefaultPage(newFeedView);
router.addRoutePath('/page/', newFeedView);
router.addRoutePath('/show/', newsDetailView);

router.route();






