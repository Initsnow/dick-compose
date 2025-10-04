import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ApiKeyProvider } from './contexts/ApiKeyContext';
import SetupPage from './pages/SetupPage';
import HomePage from './pages/HomePage';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <ApiKeyProvider>
        <Router>
          <Routes>
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </Router>
      </ApiKeyProvider>
    </ThemeProvider>
  );
}

export default App;