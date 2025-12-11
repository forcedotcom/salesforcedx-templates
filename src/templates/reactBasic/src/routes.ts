import type { ComponentType } from 'react';
import Home from './pages/Home';
import About from './pages/About';
import NotFound from './pages/NotFound';

export interface RouteConfig {
  path: string;
  label: string;
  component: ComponentType;
  showInNav?: boolean;
}

export const routes: RouteConfig[] = [
  { path: '/', label: 'Home', component: Home, showInNav: true },
  { path: '/about', label: 'About', component: About, showInNav: true },
  { path: '*', label: 'Not Found', component: NotFound, showInNav: false },
];

export const navItems = routes.filter(route => route.showInNav);

