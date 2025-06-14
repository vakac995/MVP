import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Award, Target } from 'lucide-react';
import { BadgeDisplay } from './BadgeDisplay';
import { badgeServiceGetUserBadges, badgeServiceSetFeaturedBadge, badgeServiceGetAllBadges } from '@/lib/sdk';

interface BadgeShowcaseProps {
  userId: string;
  isOwner?: boolean;
}

export function BadgeShowcase({ userId, isOwner = false }: BadgeShowcaseProps) {
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredBadgeId, setFeaturedBadgeId] = useState<string | null>(null);

  useEffect(() => {
    loadBadges();
  }, [userId]);

  const loadBadges = async () => {
    try {
      setLoading(true);
      
      // Get user's earned badges
      const userResponse = await badgeServiceGetUserBadges({
        body: { user_id: userId }
      });
      
      if (userResponse.data) {
        setUserBadges(userResponse.data);
        
        // Find featured badge
        const featured = userResponse.data.find((badge: any) => badge.is_featured);
        if (featured) {
          setFeaturedBadgeId(featured.badge_id);
        }
      }
      
      // Get all available badges for progress tracking
      const allResponse = await badgeServiceGetAllBadges();
      if (allResponse.data) {
        setAllBadges(allResponse.data);
      }
      
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetFeatured = async (badgeId: string) => {
    try {
      await badgeServiceSetFeaturedBadge({
        body: {
          user_id: userId,
          badge_id: badgeId
        }
      });
      
      setFeaturedBadgeId(badgeId);
      
      // Update the local state
      setUserBadges(prev => prev.map(badge => ({
        ...badge,
        is_featured: badge.badge_id === badgeId
      })));
      
    } catch (error) {
      console.error('Error setting featured badge:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-6 gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 w-8 bg-gray-200 rounded-full"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const earnedBadges = userBadges.filter(badge => badge.badge);
  const featuredBadge = earnedBadges.find(badge => badge.is_featured);

  // Calculate progress for badges not yet earned
  const earnedBadgeTypes = new Set(earnedBadges.map(badge => badge.badge.badge_type));
  const unearned = allBadges.filter(badge => !earnedBadgeTypes.has(badge.badge_type));

  return (
    <div className="space-y-6">
      {/* Featured Badge */}
      {featuredBadge && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Featured Badge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <BadgeDisplay 
                badge={featuredBadge.badge} 
                size="lg" 
                showText={true}
                isFeature={true}
              />
              <div className="text-sm text-muted-foreground">
                Earned {new Date(featuredBadge.earned_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Earned Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Earned Badges ({earnedBadges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {earnedBadges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedBadges.map((userBadge) => (
                <div 
                  key={userBadge.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <BadgeDisplay 
                      badge={userBadge.badge} 
                      size="md"
                      isFeature={userBadge.is_featured}
                    />
                    <div>
                      <p className="font-medium text-sm">{userBadge.badge.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(userBadge.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {isOwner && !userBadge.is_featured && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetFeatured(userBadge.badge_id)}
                      className="text-xs"
                    >
                      Feature
                    </Button>
                  )}
                  
                  {userBadge.is_featured && (
                    <Badge variant="secondary" className="text-xs">
                      Featured
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No badges earned yet</p>
              <p className="text-sm">Start participating to earn your first badge!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Towards Badges */}
      {unearned.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progress Towards Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {unearned.slice(0, 6).map((badge) => (
                <div 
                  key={badge.id} 
                  className="flex items-center gap-3 p-3 border rounded-lg opacity-60"
                >
                  <div className="relative">
                    <BadgeDisplay 
                      badge={badge} 
                      size="md"
                    />
                    <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-600">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {badge.criteria_value && `Need ${badge.criteria_value} ${
                        badge.badge_type.includes('vote') ? 'votes' :
                        badge.badge_type.includes('project') ? 'projects' :
                        badge.badge_type.includes('donation') ? 'donations' :
                        badge.badge_type.includes('comment') ? 'comments' : 'actions'
                      }`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {unearned.length > 6 && (
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  And {unearned.length - 6} more badges to discover...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default BadgeShowcase;