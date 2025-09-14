import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Code, RotateCcw, Key, Clock, Zap } from 'lucide-react';

const algorithmData = [
  {
    id: 'caesar',
    name: 'Caesar Cipher',
    icon: Shield,
    security: 'Low',
    speed: 'Very Fast',
    description: 'A simple substitution cipher where each letter is shifted by a fixed number of positions in the alphabet.',
    useCases: ['Educational purposes', 'Basic obfuscation', 'Historical cryptography'],
    pros: ['Easy to understand', 'Fast processing', 'No key required'],
    cons: ['Easily broken', 'Pattern preservation', 'Limited security'],
    securityColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  },
  {
    id: 'base64',
    name: 'Base64 Encoding',
    icon: Code,
    security: 'None',
    speed: 'Very Fast',
    description: 'A binary-to-text encoding scheme that represents binary data in ASCII format using base-64 representation.',
    useCases: ['Data transmission', 'Email encoding', 'URL safe encoding'],
    pros: ['Widely supported', 'Reversible', 'Text-safe format'],
    cons: ['Not encryption', 'No security', 'Easily decoded'],
    securityColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  {
    id: 'rot13',
    name: 'ROT13',
    icon: RotateCcw,
    security: 'Low',
    speed: 'Very Fast',
    description: 'A simple letter substitution cipher that replaces each letter with the letter 13 positions ahead in the alphabet.',
    useCases: ['Forum spoilers', 'Simple obfuscation', 'Text rotation'],
    pros: ['Self-inverse', 'No key needed', 'Preserves case'],
    cons: ['Trivial to break', 'Only works with letters', 'Widely known'],
    securityColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  {
    id: 'xor',
    name: 'XOR Cipher',
    icon: Key,
    security: 'Medium',
    speed: 'Fast',
    description: 'A bitwise XOR operation between the plaintext and a repeating key, providing stronger security with a good key.',
    useCases: ['Basic encryption', 'Stream ciphers', 'One-time pads'],
    pros: ['Symmetric encryption', 'Fast operation', 'Key-dependent security'],
    cons: ['Key reuse vulnerability', 'Pattern analysis', 'Requires strong key'],
    securityColor: 'bg-green-500/20 text-green-300 border-green-500/30'
  }
];

export function AlgorithmInfo() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Available Algorithms</h2>
        <p className="text-muted-foreground">
          Choose the right encryption method for your security needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {algorithmData.map((algo) => (
          <Card key={algo.id} className="glass-card border-border/30 hover:border-border/50 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted/30">
                    <algo.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{algo.name}</CardTitle>
                    <div className="flex gap-2 mt-1">
                      <Badge className={algo.securityColor} variant="outline">
                        <Shield className="w-3 h-3 mr-1" />
                        {algo.security}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30">
                        <Zap className="w-3 h-3 mr-1" />
                        {algo.speed}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {algo.description}
              </p>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2 text-green-400">Use Cases</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {algo.useCases.map((useCase, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                        {useCase}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-green-400">Pros</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {algo.pros.map((pro, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2 text-red-400">Cons</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {algo.cons.map((con, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card border-accent/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent/20">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-lg font-semibold">Privacy Notice</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All encryption and decryption processes are performed entirely in your browser. 
            No data is transmitted to external servers, ensuring your sensitive information 
            remains completely private and secure. Your text never leaves your device.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}