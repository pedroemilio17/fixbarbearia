import { useNavigate } from "react-router-dom";
import CartDrawer from "../components/CartDrawer";

export default function Booking() {
  const navigate = useNavigate();
  return <CartDrawer isOpen={true} onClose={() => navigate("/")} />;
}
