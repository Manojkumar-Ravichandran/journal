"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "./store/slices/authSlice";
import { ThemeProvider } from "next-themes";

function AuthLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) {
          dispatch(setUser({
            id: data.user._id,
            name: data.user.name,
            email: data.user.email
          }));
        } else {
          dispatch(setUser(null));
        }
      });
  }, []);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthLoader>{children}</AuthLoader>
      </ThemeProvider>
    </Provider>
  );
}
