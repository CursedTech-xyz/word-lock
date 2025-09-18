import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Key, 
  Hash, 
  FileText, 
  Activity, 
  Clock, 
  TrendingUp, 
  Zap,
  BarChart3,
  Calendar,
  Target,
  BookOpen
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentFact, setCurrentFact] = useState(0);

  const cryptoFacts = [
    {
      title: "AES-256 Security",
      fact: "AES-256 would take longer than the age of the universe to crack using current technology.",
      icon: Shield
    },
    {
      title: "Quantum Computing",
      fact: "RSA encryption may become vulnerable to quantum computers, leading to post-quantum cryptography development.",
      icon: Zap
    },
    {
      title: "Enigma Machine",
      fact: "The Enigma machine had 158,962,555,217,826,360,000 possible settings, yet was still broken by Allied cryptanalysts.",
      icon: Key
    }
  ];

  const quickActions = [
    {
      title: "Encrypt Text",
      description: "Secure your messages instantly",
      icon: Shield,
      color: "bg-green-500/10 text-green-500 border-green-500/20",
      action: () => navigate('/encrypt')
    },
    {
      title: "Generate Keys",
      description: "Create RSA key pairs",
      icon: Key,
      color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      action: () => navigate('/vault')
    },
    {
      title: "Hash Calculator",
      description: "Calculate file checksums",
      icon: Hash,
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      action: () => navigate('/encrypt?tool=hash')
    },
    {
      title: "Batch Processing",
      description: "Process multiple files",
      icon: FileText,
      color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      action: () => navigate('/files')
    }
  ];

  const recentActivities = [
    { action: "Encrypted document.pdf", time: "2 minutes ago", type: "encrypt" },
    { action: "Generated RSA-4096 key pair", time: "15 minutes ago", type: "keygen" },
    { action: "Calculated SHA-256 hash", time: "1 hour ago", type: "hash" },
    { action: "Completed steganography tutorial", time: "2 hours ago", type: "learn" }
  ];

  const securityMetrics = {
    totalOperations: 1247,
    keysGenerated: 23,
    filesProcessed: 89,
    securityScore: 94
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % cryptoFacts.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero Section with Daily Fact */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold gradient-text">
                Welcome to CipherFlow
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Your professional encryption workspace
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <Badge variant="outline" className="mt-1">
                <Calendar className="w-3 h-3 mr-1" />
                Day {Math.floor((Date.now() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)) + 1}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {React.createElement(cryptoFacts[currentFact].icon, { 
                  className: "w-6 h-6 text-primary mt-1" 
                })}
                <div>
                  <h4 className="font-semibold mb-1">{cryptoFacts[currentFact].title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {cryptoFacts[currentFact].fact}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={action.action}>
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 border ${action.color}`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                  {action.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest encryption operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {activity.type === 'encrypt' && <Shield className="w-4 h-4 text-green-500" />}
                    {activity.type === 'keygen' && <Key className="w-4 h-4 text-orange-500" />}
                    {activity.type === 'hash' && <Hash className="w-4 h-4 text-blue-500" />}
                    {activity.type === 'learn' && <BookOpen className="w-4 h-4 text-purple-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{activity.action}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/analysis')}>
              View All Activity
            </Button>
          </CardContent>
        </Card>

        {/* Security Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Security Overview
            </CardTitle>
            <CardDescription>Your encryption statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Security Score</span>
                <span className="text-2xl font-bold text-green-500">{securityMetrics.securityScore}%</span>
              </div>
              <Progress value={securityMetrics.securityScore} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">Excellent security practices</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold">{securityMetrics.totalOperations.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Operations</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold">{securityMetrics.keysGenerated}</div>
                <div className="text-xs text-muted-foreground">Keys Generated</div>
              </div>
            </div>

            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold">{securityMetrics.filesProcessed}</div>
              <div className="text-xs text-muted-foreground">Files Processed</div>
            </div>

            <Button className="w-full gap-2" onClick={() => navigate('/analysis')}>
              <Target className="w-4 h-4" />
              Detailed Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Smart Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Smart Recommendations
          </CardTitle>
          <CardDescription>Personalized suggestions based on your usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold mb-2">🔐 Upgrade to AES-256-GCM</h4>
              <p className="text-sm text-muted-foreground mb-3">
                You're using AES-256-CBC. Consider upgrading to GCM mode for authenticated encryption.
              </p>
              <Button size="sm" variant="outline" onClick={() => navigate('/encrypt')}>
                Learn More
              </Button>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold mb-2">🎓 Complete Steganography Tutorial</h4>
              <p className="text-sm text-muted-foreground mb-3">
                You haven't explored steganography yet. It's a fascinating way to hide messages in images.
              </p>
              <Button size="sm" variant="outline" onClick={() => navigate('/learn')}>
                Start Learning
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}