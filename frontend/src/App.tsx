import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Pricing from "@/pages/Pricing";
import Calculator from "@/pages/Calculator";
import Faq from "@/pages/Faq";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import Dashboard from "@/pages/Dashboard";
import Invoices from "@/pages/Invoices";
import Clients from "@/pages/Clients";
import Recurring from "@/pages/Recurring";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/calculator" element={<Calculator />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/app" element={<Dashboard />} />
      <Route path="/app/invoices" element={<Invoices />} />
      <Route path="/app/clients" element={<Clients />} />
      <Route path="/app/recurring" element={<Recurring />} />
      <Route path="/app/reports" element={<Reports />} />
      <Route path="/app/settings" element={<Settings />} />
    </Routes>
  );
}
