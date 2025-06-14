import { Eye, EyeOff, Check, X, User, Mail, Lock, Phone, MapPin, FileText, Bell, CircleAlert } from "lucide-react";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

import { 
  registrationServiceRegisterUser, 
  registrationServiceCheckUsernameAvailability,
  registrationServiceCheckEmailAvailability,
  registrationServiceValidatePassword 
} from '@/lib/sdk';

interface RegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  fullName?: string;
  phoneNumber?: string;
  location?: string;
  bio?: string;
  termsAccepted: boolean;
  newsletterOptIn: boolean;
}

interface RegistrationFormProps {
  onSuccess?: (data: any) => void;
  onSwitchToLogin?: () => void;
}

export function RegistrationForm({ onSuccess, onSwitchToLogin }: RegistrationFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: '', valid: false });
  const [usernameStatus, setUsernameStatus] = useState<{ available?: boolean; error?: string } | null>(null);
  const [emailStatus, setEmailStatus] = useState<{ available?: boolean; error?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger
  } = useForm<RegistrationFormData>();

  const watchedPassword = watch('password');
  const watchedConfirmPassword = watch('confirmPassword');
  const watchedUsername = watch('username');
  const watchedEmail = watch('email');
  const watchedBio = watch('bio');

  // Real-time password validation
  React.useEffect(() => {
    if (watchedPassword) {
      checkPasswordStrength(watchedPassword);
    }
  }, [watchedPassword]);

  // Real-time username validation
  React.useEffect(() => {
    if (watchedUsername && watchedUsername.length >= 3) {
      const timer = setTimeout(() => {
        checkUsernameAvailability(watchedUsername);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setUsernameStatus(null);
    }
  }, [watchedUsername]);

  // Real-time email validation
  React.useEffect(() => {
    if (watchedEmail && watchedEmail.includes('@')) {
      const timer = setTimeout(() => {
        checkEmailAvailability(watchedEmail);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setEmailStatus(null);
    }
  }, [watchedEmail]);

  const checkPasswordStrength = async (password: string) => {
    try {
      const response = await registrationServiceValidatePassword({
        body: { password }
      });
      
      if (response.data) {
        setPasswordStrength(response.data);
      }
    } catch (error) {
      console.error('Error checking password strength:', error);
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    try {
      const response = await registrationServiceCheckUsernameAvailability({
        body: { username }
      });
      
      if (response.data) {
        setUsernameStatus(response.data);
      }
    } catch (error) {
      console.error('Error checking username:', error);
    }
  };

  const checkEmailAvailability = async (email: string) => {
    try {
      const response = await registrationServiceCheckEmailAvailability({
        body: { email }
      });
      
      if (response.data) {
        setEmailStatus(response.data);
      }
    } catch (error) {
      console.error('Error checking email:', error);
    }
  };

  const getPasswordStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getPasswordStrengthValue = (strength: string) => {
    switch (strength) {
      case 'weak': return 33;
      case 'medium': return 66;
      case 'strong': return 100;
      default: return 0;
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      // Validate password confirmation
      if (data.password !== data.confirmPassword) {
        setSubmitError('Passwords do not match');
        setIsSubmitting(false);
        return;
      }

      // Check final validations
      if (!passwordStrength.valid) {
        setSubmitError('Password does not meet requirements');
        setIsSubmitting(false);
        return;
      }

      if (!usernameStatus?.available) {
        setSubmitError('Username is not available');
        setIsSubmitting(false);
        return;
      }

      if (!emailStatus?.available) {
        setSubmitError('Email is not available');
        setIsSubmitting(false);
        return;
      }

      const response = await registrationServiceRegisterUser({
        body: {
          email: data.email,
          password: data.password,
          username: data.username,
          full_name: data.fullName || null,
          phone_number: data.phoneNumber || null,
          location: data.location || null,
          bio: data.bio || null,
          newsletter_opt_in: data.newsletterOptIn,
          terms_accepted: data.termsAccepted
        }
      });

      if (response.data?.success) {
        setSubmitSuccess(response.data.message);
        onSuccess?.(response.data);
      } else {
        setSubmitError(response.data?.error || 'Registration failed');
      }

    } catch (error: any) {
      setSubmitError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Join zaJedno Caribrod</CardTitle>
        <p className="text-center text-sm text-muted-foreground">
          Create your account to start participating in community projects
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className={emailStatus?.available === false ? 'border-red-500' : emailStatus?.available ? 'border-green-500' : ''}
            />
            {emailStatus?.error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <X className="h-3 w-3" />
                {emailStatus.error}
              </p>
            )}
            {emailStatus?.available && (
              <p className="text-sm text-green-500 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Email is available
              </p>
            )}
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Username *
            </Label>
            <Input
              id="username"
              {...register('username', { 
                required: 'Username is required',
                minLength: { value: 3, message: 'Username must be at least 3 characters' },
                maxLength: { value: 20, message: 'Username must be less than 20 characters' },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Username can only contain letters, numbers, and underscores'
                }
              })}
              className={usernameStatus?.available === false ? 'border-red-500' : usernameStatus?.available ? 'border-green-500' : ''}
            />
            {usernameStatus?.error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <X className="h-3 w-3" />
                {usernameStatus.error}
              </p>
            )}
            {usernameStatus?.available && (
              <p className="text-sm text-green-500 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Username is available
              </p>
            )}
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password *
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Password Strength Indicator */}
            {watchedPassword && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Progress 
                    value={getPasswordStrengthValue(passwordStrength.strength)} 
                    className={`h-2 flex-1 ${getPasswordStrengthColor(passwordStrength.strength)}`}
                  />
                  <span className="text-xs capitalize text-muted-foreground">
                    {passwordStrength.strength}
                  </span>
                </div>
                {!passwordStrength.valid && (
                  <p className="text-xs text-muted-foreground">
                    Use 8+ characters with a mix of letters, numbers, and symbols
                  </p>
                )}
              </div>
            )}
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Confirm Password *
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword', { 
                  required: 'Please confirm your password'
                })}
                className={
                  watchedConfirmPassword && watchedPassword !== watchedConfirmPassword 
                    ? 'border-red-500' 
                    : watchedConfirmPassword && watchedPassword === watchedConfirmPassword 
                    ? 'border-green-500' 
                    : ''
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {watchedConfirmPassword && watchedPassword !== watchedConfirmPassword && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <X className="h-3 w-3" />
                Passwords do not match
              </p>
            )}
            {watchedConfirmPassword && watchedPassword === watchedConfirmPassword && (
              <p className="text-sm text-green-500 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Passwords match
              </p>
            )}
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Optional Fields */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-medium text-muted-foreground">Optional Information</h3>
            
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                id="fullName"
                {...register('fullName')}
                placeholder="Your display name"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                {...register('phoneNumber')}
                placeholder="For project updates"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="City or neighborhood"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Bio
              </Label>
              <Textarea
                id="bio"
                {...register('bio', {
                  maxLength: { value: 200, message: 'Bio must be 200 characters or less' }
                })}
                placeholder="Tell us about yourself (max 200 characters)"
                rows={3}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{errors.bio?.message}</span>
                <span>{watchedBio?.length || 0}/200</span>
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="termsAccepted"
                {...register('termsAccepted', { required: 'You must accept the terms and conditions' })}
              />
              <Label htmlFor="termsAccepted" className="text-sm leading-relaxed">
                I agree to the{' '}
                <a href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
              </Label>
            </div>
            {errors.termsAccepted && (
              <p className="text-sm text-red-500">{errors.termsAccepted.message}</p>
            )}

            <div className="flex items-start space-x-2">
              <Checkbox
                id="newsletterOptIn"
                {...register('newsletterOptIn')}
              />
              <Label htmlFor="newsletterOptIn" className="text-sm leading-relaxed flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Subscribe to community updates and newsletters
              </Label>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !passwordStrength.valid || !usernameStatus?.available || !emailStatus?.available}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>

          {/* Error/Success Messages */}
          {submitError && (
            <Alert variant="destructive">
              <CircleAlert className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {submitSuccess && (
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>{submitSuccess}</AlertDescription>
            </Alert>
          )}

          {/* Switch to Login */}
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Button 
                type="button" 
                variant="link" 
                className="p-0 h-auto"
                onClick={onSwitchToLogin}
              >
                Sign in here
              </Button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default RegistrationForm;