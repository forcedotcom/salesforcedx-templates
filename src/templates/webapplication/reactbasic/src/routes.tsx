import type { RouteObject } from "react-router";
import AppLayout from "./appLayout";
import Home from "@/pages/Home";
import About from "./pages/About";

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
        handle: { showInNavigation: true, label: 'Home' }
      },
      {
        path: 'about',
        element: <About />,
        handle: { showInNavigation: true, label: 'About' }
      }
    ]
  }
]