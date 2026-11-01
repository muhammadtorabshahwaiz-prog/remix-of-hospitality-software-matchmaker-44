import { Route, Routes } from "react-router";
import { Layout } from "@/components/layout";
import Admin from "@/pages/Admin";
import Best from "@/pages/Best";
import Categories from "@/pages/Categories";
import CategoryDetail from "@/pages/CategoryDetail";
import Compare from "@/pages/Compare";
import Contact from "@/pages/Contact";
import Embed from "@/pages/Embed";
import Financing from "@/pages/Financing";
import ForVendors from "@/pages/ForVendors";
import Home from "@/pages/Home";
import InfoPage from "@/pages/InfoPage";
import Login from "@/pages/Login";
import Account from "@/pages/Account";
import SignUp from "@/pages/SignUp";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";
import Partner from "@/pages/Partner";
import Pricing from "@/pages/Pricing";
import Reviews from "@/pages/Reviews";
import Software from "@/pages/Software";
import Vendor from "@/pages/Vendor";
import WriteReview from "@/pages/WriteReview";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:slug" element={<CategoryDetail />} />
        <Route path="/software/:slug" element={<Software />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/write-review" element={<WriteReview />} />
        <Route path="/best/:slug" element={<Best />} />
        <Route path="/financing" element={<Financing />} />
        <Route path="/for-vendors" element={<ForVendors />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<InfoPage type="about" />} />
        <Route path="/methodology" element={<InfoPage type="methodology" />} />
        <Route path="/disclosure" element={<InfoPage type="disclosure" />} />
        <Route path="/privacy" element={<InfoPage type="privacy" />} />
        <Route path="/terms" element={<InfoPage type="terms" />} />
        <Route path="/accessibility" element={<InfoPage type="accessibility" />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/account" element={<Account />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/go/:slug" element={<Partner />} />
        <Route path="/vendor" element={<Vendor />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/embed/:slug" element={<Embed />} />
    </Routes>
  );
}
