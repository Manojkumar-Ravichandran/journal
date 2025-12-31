"use client";
import InputField from "@/components/ui/InputField";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { login, register, User } from "../services/authService";
import { setUser } from "../store/slices/authSlice";
import { SITE_NAME, SITE_ABBREVIATION } from "../lib/constants";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();

  const onAuthenticated = (user: User) => {
    dispatch(setUser(user));
    router.push('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const user = await login(email, password);
        if (user) {
          onAuthenticated(user);
        } else {
          setError('Invalid email or password.');
        }
      } else {
        if (!name || !email || !password) {
          setError('Please fill in all fields.');
          return;
        }
        const user = await register(name, email, password);
        if (user) {
          onAuthenticated(user);
        } else {
          setError('Registration failed. Email might already be in use.');
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 transition-colors duration-300">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-3xl shadow-2xl animate-in zoom-in duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center font-bold text-2xl text-primary-foreground mb-4">
            {SITE_ABBREVIATION}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{SITE_NAME}</h1>
          <p className="text-muted-foreground text-sm mt-1">{isLogin ? 'Welcome back, Trader' : 'Start your discipline journey'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <InputField
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Trader"
              />
            </div>
          )}
          <div className="space-y-1">
            <InputField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
            />
          </div>
          <div className="space-y-1">
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-xs font-medium text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-primary hover:opacity-90 text-primary-foreground py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-[0.98] mt-4"
          >
            {isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
