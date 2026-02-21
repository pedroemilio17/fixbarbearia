import { useNavigate } from "react-router-dom";
import CartDrawer from "../components/CartDrawer";

export default function Booking() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <CartDrawer isOpen={true} onClose={() => navigate("/")} />
    </div>
  );
}
