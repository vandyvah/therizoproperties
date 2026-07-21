import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function DashboardAuth() {
  const { signIn, signUp, user, loading, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const signInEmailValid = useMemo(() => validateEmail(signInEmail), [signInEmail]);
  const signUpEmailValid = useMemo(() => validateEmail(signUpEmail), [signUpEmail]);

  // Check if this is a password reset callback
  useEffect(() => {
    const isReset = searchParams.get("reset") === "true";
    if (isReset) {
      setShowResetForm(true);
    }
  }, [searchParams]);

  // Redirect if already logged in - must be in useEffect to avoid render loops
  useEffect(() => {
    if (user && !loading && !showResetForm) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate, showResetForm]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Store remember me preference
    if (rememberMe) {
      localStorage.setItem("therizo_remember_me", "true");
    } else {
      localStorage.removeItem("therizo_remember_me");
    }

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/dashboard");
    }
    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    const { error } = await signUp(email, password, fullName);

    if (error) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created",
        description: "You can now sign in with your credentials.",
      });
    }
    setIsSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const { error } = await resetPassword(email);

    if (error) {
      toast({
        title: "Error sending reset email",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Reset email sent",
        description: "Check your inbox for a password reset link.",
      });
      setShowForgotPassword(false);
    }
    setIsSubmitting(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
      setShowResetForm(false);
      navigate("/dashboard/auth", { replace: true });
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Password reset form (after clicking email link)
  if (showResetForm) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-muted/30 p-4">
        <SEOHead title="Reset Password" description="Reset your password" noindex={true} />
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Building className="h-8 w-8 text-primary" />
              <span className="font-display text-2xl font-semibold text-primary">Therizo</span>
            </div>
            <CardTitle className="font-display text-xl">Set New Password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <Label htmlFor="reset-password">New Password</Label>
                <Input
                  id="reset-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reset-confirm-password">Confirm Password</Label>
                <Input
                  id="reset-confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Forgot password form
  if (showForgotPassword) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-muted/30 p-4">
        <SEOHead title="Forgot Password" description="Reset your password" noindex={true} />
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Building className="h-8 w-8 text-primary" />
              <span className="font-display text-2xl font-semibold text-primary">Therizo</span>
            </div>
            <CardTitle className="font-display text-xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  name="email"
                  type="email"
                  placeholder="you@therizoproperties.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowForgotPassword(false)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-muted/30 p-4">
      <SEOHead title="Staff Login" description="Therizo staff dashboard login" noindex={true} />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building className="h-8 w-8 text-primary" />
            <span className="font-display text-2xl font-semibold text-primary">Therizo</span>
          </div>
          <CardTitle className="font-display text-xl">Staff Dashboard</CardTitle>
          <CardDescription>
            Sign in to access the internal dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="you@therizoproperties.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className={signInEmail.length > 0 ? (signInEmailValid ? "pr-10 border-green-500 focus-visible:ring-green-500" : "pr-10 border-destructive focus-visible:ring-destructive") : ""}
                      required
                    />
                    {signInEmail.length > 0 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {signInEmailValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    )}
                  </div>
                  {signInEmail.length > 0 && !signInEmailValid && (
                    <p className="text-xs text-destructive mt-1">Please enter a valid email address</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label htmlFor="remember-me" className="text-sm font-normal cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting || (signInEmail.length > 0 && !signInEmailValid)}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-muted-foreground"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot your password?
                </Button>
                <p className="text-xs text-center text-muted-foreground pt-2 border-t">
                  Staff accounts are provisioned by an administrator. Contact your admin if you need access.
                </p>
              </form>
        </CardContent>
      </Card>
    </div>
  );
}
