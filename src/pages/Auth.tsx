import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Mail, Lock, User, ShieldCheck, Zap, BarChart3, ChevronRight } from 'lucide-react';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    login(email);
    toast.success('Signed in successfully!');
    navigate('/');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    signup(fullName, email);
    toast.success('Account created successfully!');
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      {/* Subtle Pattern */}
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

      <div className="w-full max-w-[480px] relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Brand Section */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
            <BarChart3 className="text-blue-600 w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Circle Insights</h1>
        </div>

        <Card className="border-none bg-white/95 backdrop-blur-sm shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-blue-600"></div>

          <CardHeader className="pt-8 px-10 pb-2">
            <CardTitle className="text-2xl font-bold text-slate-900 text-center">
              {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-slate-500 text-center mt-2">
              {activeTab === 'signin'
                ? 'Welcome back! Please enter your details.'
                : 'Join us today to manage your strategic landscape.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-10 py-6">
            <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 mb-8 rounded-xl border border-slate-200">
                <TabsTrigger value="signin" className="rounded-lg py-2.5 font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg py-2.5 font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-0 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-semibold text-slate-700 ml-1">Email Address</Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <Mail size={18} />
                      </div>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="name@example.com"
                        className="h-12 pl-12 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all rounded-xl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <Label htmlFor="signin-password" className="text-sm font-semibold text-slate-700">Password</Label>
                      <button type="button" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Forgot password?</button>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <Lock size={18} />
                      </div>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        className="h-12 pl-12 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all rounded-xl"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 group">
                    Sign In <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-semibold text-slate-700 ml-1">Full Name</Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <User size={18} />
                      </div>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        className="h-12 pl-12 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all rounded-xl"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-semibold text-slate-700 ml-1">Email Address</Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <Mail size={18} />
                      </div>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="yourname@nitorinfotech.com"
                        className="h-12 pl-12 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all rounded-xl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-semibold text-slate-700 ml-1">Password</Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <Lock size={18} />
                      </div>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a strong password"
                        className="h-12 pl-12 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all rounded-xl"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 group">
                    Create Account <Zap size={16} className="ml-2 text-yellow-500" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col items-center border-t border-slate-100 bg-slate-50 py-6 px-10">
            <p className="text-sm text-slate-500 font-medium">
              {activeTab === 'signin' ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => setActiveTab(activeTab === 'signin' ? 'signup' : 'signin')}
                className="text-blue-600 font-bold hover:underline"
              >
                {activeTab === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 flex flex-col items-center gap-3 opacity-60">
          <div className="flex items-center gap-2 text-white/80">
            <ShieldCheck size={14} className="text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted</span>
          </div>
          <p className="text-white/40 text-[10px]">© {new Date().getFullYear()} Circle Insights. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
