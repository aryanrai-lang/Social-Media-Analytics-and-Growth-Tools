import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BarChart3, TrendingUp, Shield, Zap } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Left — Branding Panel */}
      <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-primary via-primary/90 to-violet-600 p-10 text-white relative overflow-hidden">
        {/* Floating decoration */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 animate-float" />
        <div className="absolute bottom-10 -left-16 h-48 w-48 rounded-full bg-white/5 animate-float" style={{ animationDelay: '3s' }} />

        <div className="flex items-center gap-3 z-10">
          <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
            <BarChart3 className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">Social Analytics</span>
        </div>

        <div className="z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight">Grow your social<br />presence with AI</h1>
            <p className="mt-3 text-lg text-white/80 max-w-md">
              Analytics, competitor insights, and AI-powered content strategies — all in one place.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: TrendingUp, text: "Real-time Instagram analytics" },
              { icon: Shield, text: "Competitor gap analysis" },
              { icon: Zap, text: "AI-generated content plans" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="rounded-lg bg-white/15 p-2">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-white/90">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/50 z-10">© 2026 Social Analytics. All rights reserved.</p>
      </div>

      {/* Right — Form Panel */}
      <div className="flex flex-col bg-background relative">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-[400px] space-y-6 animate-fade-in-up">
            {/* Mobile logo */}
            <div className="flex items-center gap-2 md:hidden mb-4">
              <div className="rounded-xl bg-gradient-to-br from-primary to-violet-500 p-2">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">Social Analytics</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
              <p className="text-muted-foreground mt-1">Sign in to your account</p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="h-11 transition-shadow duration-200 focus:shadow-md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-11 transition-shadow duration-200 focus:shadow-md"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-primary to-violet-600 text-white hover:opacity-90 active:scale-[0.98] transition-all duration-200"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                or
              </span>
            </div>

            <GoogleLoginButton />

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
