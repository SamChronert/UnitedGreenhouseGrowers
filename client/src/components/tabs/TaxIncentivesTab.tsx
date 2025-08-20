import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Construction, Mail, CheckCircle, AlertTriangle } from "lucide-react";
import { trackTabView } from "@/lib/analytics";

interface TaxIncentivesTabProps {
  onAnalyticsEvent?: (eventName: string, payload: any) => void;
}

export default function TaxIncentivesTab({ onAnalyticsEvent }: TaxIncentivesTabProps) {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track tab view on mount
  useEffect(() => {
    trackTabView('tax-incentives', 'Tax Incentives');
    onAnalyticsEvent?.('tab_view', { tab: 'tax-incentives' });
  }, [onAnalyticsEvent]);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call - in real implementation, this would call an email service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubscribed(true);
      setEmail('');
      
      onAnalyticsEvent?.('tax_incentives_email_signup', { email });
    } catch (error) {
      console.error('Email signup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      role="tabpanel" 
      id="tax-incentives-panel" 
      aria-labelledby="tax-incentives-tab"
      className="space-y-6"
    >
      {/* Under Development Banner */}
      <Alert className="border-orange-200 bg-orange-50">
        <Construction className="h-5 w-5 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <strong className="font-semibold">Under Development</strong>
              <p className="mt-1">
                We're currently gathering and verifying tax incentive information for greenhouse operations. Check back soon!
              </p>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Email Notification Signup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Get Notified When Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isSubscribed ? (
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <p className="text-gray-600 text-sm">
                Be the first to know when our comprehensive tax incentives database launches. 
                We'll include federal, state, and local incentives for greenhouse operations.
              </p>
              <div className="flex gap-3 max-w-md">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !email.trim()}
                  className="whitespace-nowrap"
                >
                  {isSubmitting ? 'Signing up...' : 'Notify Me'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Thanks! We'll notify you when tax incentives are available.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Table Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon: Tax Incentive Database</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Our upcoming tax incentives database will help you discover federal, state, and local tax benefits 
            for greenhouse operations, energy efficiency improvements, and agricultural investments.
          </p>
          
          {/* Empty Table Preview */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incentive Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Jurisdiction</TableHead>
                  <TableHead>Benefit Amount</TableHead>
                  <TableHead>Eligible Activities</TableHead>
                  <TableHead>Requirements</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <AlertTriangle className="h-8 w-8 text-gray-400" />
                      <span>Tax incentive data will be populated here</span>
                      <span className="text-sm">Including credits, deductions, exemptions, and rebates</span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          {/* What to Expect */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What We're Including:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Federal tax credits and deductions</li>
                <li>• State-specific agricultural incentives</li>
                <li>• Local property tax exemptions</li>
                <li>• Energy efficiency rebates</li>
                <li>• Equipment depreciation schedules</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Features Coming:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Filter by location and business type</li>
                <li>• Calculate potential savings</li>
                <li>• Application deadlines and requirements</li>
                <li>• Direct links to official forms</li>
                <li>• Expert guidance and tips</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}