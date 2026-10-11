import type { ReactNode } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import { Show } from "@clerk/react";
import Home from "@/pages/Home";
import Pricing from "@/pages/Pricing";
import Calculator from "@/pages/Calculator";
import Faq from "@/pages/Faq";
import Login from "@/pages/Login";
import MvpDashboard from "@/pages/MvpDashboard";
import MvpCollectionQueue from "@/pages/MvpCollectionQueue";
import MvpClients from "@/pages/MvpClients";
import UnavailableFeature from "@/pages/UnavailableFeature";
import MvpReports from "@/pages/MvpReports";
import MvpSettings from "@/pages/MvpSettings";
import Information from "@/pages/Information";

function ProtectedWorkspace({ children }: { children: ReactNode }) {
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
      <Route path="/signup/*" element={<Login />} />
      <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
      <Route path="/about" element={<Information />} />
      <Route path="/security" element={<Information />} />
      <Route path="/contact" element={<Information />} />
      <Route path="/help" element={<Information />} />
      <Route path="/gst-resources" element={<Information />} />
      <Route path="/api-docs" element={<Information />} />
      <Route path="/terms" element={<Information />} />
      <Route path="/privacy" element={<Information />} />
      <Route path="/refund" element={<Information />} />
      <Route path="/app" element={<ProtectedWorkspace><MvpDashboard /></ProtectedWorkspace>} />
      <Route path="/app/invoices" element={<ProtectedWorkspace><MvpCollectionQueue /></ProtectedWorkspace>} />
      <Route path="/app/clients" element={<ProtectedWorkspace><MvpClients /></ProtectedWorkspace>} />
      <Route path="/app/recurring" element={<ProtectedWorkspace><UnavailableFeature /></ProtectedWorkspace>} />
      <Route path="/app/reports" element={<ProtectedWorkspace><MvpReports /></ProtectedWorkspace>} />
      <Route path="/app/settings" element={<ProtectedWorkspace><MvpSettings /></ProtectedWorkspace>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
