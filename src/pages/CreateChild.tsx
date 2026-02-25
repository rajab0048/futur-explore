import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Plus, Calendar, Target, Sparkles, CheckCircle, HelpCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { trackEvent } from "@/lib/tracking";
import { automationService } from "@/lib/automation";
import { useEffect } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const CreateChild = () => {
  const [child, setChild] = useState({
    name: "",
    age: "",
    avatar: "",
    learningLevel: ""
  });

  // Mock user ID - in real app, this would come from auth context
  const mockUserId = "user-123";

  useEffect(() => {
    // Check if profile completion reminder should be sent
    automationService.checkProfileCompletionReminder(mockUserId);
  }, []);

  const updateChild = (field: string, value: string) => {
    setChild(prev => ({ ...prev, [field]: value }));
  };

  const allFieldsFilled = child.name.trim() !== "" && 
    child.age.trim() !== "" && 
    child.learningLevel.trim() !== "";

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Step 2 of 3</div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[66%] rounded-full bg-gradient-coral transition-all duration-700" />
          </div>
          <p className="text-center text-xs text-muted-foreground">Set up child profiles</p>
        </div>

        <motion.div
          className="max-w-6xl mx-auto px-4 sm:px-6"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link to="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="font-display text-2xl font-bold text-center sm:text-left">Add Your Explorers</h1>
          </div>

          {/* Single child form */}
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <motion.div
              className="rounded-2xl bg-card p-6 shadow-card border border-border/50"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
            >
              <div className="mb-4">
                <Label className="text-sm font-semibold">Explorer Name</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={child.name}
                    onChange={(e) => updateChild("name", e.target.value)}
                    placeholder="Enter explorer name"
                    className="rounded-xl pl-10"
                  />
                </div>
                {child.name && (
                  <p className="text-xs text-muted-foreground mt-1">This name will appear on their profile and certificates</p>
                )}
              </div>

              <div className="mb-4">
                <Label className="text-sm font-semibold">Age</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={child.age}
                    onChange={(e) => updateChild("age", e.target.value)}
                    placeholder="Age (6-13)"
                    min="6"
                    max="13"
                    className="rounded-xl pl-10"
                  />
                </div>
                {child.age && (
                  <div className="mt-2 rounded-lg bg-explorer-blue/10 p-3">
                    <div className="flex items-start gap-2">
                      <HelpCircle className="h-4 w-4 text-explorer-blue mt-0.5 shrink-0" />
                      <div className="text-xs text-muted-foreground">
                        <p className="font-semibold">Why we ask:</p>
                        <p>Age helps us provide age-appropriate content and ensure safety compliance.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <Label className="text-sm font-semibold">Learning Level</Label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground" />
                  <Select value={child.learningLevel} onValueChange={(value) => updateChild("learningLevel", value)}>
                    <SelectTrigger className="rounded-xl pl-10">
                      <SelectValue placeholder="Select learning level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (Ages 6-7)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (Ages 8-10)</SelectItem>
                      <SelectItem value="advanced">Advanced (Ages 11-13)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {child.learningLevel && (
                  <div className="mt-2 rounded-lg bg-explorer-green/10 p-3">
                    <div className="flex items-start gap-2">
                      <HelpCircle className="h-4 w-4 text-explorer-green mt-0.5 shrink-0" />
                      <div className="text-xs text-muted-foreground">
                        <p className="font-semibold">Why we ask:</p>
                        <p>Learning level ensures content matches your child's current abilities and provides appropriate challenges.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <Label className="text-sm font-semibold">Choose Avatar</Label>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {["🦊", "🐯", "🦁", "🐼", "🐸", "🐵", "🦄", "🦅", "🦆", "🦇", "🦈", "🦉", "🦋", "🦌", "🦍", "🦎", "🦏", "🦐", "🦑", "🦒", "🦓", "🦔", "🦕", "🦖"].map((avatar, avatarIndex) => (
                      <button
                        key={avatarIndex}
                        onClick={() => updateChild("avatar", avatar)}
                        className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg border-2 transition-all ${
                          child.avatar === avatar
                            ? "border-explorer-coral bg-explorer-coral/10"
                            : "border-border bg-card hover:border-muted-foreground/50"
                        }`}
                      >
                        <span className="text-lg sm:text-2xl">{avatar}</span>
                      </button>
                    ))}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="mt-8 text-center"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            <Link to="/dashboard">
              <Button variant="explorer" size="xl" className="w-full sm:w-auto" disabled={!allFieldsFilled} onClick={() => {
                if (allFieldsFilled) {
                  trackEvent("onboarding_completed");
                  
                  // Update child profiles in automation system
                  automationService.registerUser({
                    email: "parent@example.com",
                    parentName: "Parent Name",
                    childProfiles: [{
                      id: Math.random().toString(36).substr(2, 9),
                      name: child.name,
                      age: parseInt(child.age),
                      learningLevel: child.learningLevel,
                      lessonsCompleted: 0,
                      achievements: [],
                      weeklyMinutes: 0,
                      currentMission: "What is AI?"
                    }]
                  });
                }
              }}>
                Create Explorer Profile <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateChild;
