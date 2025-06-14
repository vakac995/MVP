import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, ArrowLeft, Users, Vote, Heart, MessageCircle } from 'lucide-react';
import { RegistrationForm } from '../forms/RegistrationForm';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);

  const handleRegistrationSuccess = (data: any) => {
    setRegistrationData(data);
    setRegistrationComplete(true);
  };

  const handleSwitchToLogin = () => {
    // In a real app, this would navigate to login page
    // For now, we'll just navigate back to home
    navigate('/');
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Welcome to zaJedno Caribrod!</CardTitle>
              <p className="text-muted-foreground">
                Your account has been created successfully
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Check className="h-4 w-4" />
                <AlertDescription>
                  {registrationData?.message || 'Account created successfully! Please check your email to verify your account.'}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="font-semibold">What's next?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Explore Projects</h4>
                      <p className="text-sm text-muted-foreground">
                        Browse community projects and see what's happening in Caribrod
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Vote className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Start Voting</h4>
                      <p className="text-sm text-muted-foreground">
                        Support projects you believe in with your vote
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Heart className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Make Donations</h4>
                      <p className="text-sm text-muted-foreground">
                        Help fund projects that matter to your community
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Join Discussions</h4>
                      <p className="text-sm text-muted-foreground">
                        Share your thoughts and connect with other community members
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {registrationData?.badges_awarded > 0 && (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    🎉 Congratulations! You've earned your first badge: "Newcomer"
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/')} className="flex-1 max-w-xs">
                  Explore Projects
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/profile')}
                  className="flex-1 max-w-xs"
                >
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            className="absolute top-4 left-4"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join zaJedno Caribrod
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Become part of our community and help shape the future of Caribrod through collaborative projects and civic engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Benefits Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Why Join Our Community?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Create & Support Projects</h3>
                    <p className="text-sm text-muted-foreground">
                      Launch your own community initiatives or support others with voting and donations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Vote className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Earn Badges & Recognition</h3>
                    <p className="text-sm text-muted-foreground">
                      Get recognized for your contributions with our gamified badge system.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Connect with Neighbors</h3>
                    <p className="text-sm text-muted-foreground">
                      Build relationships and collaborate with fellow community members.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Heart className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Make Real Impact</h3>
                    <p className="text-sm text-muted-foreground">
                      See your ideas come to life and contribute to positive change in Caribrod.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Community Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">12+</div>
                    <div className="text-sm text-muted-foreground">Active Projects</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">350+</div>
                    <div className="text-sm text-muted-foreground">Community Votes</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">85+</div>
                    <div className="text-sm text-muted-foreground">Community Members</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">25K+</div>
                    <div className="text-sm text-muted-foreground">RSD Donated</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registration Form */}
          <div>
            <RegistrationForm 
              onSuccess={handleRegistrationSuccess}
              onSwitchToLogin={handleSwitchToLogin}
            />
          </div>
        </div>
      </div>
    </div>
  );
}