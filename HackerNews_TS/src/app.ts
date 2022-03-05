import Router from './core/router';
import { NewsFeedView, NewsDetailView } from './page'; 
import Store from './store';

const store = new Store();

const router: Router = new Router(); 
const newFeedView = new NewsFeedView('root', store);
const newsDetailView = new NewsDetailView('root', store);

router.setDefaultPage(newFeedView);
router.addRoutePath('/page/', newFeedView);
router.addRoutePath('/show/', newsDetailView);

router.route();






