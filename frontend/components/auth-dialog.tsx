"use client";
import { useState, useEffect, useRef } from "react";
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
import { useToast } from "./ui/toast";

export default function AuthDialog() {
  const [step, setStep] = useState<"login" | "signup" | "survey">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [forceSurvey, setForceSurvey] = useState(false);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false); // Thêm state để track
  const toast = useToast();

  // Refs để tránh vòng lặp
  const hasOpenedSurveyRef = useRef(false);
  const isSubmittingRef = useRef(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      name: "",
      age: "",
      weight: "",
      health_concerns: "",
      diseases: "",
    },
  });

  const {
    isAuthDialogOpen: open,
    setAuthDialogOpen: setOpen,
    login,
    isLoggedIn,
    user,
    logout,
    updateProfile,
  } = useAuthStore();

  // KIỂM TRA PROFILE CHỈ MỘT LẦN KHI MOUNT
  useEffect(() => {
    console.log(
      "🔍 Initial profile check - isLoggedIn:",
      isLoggedIn,
      "user:",
      user,
    );
    // Chỉ check một lần và không bị vòng lặp
    if (!hasCheckedProfile && isLoggedIn && user) {
      console.log(" Checking user profile...");
      setHasCheckedProfile(true);

      // Kiểm tra cả localStorage xem đã có profile chưa
      const savedProfile = localStorage.getItem("user_profile");
      console.log("💾 Saved profile from localStorage:", savedProfile);

      if (!user.profile && !savedProfile) {
        console.log("🚨 User chưa có profile -> mở khảo sát");

        if (user.email) {
          setValue("email", user.email);
        }

        setForceSurvey(true);
        setStep("survey");

        // Chỉ mở dialog nếu chưa mở trước đó
        if (!hasOpenedSurveyRef.current) {
          setOpen(true);
          hasOpenedSurveyRef.current = true;
        }
      } else if (!user.profile && savedProfile) {
        console.log(
          "User có profile trong localStorage nhưng chưa trong store",
        );
        try {
          const profileData = JSON.parse(savedProfile);
          updateProfile(profileData);
        } catch (e) {
          console.error("Error parsing saved profile:", e);
        }
      }
    }
  }, [isLoggedIn, user, setValue, updateProfile, hasCheckedProfile]);

  const onSubmit = async (formData: any) => {
    // Tránh submit nhiều lần
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsLoading(true);

    try {
      if (step === "login") {
        const emailValue = String(formData.email || "")
          .trim()
          .toLowerCase();
        const passwordValue = String(formData.password || "");

        if (!emailValue || !passwordValue) {
          throw new Error("Please enter both email and password");
        }

        const loginPayload = {
          email: emailValue,
          password: passwordValue,
        };

        const res = await api.post("/auth/login", loginPayload);

        if (res.data.status === "success") {
          await login(emailValue, passwordValue);

          if (!res.data.user.profile) {
            console.log("User chưa có profile, chuyển sang khảo sát");
            setStep("survey");
            setForceSurvey(true);
            setOpen(true);
          } else {
            console.log(" User đã có profile, đóng dialog");
            setOpen(false);
            reset();
          }
        } else {
          throw new Error(res.data.message || "Login failed");
        }
      } else if (step === "signup") {
        const emailValue = String(formData.email || "")
          .trim()
          .toLowerCase();
        const usernameValue = String(formData.username || "");
        const passwordValue = String(formData.password || "");

        if (!emailValue || !passwordValue || !usernameValue) {
          throw new Error("Please enter all required information");
        }

        const signupPayload = {
          email: emailValue,
          password: passwordValue,
          username: usernameValue,
        };

        const signupRes = await api.post("/auth/signup", signupPayload);

        if (signupRes.data.status === "success") {
          console.log("Auto login after signup");
          const loginRes = await api.post("/auth/login", {
            email: emailValue,
            password: passwordValue,
          });

          if (loginRes.data.status === "success") {
            console.log(" Auto login success");
            await login(emailValue, passwordValue);
            setStep("survey");
            setForceSurvey(true);
            setOpen(true);
          }
        } else {
          throw new Error(signupRes.data.message || "Registration failed");
        }
      } else if (step === "survey") {
        const userEmail = user?.email || formData.email;
        console.log(" Email for survey:", userEmail);

        if (!userEmail) {
          throw new Error("Email not found. Please log in again.");
        }

        const profilePayload = {
          age: Number(formData.age),
          weight: Number(formData.weight),
          health_concerns: formData.health_concerns,
          diseases: formData.diseases || "",
        };

        await updateProfile(profilePayload);

        // Reset các state
        setForceSurvey(false);
        hasOpenedSurveyRef.current = false;

        // Đóng dialog và reset form
        setOpen(false);
        reset();

        console.log(" Profile saved successfully!");

        // THAY VÌ RELOAD, chuyển về step login và đóng
        setStep("login");

        // Hiển thị thông báo thành công
        toast.success(" Survey saved successfully!");
      }
    } catch (e: any) {
      console.error("Error in onSubmit:", e);

      let errorMessage = "An error occurred, please try again!";

      if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e.message) {
        errorMessage = e.message;
      }

      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // Xử lý khi đóng dialog
  const handleDialogClose = (isOpen: boolean) => {
    if (forceSurvey && !isOpen) {
      toast.warning(
        "Please complete the health survey to continue using the app!",
      );
      return;
    }

    setOpen(isOpen);
    if (!isOpen) {
      reset();
      setStep("login");
      setForceSurvey(false);
      hasOpenedSurveyRef.current = false;
    }
  };

  // Xử lý logout
  const handleLogout = () => {
    logout();
    localStorage.removeItem("user_profile");
    setStep("login");
    setForceSurvey(false);
    setOpen(false);
    hasOpenedSurveyRef.current = false;
    setHasCheckedProfile(false);
  };

  // Nếu đã login và có profile -> hiển thị thông tin user
  if (isLoggedIn && user && user.profile) {
    return (
      <div className="flex items-center gap-4">
        <span 
          className="font-semibold text-cyan-600 truncate max-w-[120px] sm:max-w-[120px] block"
          title={`Hi, ${user?.username}`}
        >
          Hi, {user?.username}
        </span>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-red-500 hover:text-red-700"
        >
          Logout
        </Button>
      </div>
    );
  }

  // Nếu đang ở trạng thái bắt buộc khảo sát
  if (isLoggedIn && forceSurvey) {
    console.log(" User đã login nhưng chưa có profile, hiển thị nút khảo sát");
    return (
      <>
        <Button
          className="rounded-full bg-amber-600 px-8 hover:bg-amber-700"
          onClick={() => {
            setOpen(true);
          }}
        >
          Complete survey
        </Button>

        {/* DIALOG survey */}
        <Dialog open={open} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-md !rounded-[2rem]">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-lg font-bold">
                Health Survey
              </DialogTitle>
              <p className="text-sm text-amber-600 font-medium">
                Please complete the survey to continue
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>User name *</Label>
                  <Input
                    {...register("username")}
                    type="text"
                    placeholder="username"
                    className="mt-1"
                    required
                    defaultValue={user?.username || ""}
                    disabled={!!user?.username}
                  />
                  {user?.username && (
                    <p className="text-xs text-gray-500 mt-1">
                      User name was automatically filled from your account
                    </p>
                  )}
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="email@example.com"
                    className="mt-1"
                    required
                    defaultValue={user?.email || ""}
                    disabled={!!user?.email}
                  />
                  {user?.email && (
                    <p className="text-xs text-gray-500 mt-1">
                      Email was automatically filled from your account
                    </p>
                  )}
                </div>
                <div>
                  <Label>Health concerns *</Label>
                  <textarea
                    {...register("health_concerns")}
                    className="w-full border p-3 rounded-lg h-24 mt-1"
                    placeholder="E.g., Headaches, insomnia, stress, digestion..."
                    required
                  />
                </div>
                <div>
                  <Label>Medical History & Allergies (Optional)</Label>
                  <textarea
                    {...register("diseases")}
                    className="w-full border p-3 rounded-lg h-20 mt-1"
                    placeholder="E.g., Hypertension, diabetes, allergy to vitamin C..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Age *</Label>
                    <Input
                      {...register("age")}
                      type="number"
                      placeholder="Age"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label>Weight (kg) *</Label>
                    <Input
                      {...register("weight")}
                      type="number"
                      placeholder="Weight"
                      step="0.1"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-6 bg-cyan-600 rounded-xl font-bold hover:bg-cyan-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Save survey"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // User chưa login -> hiển thị button "Bắt đầu"
  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <Button
          onClick={() => {
            console.log(" Opening dialog, current step:", step);
            setOpen(true);
          }}
          asChild
          size="sm"
        >
          <span> Get Started</span>
        </Button>

        <DialogContent className="sm:max-w-md rounded">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <DialogHeader className="mb-4">
                <DialogTitle className="text-lg font-bold uppercase">{step}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {step !== "survey" ? (
                  <>
                    {step === "signup" && (
                      <div>
                        <Label>Username *</Label>
                        <Input
                          {...register("username")}
                          placeholder="Enter your username"
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
                      <Label>Password *</Label>
                      <Input
                        {...register("password")}
                        type="password"
                        placeholder="At least 6 characters"
                        className="mt-1"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
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
                      <Label>Health concerns *</Label>
                      <textarea
                        {...register("health_concerns")}
                        className="w-full border p-3 rounded-lg h-24 mt-1"
                        placeholder="E.g., Headaches, insomnia, stress, digestion..."
                        required
                      />
                    </div>
                    <div>
                      <Label>Medical History & Allergies (Optional)</Label>
                      <textarea
                        {...register("diseases")}
                        className="w-full border p-3 rounded-lg h-20 mt-1"
                        placeholder="E.g., Hypertension, diabetes, allergy to vitamin C..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Age *</Label>
                        <Input
                          {...register("age")}
                          type="number"
                          placeholder="Age"
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label>Weight (kg) *</Label>
                        <Input
                          {...register("weight")}
                          type="number"
                          placeholder="Weight"
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
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : step === "login" ? (
                    "Login"
                  ) : step === "signup" ? (
                    "Sign up"
                  ) : (
                    "Save survey"
                  )}
                </Button>
              </form>

              {step !== "survey" && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      console.log(
                        "Switching step from",
                        step,
                        "to",
                        step === "login" ? "signup" : "login",
                      );
                      reset();
                      setStep(step === "login" ? "signup" : "login");
                    }}
                    className="text-cyan-600 hover:text-cyan-800 font-medium text-sm"
                  >
                    {step === "login"
                      ? "Don't have an account? Sign up now"
                      : "Already have an account? Login"}
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
