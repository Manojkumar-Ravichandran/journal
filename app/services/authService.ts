export interface User {
  id: string;
  name: string;
  email: string;
}

export const getMe = async (): Promise<User | null> => {
  try {
    const response = await fetch('/api/auth/me');
    if (!response.ok) return null;
    const data = await response.json();
    if (data.user) {
      return { id: data.user._id, name: data.user.name, email: data.user.email };
    }
    return null;
  } catch (error) {
    console.error("Auth me error:", error);
    return null;
  }
};

export const login = async (email: string, password: string): Promise<User | null> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    // Note: The backend sets a cookie, so we might still need to fetch the user if the response doesn't include it
    // But let's assume if success: true, we can try to get the user
    // However, it's better if login returns the user object directly.
    // Let's re-fetch the user to be sure we have the latest data and correct session
    return await getMe();
  }
  return null;
};

export const register = async (name: string, email: string, password: string): Promise<User | null> => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (response.ok) {
    // After registration, the user usually needs to login, or the register route could auto-login
    // Our register route doesn't set a session, so we should probably call login after register
    // OR update register to set a session.
    // For now, let's try to login with the registered credentials
    return await login(email, password);
  }
  return null;
};

export const logout = async () => {
  // If we had a logout API, we'd call it here to clear the cookie
  // Let's assume there's no logout API yet, but we should clear local state if any exists
  // Actually, we should probably add a logout API to clear the token cookie.
  await fetch('/api/auth/logout', { method: 'POST' });
};
