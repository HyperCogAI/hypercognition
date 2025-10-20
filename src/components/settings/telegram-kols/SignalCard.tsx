// Phase 3.1: Reusable signal card component
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Bookmark, Eye, Trash2, ExternalLink, Image, Video, Forward } from "lucide-react";

interface SignalCardProps {
  signal: any;
  onUpdateStatus: (data: { signalId: string; status: string }) => void;
  onToggleBookmark: (data: { signalId: string; bookmarked: boolean }) => void;
}

export function SignalCard({ signal, onUpdateStatus, onToggleBookmark }: SignalCardProps) {
  const getGemTypeConfig = (type: string) => {
    const configs: Record<string, { emoji: string; color: string }> = {
      token: { emoji: "💎", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      nft: { emoji: "🎨", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
      protocol: { emoji: "⚡", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
      airdrop: { emoji: "🎁", color: "bg-green-500/10 text-green-500 border-green-500/20" },
      alpha: { emoji: "🔥", color: "bg-red-500/10 text-red-500 border-red-500/20" },
    };
    return configs[type] || { emoji: "💬", color: "" };
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "bg-success/10 text-success border-success/20";
    if (score >= 60) return "bg-warning/10 text-warning border-warning/20";
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <MessageCircle className="w-10 h-10 text-muted-foreground" />
              <div>
                <h3 className="font-semibold">{signal.telegram_kol_channels?.channel_title}</h3>
                <p className="text-sm text-muted-foreground">
                  @{signal.telegram_kol_channels?.channel_username} • {new Date(signal.posted_at).toLocaleString()}
                </p>
              </div>
            </div>
            <Badge className={getConfidenceColor(signal.confidence_score)}>
              {signal.confidence_score}% confidence
            </Badge>
          </div>

          {/* Forward indicator */}
          {signal.forward_from_chat_title && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
              <Forward className="w-4 h-4" />
              Forwarded from {signal.forward_from_chat_title}
            </div>
          )}

          {/* Message */}
          <p className="text-sm">{signal.message_text}</p>

          {/* Media indicators */}
          {(signal.has_photo || signal.has_video || signal.has_document) && (
            <div className="flex gap-2">
              {signal.has_photo && <Image className="w-4 h-4 text-muted-foreground" />}
              {signal.has_video && <Video className="w-4 h-4 text-muted-foreground" />}
            </div>
          )}

          {/* AI Analysis */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm font-medium mb-1">AI Analysis:</p>
            <p className="text-sm text-muted-foreground">{signal.ai_reasoning}</p>
          </div>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap">
            {signal.gem_type && (
              <Badge className={getGemTypeConfig(signal.gem_type).color}>
                {getGemTypeConfig(signal.gem_type).emoji} {signal.gem_type}
              </Badge>
            )}
            {signal.extracted_data?.extracted_tokens?.map((token: any, idx: number) => (
              <Badge key={idx} variant="outline">
                ${token.ticker}
              </Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <a href={signal.message_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Telegram
              </a>
            </Button>
            <Button
              size="sm"
              variant={signal.bookmarked ? "default" : "ghost"}
              onClick={() => onToggleBookmark({ signalId: signal.id, bookmarked: !signal.bookmarked })}
            >
              <Bookmark className="w-4 h-4 mr-2" />
              {signal.bookmarked ? "Bookmarked" : "Bookmark"}
            </Button>
            {signal.status === 'new' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onUpdateStatus({ signalId: signal.id, status: 'reviewed' })}
              >
                <Eye className="w-4 h-4 mr-2" />
                Mark Read
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onUpdateStatus({ signalId: signal.id, status: 'dismissed' })}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Dismiss
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
