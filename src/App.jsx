import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import Login from './pages/Login'
import CategoryLayoutSwitcher from "./CategoryLayoutSwitcher";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/login' element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path='/*' element={<CategoryLayoutSwitcher />} />
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;