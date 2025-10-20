import { Badge } from "@/components/ui/badge";
import { useUserReputation } from "@/hooks/useUserReputation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ReputationBadgeProps {
  userId: string;
  showDetails?: boolean;
}

export const ReputationBadge = ({ userId, showDetails = false }: ReputationBadgeProps) => {
  const { reputation, tierConfig, accuracyRate } = useUserReputation(userId);

  if (!reputation) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`gap-1 ${tierConfig.color} ${tierConfig.bgColor} border cursor-help`}
          >
            <span>{tierConfig.icon}</span>
            <span>{tierConfig.label}</span>
            {showDetails && (
              <span className="ml-1 text-xs opacity-70">
                ({accuracyRate.toFixed(0)}% accuracy)
              </span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-sm">
            <div className="font-semibold">{tierConfig.label} Tier</div>
            <div>Reputation Score: {reputation.reputation_score}/100</div>
            <div>Accuracy Rate: {accuracyRate.toFixed(1)}%</div>
            <div>Total Votes: {reputation.total_votes_cast}</div>
            <div>Correct Votes: {reputation.correct_votes}</div>
            <div className="text-xs text-muted-foreground mt-2">
              Vote weight: {tierConfig.voteWeight}x
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
