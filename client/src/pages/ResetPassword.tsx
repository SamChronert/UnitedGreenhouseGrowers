import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Sprout, Loader2, ArrowLeft, Mail, Lock, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetPasswordSchema = z.object({
  password: z.string().min(12, "Password must be at least 12 characters long"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<"request" | "sent" | "reset">("request");
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Check for reset token in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setResetToken(token);
      setStep("reset");
    }
  }, []);

  const forgotPasswordForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetPasswordForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordForm) => apiRequest("POST", "/api/auth/forgot-password", data),
    onSuccess: () => {
      setStep("sent");
      toast({
        title: "Reset link sent",
        description: "If an account with that email exists, a password reset link has been sent.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset link. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordForm) => 
      apiRequest("POST", "/api/auth/reset-password", { 
        token: resetToken, 
        password: data.password 
      }),
    onSuccess: () => {
      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now log in with your new password.",
      });
      setLocation("/login");
    },
    onError: (error: Error) => {
      toast({
        title: "Reset failed",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onForgotPasswordSubmit = (data: ForgotPasswordForm) => {
    forgotPasswordMutation.mutate(data);
  };

  const onResetPasswordSubmit = (data: ResetPasswordForm) => {
    resetPasswordMutation.mutate(data);
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Sprout className="h-12 w-12 text-ugga-primary mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {step === "request" && "Reset Your Password"}
            {step === "sent" && "Check Your Email"}
            {step === "reset" && "Set New Password"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            {step === "request" && "Enter your email to receive a password reset link"}
            {step === "sent" && "We've sent you a reset link if your email is registered"}
            {step === "reset" && "Enter your new password below"}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              {step === "request" && (
                <>
                  <Mail className="h-5 w-5 text-ugga-primary" />
                  Request Reset Link
                </>
              )}
              {step === "sent" && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Email Sent
                </>
              )}
              {step === "reset" && (
                <>
                  <Lock className="h-5 w-5 text-ugga-primary" />
                  Set New Password
                </>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {step === "request" && (
              <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    {...forgotPasswordForm.register("email")}
                    className="text-base sm:text-sm" // Prevent zoom on iOS
                  />
                  {forgotPasswordForm.formState.errors.email && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {forgotPasswordForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 text-base"
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            )}

            {step === "sent" && (
              <div className="text-center space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    Reset instructions have been sent to your email address.
                    Please check your inbox and click the link to reset your password.
                  </p>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Didn't receive the email? Check your spam folder or try again.</p>
                </div>

                <Button 
                  variant="outline" 
                  onClick={() => setStep("request")}
                  className="w-full"
                >
                  Send Another Link
                </Button>
              </div>
            )}

            {step === "reset" && (
              <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your new password"
                    {...resetPasswordForm.register("password")}
                    className="text-base sm:text-sm" // Prevent zoom on iOS
                  />
                  {resetPasswordForm.formState.errors.password && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {resetPasswordForm.formState.errors.password.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Password must be at least 12 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    {...resetPasswordForm.register("confirmPassword")}
                    className="text-base sm:text-sm" // Prevent zoom on iOS
                  />
                  {resetPasswordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {resetPasswordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 text-base"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            )}

            {/* Back to Login Link */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link 
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-ugga-primary hover:text-ugga-secondary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need help? Contact{" "}
            <Link href="/contact" className="text-ugga-primary hover:text-ugga-secondary">
              support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}