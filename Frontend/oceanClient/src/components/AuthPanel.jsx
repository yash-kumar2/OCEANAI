// src/components/AuthPanel.jsx
import React from 'react';
import { Lock, Loader } from 'lucide-react';

export default function AuthPanel({
  isLogin, setIsLogin, authData, setAuthData, handleAuth, authError, loading
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">AI Document Author</h1>
          <p className="text-gray-500">{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})}/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})}/>
          </div>
          {authError && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{authError}</div>}
          <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center">
            {loading ? <Loader className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline">
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
