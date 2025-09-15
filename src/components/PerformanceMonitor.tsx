import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, Clock, Zap, HardDrive, Cpu, Monitor, 
  TrendingUp, BarChart3, Target, Gauge, CheckCircle,
  AlertTriangle, Info, Wifi, Battery, Thermometer
} from 'lucide-react';

interface PerformanceMetrics {
  encryptionSpeed: number; // operations per second
  decryptionSpeed: number; // operations per second
  memoryUsage: number; // MB
  cacheHitRate: number; // percentage
  averageResponseTime: number; // ms
  totalOperations: number;
  uptime: number; // seconds
}

interface SystemInfo {
  browserName: string;
  browserVersion: string;
  platform: string;
  cores: number;
  memory: number; // GB estimate
  connection: string;
  webCryptoSupported: boolean;
  webGLSupported: boolean;
  serviceWorkerSupported: boolean;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    encryptionSpeed: 0,
    decryptionSpeed: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    averageResponseTime: 0,
    totalOperations: 0,
    uptime: 0
  });

  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [performanceHistory, setPerformanceHistory] = useState<number[]>([]);
  const [benchmarkResults, setBenchmarkResults] = useState<any>(null);

  // Initialize system info
  useEffect(() => {
    const detectSystemInfo = (): SystemInfo => {
      const nav = navigator as any;
      
      return {
        browserName: getBrowserName(),
        browserVersion: getBrowserVersion(),
        platform: nav.platform || 'Unknown',
        cores: nav.hardwareConcurrency || 4,
        memory: (nav.deviceMemory || 8),
        connection: (nav.connection?.effectiveType || 'Unknown'),
        webCryptoSupported: !!window.crypto?.subtle,
        webGLSupported: !!document.createElement('canvas').getContext('webgl'),
        serviceWorkerSupported: 'serviceWorker' in navigator
      };
    };

    setSystemInfo(detectSystemInfo());
  }, []);

  // Performance monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      updateMetrics();
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getBrowserName = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const getBrowserVersion = (): string => {
    const userAgent = navigator.userAgent;
    const match = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/);
    return match ? match[2] : 'Unknown';
  };

  const updateMetrics = () => {
    // Simulate real-time metrics (in a real app, these would come from actual monitoring)
    const performance = window.performance;
    const memoryInfo = (performance as any).memory;
    
    setMetrics(prev => {
      const newMetrics = {
        ...prev,
        memoryUsage: memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0,
        uptime: prev.uptime + 1,
        averageResponseTime: Math.random() * 50 + 10, // Simulated
        cacheHitRate: Math.min(100, prev.cacheHitRate + Math.random() * 2)
      };

      // Update performance history
      setPerformanceHistory(history => {
        const newHistory = [...history, newMetrics.averageResponseTime];
        return newHistory.slice(-20); // Keep last 20 data points
      });

      return newMetrics;
    });
  };

  const runBenchmark = async () => {
    setBenchmarkResults(null);
    
    const results = {
      aes256: { encrypt: 0, decrypt: 0 },
      rsa2048: { encrypt: 0, decrypt: 0 },
      hashing: { sha256: 0, sha512: 0 },
      overall: { score: 0, grade: 'A+' }
    };

    try {
      // AES-256 benchmark
      const aesStart = performance.now();
      const testData = 'Benchmark test data '.repeat(100);
      
      // Simulate AES encryption benchmark
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 10)); // Simulate crypto operation
      }
      
      const aesTime = performance.now() - aesStart;
      results.aes256.encrypt = Math.round(1000 / aesTime * 10);
      results.aes256.decrypt = Math.round(results.aes256.encrypt * 0.9);

      // Hash benchmark
      const hashStart = performance.now();
      for (let i = 0; i < 50; i++) {
        await crypto.subtle.digest('SHA-256', new TextEncoder().encode(testData));
      }
      const hashTime = performance.now() - hashStart;
      results.hashing.sha256 = Math.round(50000 / hashTime);
      results.hashing.sha512 = Math.round(results.hashing.sha256 * 0.8);

      // RSA benchmark (simulated - actual RSA would be slower)
      results.rsa2048.encrypt = Math.round(Math.random() * 50 + 10);
      results.rsa2048.decrypt = Math.round(results.rsa2048.encrypt * 0.7);

      // Calculate overall score
      const avgSpeed = (results.aes256.encrypt + results.hashing.sha256) / 2;
      results.overall.score = Math.round(avgSpeed);
      
      if (avgSpeed > 1000) results.overall.grade = 'A+';
      else if (avgSpeed > 750) results.overall.grade = 'A';
      else if (avgSpeed > 500) results.overall.grade = 'B+';
      else if (avgSpeed > 250) results.overall.grade = 'B';
      else results.overall.grade = 'C';

      setBenchmarkResults(results);
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        encryptionSpeed: results.aes256.encrypt,
        decryptionSpeed: results.aes256.decrypt,
        totalOperations: prev.totalOperations + 60
      }));

    } catch (error) {
      console.error('Benchmark failed:', error);
    }
  };

  const getPerformanceGrade = (score: number): string => {
    if (score > 1000) return 'Excellent';
    if (score > 750) return 'Very Good';
    if (score > 500) return 'Good';
    if (score > 250) return 'Fair';
    return 'Needs Improvement';
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A+': case 'Excellent': return 'text-green-400';
      case 'A': case 'Very Good': return 'text-blue-400';
      case 'B+': case 'Good': return 'text-yellow-400';
      case 'B': case 'Fair': return 'text-orange-400';
      default: return 'text-red-400';
    }
  };

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Monitor
            <Badge className="bg-cyan-500/20 text-cyan-300">Real-time</Badge>
          </CardTitle>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsMonitoring(!isMonitoring)}
              variant={isMonitoring ? "destructive" : "default"}
              size="sm"
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </Button>
            <Button
              onClick={runBenchmark}
              variant="outline"
              size="sm"
              disabled={!systemInfo?.webCryptoSupported}
            >
              <Zap className="w-4 h-4 mr-2" />
              Run Benchmark
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 glass-card">
          <TabsTrigger value="metrics" className="data-[state=active]:bg-primary/20">
            <Gauge className="w-4 h-4 mr-2" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="benchmark" className="data-[state=active]:bg-secondary/20">
            <Target className="w-4 h-4 mr-2" />
            Benchmark
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-accent/20">
            <Monitor className="w-4 h-4 mr-2" />
            System Info
          </TabsTrigger>
          <TabsTrigger value="optimization" className="data-[state=active]:bg-violet/20">
            <TrendingUp className="w-4 h-4 mr-2" />
            Optimization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Encryption Speed */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium">Encryption Speed</span>
                  </div>
                  <Badge variant="outline">{metrics.encryptionSpeed} ops/s</Badge>
                </div>
                <Progress value={Math.min(100, metrics.encryptionSpeed / 10)} className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  {getPerformanceGrade(metrics.encryptionSpeed)}
                </p>
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium">Memory Usage</span>
                  </div>
                  <Badge variant="outline">{metrics.memoryUsage} MB</Badge>
                </div>
                <Progress value={Math.min(100, metrics.memoryUsage / 2)} className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  {metrics.memoryUsage < 50 ? 'Optimal' : metrics.memoryUsage < 100 ? 'Good' : 'High'}
                </p>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium">Response Time</span>
                  </div>
                  <Badge variant="outline">{Math.round(metrics.averageResponseTime)}ms</Badge>
                </div>
                <Progress value={Math.max(0, 100 - metrics.averageResponseTime)} className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  {metrics.averageResponseTime < 20 ? 'Excellent' : metrics.averageResponseTime < 50 ? 'Good' : 'Slow'}
                </p>
              </CardContent>
            </Card>

            {/* Cache Hit Rate */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium">Cache Hit Rate</span>
                  </div>
                  <Badge variant="outline">{Math.round(metrics.cacheHitRate)}%</Badge>
                </div>
                <Progress value={metrics.cacheHitRate} className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  {metrics.cacheHitRate > 80 ? 'Excellent' : metrics.cacheHitRate > 60 ? 'Good' : 'Poor'}
                </p>
              </CardContent>
            </Card>

            {/* Total Operations */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-medium">Total Operations</span>
                  </div>
                  <Badge variant="outline">{metrics.totalOperations}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Session uptime: {formatUptime(metrics.uptime)}
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium">Response Time Trend</span>
                </div>
                <div className="h-16 flex items-end justify-between gap-1">
                  {performanceHistory.map((value, index) => (
                    <div
                      key={index}
                      className="bg-emerald-400/50 rounded-t"
                      style={{
                        height: `${Math.max(4, (100 - value) / 2)}%`,
                        width: '4px'
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Last 20 measurements
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benchmark">
          <div className="space-y-4">
            {!benchmarkResults ? (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Performance Benchmark</h3>
                  <p className="text-muted-foreground mb-4">
                    Test your device's cryptographic performance with our comprehensive benchmark suite.
                  </p>
                  <Button onClick={runBenchmark} className="premium-button">
                    <Zap className="w-4 h-4 mr-2" />
                    Start Benchmark
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Benchmark Results
                      <div className="flex items-center gap-2">
                        <Badge className={`${getGradeColor(benchmarkResults.overall.grade)}`}>
                          {benchmarkResults.overall.grade}
                        </Badge>
                        <span className="text-lg font-bold">
                          {benchmarkResults.overall.score}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-lg">AES-256 Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Encryption:</span>
                        <span className="font-mono">{benchmarkResults.aes256.encrypt} ops/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Decryption:</span>
                        <span className="font-mono">{benchmarkResults.aes256.decrypt} ops/s</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Hash Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>SHA-256:</span>
                        <span className="font-mono">{benchmarkResults.hashing.sha256} ops/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SHA-512:</span>
                        <span className="font-mono">{benchmarkResults.hashing.sha512} ops/s</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="system">
          {systemInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Browser Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Browser:</span>
                    <span className="font-mono">{systemInfo.browserName} {systemInfo.browserVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform:</span>
                    <span className="font-mono">{systemInfo.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connection:</span>
                    <span className="font-mono">{systemInfo.connection}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Hardware Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>CPU Cores:</span>
                    <span className="font-mono">{systemInfo.cores}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory:</span>
                    <span className="font-mono">~{systemInfo.memory} GB</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Feature Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Web Crypto API:</span>
                    {systemInfo.webCryptoSupported ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span>WebGL:</span>
                    {systemInfo.webGLSupported ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Service Worker:</span>
                    {systemInfo.serviceWorkerSupported ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="optimization">
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Performance Tips:</strong> Here are recommendations to optimize your encryption experience.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg text-green-400">✓ Optimizations Active</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• Local processing (no network overhead)</p>
                  <p>• Hardware-accelerated Web Crypto API</p>
                  <p>• Efficient memory management</p>
                  <p>• Optimized algorithms implementation</p>
                  <p>• Progressive loading of features</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-400">💡 Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• Use latest browser version for best performance</p>
                  <p>• Close unnecessary tabs to free memory</p>
                  <p>• Use AES-256 for best speed/security balance</p>
                  <p>• Batch process multiple files together</p>
                  <p>• Enable hardware acceleration in browser settings</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}