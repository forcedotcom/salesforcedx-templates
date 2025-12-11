import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import { routes } from './routes';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Routes>
          {routes.map(route => (
            <Route
              key={route.path}
              path={route.path}
              element={<route.component />}
            />
          ))}
        </Routes>
      </main>
    </div>
  );
}

export default App;

