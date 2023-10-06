import { Route, Routes } from 'react-router-dom';
import '../App.css';
import Layout from './Layout';
import IndexPage from '../pages/IndexPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import { UserContextProvider } from './UserContext';
import CreateVox from '../pages/CreateVox';
import CreatePage from '../pages/CreatePage';
import EditVox from '../pages/EditVox';
import WelcomePage from '../pages/WelcomePage';


function App() {
  return (
    <UserContextProvider>
    <Routes>
      <Route path={'/'} element={<Layout />} >
        <Route index element={<WelcomePage />} />
        <Route path={'/login'} element={<LoginPage />} />
        <Route path={'/register'} element={<RegisterPage/>} />
        <Route path={'/index'} element={<IndexPage />} />
        <Route path={'/create'} element={<CreateVox />} />
        <Route path={'/post/:id'} element={<CreatePage />} />
        <Route path={'/edit/:id'} element={<EditVox />} />
    </Route>
   </Routes>
   </UserContextProvider>
  );
}

export default App;
