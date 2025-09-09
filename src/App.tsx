import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/pages/HomePage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
// import CoursesPage from './components/pages/CoursesPage';
// import AboutPage from './components/pages/AboutPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* <Route path="/courses" element={<CoursesPage />} />
        <Route path="/about" element={<AboutPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
