import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import Community from './pages/Community';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import MasterClass from './pages/MasterClass';
import NewsHub from './pages/NewsHub';
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "Checkout": Checkout,
    "Community": Community,
    "Dashboard": Dashboard,
    "Home": Home,
    "Leaderboard": Leaderboard,
    "MasterClass": MasterClass,
    "NewsHub": NewsHub,
    "Pricing": Pricing,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};