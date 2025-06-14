import React from 'react';
import { Badge as BadgeIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface BadgeInfo {
  name: string;
  description: string;
  icon: string;
  color: string;
  badge_type: string;
  category: string;
}

interface BadgeDisplayProps {
  badge: BadgeInfo;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  isFeature?: boolean;
  className?: string;
}

export function BadgeDisplay({ 
  badge, 
  size = 'md', 
  showText = false, 
  isFeature = false,
  className = "" 
}: BadgeDisplayProps) {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm", 
    lg: "h-10 w-10 text-base"
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 ${className}`}>
            <div 
              className={`
                ${sizeClasses[size]} 
                rounded-full flex items-center justify-center
                ${isFeature ? 'ring-2 ring-offset-1 ring-yellow-400' : ''}
                transition-all duration-200 hover:scale-110
              `}
              style={{ backgroundColor: badge.color }}
            >
              <span className="text-white font-medium">
                {badge.icon}
              </span>
            </div>
            
            {showText && (
              <div className="flex flex-col">
                <span className={`font-medium ${textSizes[size]}`}>
                  {badge.name}
                </span>
                {size === 'lg' && (
                  <span className="text-xs text-muted-foreground">
                    {badge.description}
                  </span>
                )}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">{badge.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {badge.description}
            </p>
            <Badge variant="secondary" className="mt-2 text-xs">
              {badge.category === 'project' ? 'Project Badge' : 'User Badge'}
            </Badge>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface BadgeListProps {
  badges: BadgeInfo[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BadgeList({ badges, maxDisplay = 5, size = 'sm', className = "" }: BadgeListProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {displayBadges.map((badge, index) => (
        <BadgeDisplay 
          key={index} 
          badge={badge} 
          size={size}
        />
      ))}
      
      {remainingCount > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`
                ${size === 'sm' ? 'h-6 w-6 text-xs' : size === 'md' ? 'h-8 w-8 text-sm' : 'h-10 w-10 text-base'}
                rounded-full bg-gray-200 flex items-center justify-center
                text-gray-600 font-medium
              `}>
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>And {remainingCount} more badge{remainingCount !== 1 ? 's' : ''}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

export default BadgeDisplay;