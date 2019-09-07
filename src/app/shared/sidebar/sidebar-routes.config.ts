import { RouteInfo } from './sidebar.metadata';
import { environment } from '../../../environments/environment';

//Sidebar menu Routes and data
export const ROUTES: RouteInfo[] = [
    { path: '/real-ws/pmodel', title: 'Process Model', icon: 'icon-shuffle', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [], isEnabled: true},
    { path: '/real-ws/variants', title: 'Cases', icon: 'ft-airplay', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [], isEnabled: true},
    { path: '/real-ws/dotted', title: 'Dotted Chart', icon: 'ft-underline', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [], isEnabled: true},
    { path: '/real-ws/statistics', title: 'Aggregated stats', icon: 'ft-trending-up', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [], isEnabled: environment.overallEnableStatistics},
    { path: '/real-ws/sna', title: 'SNA', icon: 'ft-share-2', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [], isEnabled: environment.overallEnableSNA},
    { path: '/real-ws/transient', title: 'Transient Analysis', icon: 'ft-anchor', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [], isEnabled: environment.overallEnableTransient},
    { path: '/real-ws/trace-cluster', title: 'Trace Clustering', icon: 'icon-layers', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [], isEnabled: true},
];
