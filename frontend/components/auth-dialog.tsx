"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "../lib/axios";
import { useAuthStore } from "../store/authStore";

export default function AuthDialog() {
  const [step, setStep] = useState<"login" | "signup" | "survey">("login");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forceSurvey, setForceSurvey] = useState(false);
  
  // Thêm watcher để debug
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      age: "",
      weight: "",
      health_concerns: "",
      diseases: ""
    }
  });

  // Debug: log form values khi thay đổi
  useEffect(() => {
    const subscription = watch((value) => {
      console.log("👀 Form values changed:", value);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const { login, isLoggedIn, user, logout, updateProfile } = useAuthStore();

  // KIỂM TRA KHI USER LOGIN
  useEffect(() => {
    console.log("🔍 AuthDialog Effect - isLoggedIn:", isLoggedIn, "user:", user);
    
    if (isLoggedIn && user && user.profile === null) {
      console.log("🚨 User đã login nhưng chưa có profile -> mở khảo sát");
      
      if (user.email) {
        setValue("email", user.email);
      }
      
      setForceSurvey(true);
      setStep("survey");
      setOpen(true);
    }
  }, [isLoggedIn, user, setValue]);

  const onSubmit = async (formData: any) => {
    console.log("📝 Raw form data from onSubmit:", formData);
    console.log("🔍 Step:", step);
    console.log("🔍 isLoggedIn:", isLoggedIn);
    console.log("🔍 Current user:", user);
    
    setIsLoading(true);
    
    try {
      if (step === "login") {
        console.log("🔐 Đang đăng nhập...");
        
        // SIMPLIFY: Luôn xử lý như string
        const emailValue = String(formData.email || "").trim().toLowerCase();
        const passwordValue = String(formData.password || "");
        
        console.log("📤 Login values - Email:", emailValue, "Password:", passwordValue);
        
        // Validate
        if (!emailValue || !passwordValue) {
          throw new Error("Vui lòng nhập đầy đủ email và mật khẩu");
        }
        
        const loginPayload = {
          email: emailValue,
          password: passwordValue
        };
        
        console.log("📤 Login payload:", loginPayload);
        
        const res = await api.post("/auth/login", loginPayload);
        
        console.log("📥 Login response:", res.data);
        
        if (res.data.status === "success") {
          login(res.data.user);
          
          if (res.data.user.profile === null) {
            console.log("🔄 User chưa có profile, chuyển sang khảo sát");
            setStep("survey");
            setForceSurvey(true);
          } else {
            console.log("✅ User đã có profile, đóng dialog");
            setOpen(false);
            reset();
          }
        } else {
          throw new Error(res.data.message || "Đăng nhập thất bại");
        }
        
      } else if (step === "signup") {
        console.log("📝 Đang đăng ký...");
        
        // SIMPLIFY signup
        const emailValue = String(formData.email || "").trim().toLowerCase();
        const nameValue = String(formData.name || "");
        const passwordValue = String(formData.password || "");
        
        console.log("📤 Signup values - Email:", emailValue, "Name:", nameValue);
        
        if (!emailValue || !passwordValue || !nameValue) {
          throw new Error("Vui lòng nhập đầy đủ thông tin");
        }
        
        const signupPayload = {
          email: emailValue,
          password: passwordValue,
          name: nameValue
        };
        
        console.log("📤 Signup payload:", signupPayload);
        
        const signupRes = await api.post("/auth/signup", signupPayload);
        
        console.log("📥 Signup response:", signupRes.data);
        
        if (signupRes.data.status === "success") {
          // Tự động đăng nhập
          console.log("🔄 Auto login after signup");
          const loginRes = await api.post("/auth/login", {
            email: emailValue,
            password: passwordValue
          });
          
          if (loginRes.data.status === "success") {
            console.log("✅ Auto login success");
            login(loginRes.data.user);
            setStep("survey");
            setForceSurvey(true);
          }
        } else {
          throw new Error(signupRes.data.message || "Đăng ký thất bại");
        }
        
      } else if (step === "survey") {
        console.log("📋 Đang lưu khảo sát...");
        
        // Lấy email từ user đã login
        const userEmail = user?.email;
        
        if (!userEmail) {
          throw new Error("Không tìm thấy email, vui lòng đăng nhập lại");
        }
        
        const profilePayload = {
          email: userEmail,
          age: formData.age,
          weight: formData.weight,
          health_concerns: formData.health_concerns,
          diseases: formData.diseases || formData.health_concerns
        };
        
        console.log("📤 Profile payload:", profilePayload);
        
        const profileRes = await api.post("/user/profile", profilePayload);
        
        console.log("📥 Profile response:", profileRes.data);
        
        if (profileRes.data.status === "success") {
          updateProfile(profileRes.data.profile);
          localStorage.setItem("user_profile", JSON.stringify(profileRes.data.profile));
          setForceSurvey(false);
          setOpen(false);
          reset();
          setTimeout(() => window.location.reload(), 100);
        } else {
          throw new Error(profileRes.data.message || "Lưu profile thất bại");
        }
      }
      
    } catch (e: any) {
      console.error("❌ Error in onSubmit:", e);
      console.error("Error response:", e.response?.data);
      console.error("Error message:", e.message);
      
      let errorMessage = "Có lỗi xảy ra, vui lòng thử lại!";
      
      if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý khi đóng dialog
  const handleDialogClose = (isOpen: boolean) => {
    console.log("🔒 Dialog close attempt, forceSurvey:", forceSurvey, "isOpen:", isOpen);
    
    if (forceSurvey && !isOpen) {
      alert("Vui lòng hoàn thành khảo sát sức khỏe để tiếp tục sử dụng ứng dụng!");
      return;
    }
    
    setOpen(isOpen);
    if (!isOpen) {
      reset();
      setStep("login");
      setForceSurvey(false);
    }
  };

  // Xử lý logout
  const handleLogout = () => {
    console.log("👋 Logout");
    logout();
    localStorage.removeItem("user_profile");
    setStep("login");
    setForceSurvey(false);
    setOpen(false);
  };

  // Nếu đã login và có profile
  if (isLoggedIn && user && user.profile !== null) {
    console.log("✅ User đã login và có profile, hiển thị thông tin");
    return (
      <div className="flex items-center gap-4">
        <span className="font-bold text-cyan-600">Hi, {user?.name}</span>
        <Button 
          variant="ghost" 
          onClick={handleLogout} 
          className="text-red-500 hover:text-red-700"
        >
          Đăng xuất
        </Button>
      </div>
    );
  }

  // Nếu đang ở trạng thái bắt buộc khảo sát
  if (isLoggedIn && forceSurvey) {
    console.log("📋 User đã login nhưng chưa có profile, hiển thị nút khảo sát");
    return (
      <Button 
        className="rounded-full bg-amber-600 px-8 hover:bg-amber-700"
        onClick={() => setOpen(true)}
      >
        Hoàn thành khảo sát
      </Button>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <Button 
          className="rounded-full bg-cyan-600 px-8 hover:bg-cyan-700"
          onClick={() => {
            console.log("🎯 Opening dialog, current step:", step);
            setOpen(true);
          }}
        >
          {isLoggedIn ? "Khảo sát sức khỏe" : "Bắt đầu"}
        </Button>
        
        <DialogContent className="sm:max-w-md !rounded-[2rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <DialogHeader className="mb-4">
                <DialogTitle className="text-lg font-bold">
                  {step === "login"
                    ? "Đăng nhập"
                    : step === "signup"
                      ? "Đăng ký"
                      : "Khảo sát sức khỏe 🧠"}
                </DialogTitle>
                {step === "survey" && forceSurvey && (
                  <p className="text-sm text-amber-600 font-medium">
                    ⚠️ Vui lòng hoàn thành khảo sát để tiếp tục
                  </p>
                )}
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {step !== "survey" ? (
                  <>
                    {step === "signup" && (
                      <div>
                        <Label>Họ tên *</Label>
                        <Input
                          {...register("name")}
                          placeholder="Nhập họ tên của bạn"
                          className="mt-1"
                          required
                        />
                      </div>
                    )}
                    <div>
                      <Label>Email *</Label>
                      <Input
                        {...register("email")}
                        type="email"
                        placeholder="email@example.com"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label>Mật khẩu *</Label>
                      <Input
                        {...register("password")}
                        type="password"
                        placeholder="Ít nhất 6 ký tự"
                        className="mt-1"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {/* KHÔNG hiển thị email field trong survey nếu đã login */}
                    {!isLoggedIn && (
                      <div>
                        <Label>Email *</Label>
                        <Input
                          {...register("email")}
                          type="email"
                          placeholder="email@example.com"
                          className="mt-1"
                          required
                        />
                      </div>
                    )}
                    <div>
                      <Label>Vấn đề sức khỏe bạn quan tâm *</Label>
                      <textarea
                        {...register("health_concerns")}
                        className="w-full border p-3 rounded-lg h-24 mt-1"
                        placeholder="Ví dụ: Đau đầu, mất ngủ, căng thẳng, dạ dày..."
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tuổi *</Label>
                        <Input
                          {...register("age")}
                          type="number"
                          placeholder="Tuổi"
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label>Cân nặng (kg) *</Label>
                        <Input
                          {...register("weight")}
                          type="number"
                          placeholder="Cân nặng"
                          step="0.1"
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <Button
                  type="submit"
                  className="w-full py-6 bg-cyan-600 rounded-xl font-bold hover:bg-cyan-700 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Đang xử lý...
                    </span>
                  ) : step === "login"
                    ? "Đăng nhập"
                    : step === "signup"
                      ? "Đăng ký"
                      : "Lưu khảo sát"}
                </Button>
              </form>
              
              {step !== "survey" && !forceSurvey && (
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => {
                      console.log("🔄 Switching step from", step, "to", step === "login" ? "signup" : "login");
                      reset();
                      setStep(step === "login" ? "signup" : "login");
                    }}
                    className="text-cyan-600 hover:text-cyan-800 font-medium text-sm"
                  >
                    {step === "login" 
                      ? "📝 Chưa có tài khoản? Đăng ký ngay" 
                      : "🔐 Đã có tài khoản? Đăng nhập"}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}