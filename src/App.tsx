import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './lib/store';
import Login from '@/pages/Login';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Products from '@/pages/Products';
import Stock from '@/pages/Stock';
import Sales from '@/pages/Sales';
import Purchases from '@/pages/Purchases';
import Training from '@/pages/Training';
import Rewards from '@/pages/Rewards';
import Winners from '@/pages/Winners';
import Documentation from '@/pages/Documentation';
import Guide from '@/pages/Guide';
import Users from '@/pages/Users';
import Companies from '@/pages/Companies';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="products" element={<Products />} />
          <Route path="stock" element={<Stock />} />
          <Route path="sales" element={<Sales />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="training" element={<Training />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="winners" element={<Winners />} />
          <Route path="documentation" element={<Documentation />} />
          <Route path="guide" element={<Guide />} />
          <Route path="users" element={<Users />} />
          <Route path="companies" element={<Companies />} />
        </Route>
      </Routes>
    </Router>
  );
}