import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import InputField from "../../../components/common/InputField";
import { PrimaryButton } from "../../../components/common/Button";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const [userData, setUserData] = useState({ userEmail: "", userPassword: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(userData);
      const role = res?._resolvedUser?.role || res?.data?.role;
      toast.success("Login successful");
      if (role === 'admin' || role === 'seller') navigate("/seller");
      else navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div className="bg-white w-full max-w-md shadow-sm border border-green-border p-8 rounded-xl">
        <h2 className="text-2xl font-bold font-serif text-center mb-1">Welcome Back</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Login to continue with DigitalMandu</p>
        {error && <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 p-2 rounded">{error}</p>}
        <form onSubmit={handleOnSubmit} className="space-y-4">
          <InputField label="Email" name="userEmail" type="text" value={userData.userEmail} onChange={handleChange} placeholder="you@example.com" />
          <InputField label="Password" name="userPassword" type="password" value={userData.userPassword} onChange={handleChange} placeholder="••••••••" />
          <PrimaryButton label={loading ? "Loading..." : "Login"} type="submit" loading={loading} className="w-full justify-center" />
        </form>
        <div className="flex justify-between text-sm mt-4">
          <Link to="/forgot" className="text-primary hover:underline">Forgot password?</Link>
          <Link to="/register" className="text-primary font-medium hover:underline">Create account</Link>
        </div>
      </div>
    </div>
  );
};
export default Login;
