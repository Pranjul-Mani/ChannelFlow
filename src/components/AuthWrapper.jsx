// File: src/app/components/AuthWrapper.js

"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { useAuth } from '../lib/AuthContext';

const AuthWrapper = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [prefillEmail, setPrefillEmail] = useState('');
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to home if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const toggleForm = (email = '') => {
    // Store the email if provided (from login redirect)
    setPrefillEmail(email);
    setIsLoginMode(!isLoginMode);
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }


  // Show login or signup form
  return (
    <>
      {isLoginMode ? (
        <LoginForm onToggleForm={toggleForm} />
      ) : (
        <SignupForm 
          onToggleForm={toggleForm} 
          prefillEmail={prefillEmail}
        />
      )}
    </>
  );
};

export default AuthWrapper;