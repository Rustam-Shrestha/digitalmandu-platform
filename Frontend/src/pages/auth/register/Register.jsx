import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import InputField from "../../../components/common/InputField";
import { PrimaryButton } from "../../../components/common/Button";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuthStore();
  const [userData, setUserData] = useState({ userName: "", userPhone: "", userEmail: "", userPassword: "", role: "customer" });
  const handleChange = (e) => setUserData({ ...userData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(userData);
      toast.success("Registered successfully — please verify email OTP");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };
  return (
    <div className="flex items-center justify-center py-8">
      <div className="bg-white w-full max-w-md shadow-sm border border-green-border p-8 rounded-xl">
        <h2 className="text-2xl font-bold font-serif text-center mb-1">Create Account</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Join DigitalMandu as buyer or seller</p>
        {error && <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 p-2 rounded">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Username" name="userName" value={userData.userName} onChange={handleChange} placeholder="Username" />
          <InputField label="Email" name="userEmail" value={userData.userEmail} onChange={handleChange} placeholder="you@example.com" />
          <InputField label="Phone" name="userPhone" value={userData.userPhone} onChange={handleChange} placeholder="98XXXXXXXX" />
          <InputField label="Password" name="userPassword" type="password" value={userData.userPassword} onChange={handleChange} placeholder="••••••••" />
          <div>
            <label className="text-sm font-normal mb-1 block text-primary">I want to</label>
            <select name="role" value={userData.role} onChange={handleChange} className="w-full h-[42px] text-sm bg-[#F6F6F6] text-gray-600 px-3 rounded border border-transparent focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="customer">Buy food (Customer)</option>
              <option value="seller">Sell food (Seller)</option>
            </select>
          </div>
          <PrimaryButton label={loading ? "Loading..." : "Register"} type="submit" loading={loading} className="w-full justify-center" />
        </form>
        <p className="text-center text-sm mt-4">Already have account? <Link to="/login" className="text-green-600 font-medium">Login</Link></p>
      </div>
    </div>
  );
};
export default Register;
