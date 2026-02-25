import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Compass, Mail, Lock, ArrowRight, User, CheckCircle, Wand2, Chrome } from "lucide-react";
import { motion } from "framer-motion";
import { trackEvent } from "@/lib/tracking";
import { useEffect } from "react";
import { automationService } from "@/lib/automation";

const onboardingSteps = [
  { label: "Account", desc: "Create your login" },
  { label: "Profile", desc: "Add your explorer" },
  { label: "Start!", desc: "Begin missions" },
];

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    if (isSignup) {
      trackEvent("onboarding_started");
    }
  }, [isSignup]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <motion.div
        className="w-full max-w-md rounded-2xl bg-card p-8 shadow-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-coral">
            <Compass className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold">Future Explorer</span>
        </Link>

        {/* Onboarding Progress (signup only) */}
        {isSignup && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {onboardingSteps.map((step, i) => (
                <div key={step.label} className="flex flex-1 flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold font-display transition-all ${
                    i === 0 ? "bg-gradient-coral text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {i === 0 ? "1" : i + 1}
                  </div>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">{step.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-1">
              <div className="h-1 flex-1 rounded-full bg-gradient-coral" />
              <div className="h-1 flex-1 rounded-full bg-muted" />
              <div className="h-1 flex-1 rounded-full bg-muted" />
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">Step 1 of 3 — Create your parent account</p>
          </div>
        )}

        <h1 className="mb-2 text-center font-display text-2xl font-bold">
          {isSignup ? "Create Parent Account" : "Welcome Back, Explorer!"}
        </h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          {isSignup
            ? "Set up your account to start your child's AI adventure."
            : "Sign in to continue your journey."}
        </p>

        {/* Sign-in Options */}
        {!isSignup && (
          <div className="mb-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-xs text-muted-foreground/60">OR</div>
              </div>
              <form onSubmit={(e) => e.preventDefault()} className="relative space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-body font-semibold">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="name" placeholder="Your name" className="rounded-xl pl-10" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Help us personalize your experience</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-body font-semibold">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="parent@email.com" className="rounded-xl pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-body font-semibold">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="•••••" className="rounded-xl pl-10" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Secure password for account protection</p>
                </div>
                <Link to={isSignup ? "/create-child" : "/dashboard"}>
                  <Button variant="explorer" size="lg" className="w-full mt-2" onClick={() => {
                    if (isSignup) {
                      trackEvent("onboarding_started");
                      // Trigger welcome email for new signups
                      const email = (document.getElementById('email') as HTMLInputElement)?.value;
                      const name = (document.getElementById('name') as HTMLInputElement)?.value;
                      if (email && name) {
                        automationService.registerUser({
                          email,
                          parentName: name,
                          childProfiles: []
                        });
                      }
                    }
                  }}>
                    {isSignup ? "Continue to Step 2" : "Sign In"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </form>
              {/* Child Profile Setup Indication */}
              {isSignup && (
                <div className="mt-4 rounded-xl bg-explorer-blue/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-explorer-blue" />
                    <p className="text-sm font-semibold text-explorer-blue">Next: Set up child profiles</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    After creating your account, you'll add explorer profiles for your children with their names, ages, and learning preferences.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {!isSignup && (
          <div className="mt-4 text-center">
            <Link to="/lesson/1" className="text-sm font-semibold text-primary hover:underline">
              🎮 Preview a Sample Mission first
            </Link>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {isSignup ? "Already have an account?" : "New to Future Explorer?"}{" "}
          <button onClick={() => setIsSignup(!isSignup)} className="font-bold text-primary hover:underline">
            {isSignup ? "Sign In" : "Sign Up Free"}
          </button>
        </div>

        {isSignup && (
          <div className="mt-4 space-y-2 rounded-xl bg-muted p-3">
            <p className="text-xs font-semibold text-muted-foreground">What you'll get:</p>
            <div className="space-y-1">
              {["7-day free trial", "Up to 3 explorer profiles", "Full parent dashboard"].map((item) => (
                <p key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-explorer-green" /> {item}
                </p>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
