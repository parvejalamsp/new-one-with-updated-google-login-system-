import type { ReactNode } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import { Show, useUser } from "@clerk/react";
import Home from "@/pages/Home";
import Pricing from "@/pages/Pricing";
import Calculator from "@/pages/Calculator";
import Faq from "@/pages/Faq";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import CollectionQueue from "@/pages/CollectionQueue";
import Clients from "@/pages/Clients";
import Recurring from "@/pages/Recurring";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Information from "@/pages/Information";
import { setDemoOwner } from "@/lib/demo";

function ProtectedWorkspace({ children }: { children: ReactNode }) {
  const { user } = useUser();
  if (user?.id) setDemoOwner(user.id);
  return <><Show when="signed-in">{children}</Show><Show when="signed-out"><Navigate to="/login" replace /></Show></>;
}

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/calculator" element={<Calculator />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/login/*" element={<Login />} />
      <Route path="/signup/*" element={<Navigate to="/login" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
      <Route path="/about" element={<Information />} />
      <Route path="/security" element={<Information />} />
      <Route path="/contact" element={<Information />} />
      <Route path="/help" element={<Information />} />
      <Route path="/gst-resources" element={<Information />} />
      <Route path="/api-docs" element={<Information />} />
      <Route path="/terms" element={<Information />} />
      <Route path="/privacy" element={<Information />} />
      <Route path="/app" element={<ProtectedWorkspace><Dashboard /></ProtectedWorkspace>} />
      <Route path="/app/invoices" element={<ProtectedWorkspace><CollectionQueue /></ProtectedWorkspace>} />
      <Route path="/app/clients" element={<ProtectedWorkspace><Clients /></ProtectedWorkspace>} />
      <Route path="/app/recurring" element={<ProtectedWorkspace><Recurring /></ProtectedWorkspace>} />
      <Route path="/app/reports" element={<ProtectedWorkspace><Reports /></ProtectedWorkspace>} />
      <Route path="/app/settings" element={<ProtectedWorkspace><Settings /></ProtectedWorkspace>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
