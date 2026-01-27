"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "../lib/axios";
import { useAuthStore } from "./store/authStore";

export default function AuthDialog() {
  const [step, setStep] = useState<"login" | "signup" | "survey">("login");
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, watch } = useForm();
  const { login, isLoggedIn, user, logout } = useAuthStore();

  const onSubmit = async (data: any) => {
    try {
      if (step === "login") {
        const res = await api.post("/auth/login", data);
        login(res.data.user);
        if (!res.data.user.profile && !localStorage.getItem("user_profile"))
          setStep("survey");
        else setOpen(false);
      } else if (step === "signup") {
        await api.post("/auth/signup", data);
        login(data);
        setStep("survey");
      } else {
        localStorage.setItem("user_profile", JSON.stringify(data));
        setOpen(false);
        window.location.reload();
      }
    } catch (e) {
      alert("Thất bại! Nhã kiểm tra lại thông tin nhé.");
    }
  };

  if (isLoggedIn)
    return (
      <div className="flex items-center gap-4">
        <span className="font-bold text-emerald-600">Hi, {user?.name}</span>
        <Button variant="ghost" onClick={logout} className="text-red-500">
          Logout
        </Button>
      </div>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-emerald-600 px-8">Bắt đầu</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md !rounded-[2rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-black">
                {step === "login"
                  ? "Đăng nhập"
                  : step === "signup"
                    ? "Đăng ký"
                    : "Khảo sát sức khỏe 🧠"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {step !== "survey" ? (
                <>
                  {step === "signup" && (
                    <Input
                      {...register("name")}
                      placeholder="Tên của bạn"
                      required
                    />
                  )}
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="Email"
                    required
                  />
                  <Input
                    {...register("password")}
                    type="password"
                    placeholder="Mật khẩu"
                    required
                  />
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Vấn đề bạn quan tâm</Label>
                    <textarea
                      {...register("diseases")}
                      className="w-full border p-2 rounded-lg h-20"
                    />
                  </div>
                  <Input
                    {...register("age")}
                    type="number"
                    placeholder="Tuổi"
                  />
                  <Input
                    {...register("weight")}
                    type="number"
                    placeholder="Cân nặng (kg)"
                  />
                </div>
              )}
              <Button
                type="submit"
                className="w-full py-6 bg-emerald-600 rounded-xl font-bold"
              >
                {step === "login"
                  ? "Vào hệ thống"
                  : step === "signup"
                    ? "Tạo tài khoản"
                    : "Hoàn tất & Gợi ý"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              {step === "login" ? (
                <button onClick={() => setStep("signup")}>
                  Chưa có tài khoản? Đăng ký
                </button>
              ) : (
                <button onClick={() => setStep("login")}>
                  Đã có tài khoản? Đăng nhập
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
