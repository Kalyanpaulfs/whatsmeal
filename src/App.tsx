import { Routes, Route, useNavigate } from 'react-router-dom';
import CustomerApp from './components/CustomerApp';
import AdminPage from './pages/AdminPage';
import MyOrders from './components/customer/MyOrders';
import TrackOrder from './components/customer/TrackOrder';
import ToastContainer from './components/ui/Toast';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLogin from './components/admin/AdminLogin';

function App() {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<CustomerApp />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLogin /></ProtectedRoute>} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/my-orders" element={<MyOrders onBack={handleBackToHome} />} />
        <Route path="/track-order" element={<TrackOrder onBack={handleBackToHome} />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;