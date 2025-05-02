import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  avatars: {
    image?: string
    name: string
  }[]
  max?: number
}

export function AvatarGroup({
  avatars,
  max = 4,
  className,
  ...props
}: AvatarGroupProps) {
  const totalAvatars = avatars.length
  const displayAvatars = avatars.slice(0, max)
  const remainingAvatars = totalAvatars - max

  return (
    <div className={cn("flex -space-x-2", className)} {...props}>
      {displayAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          className="border-2 border-background"
        >
          <AvatarImage src={avatar.image} alt={avatar.name} />
          <AvatarFallback>
            {avatar.name.split(" ").map(name => name[0]).join("")}
          </AvatarFallback>
        </Avatar>
      ))}
      {remainingAvatars > 0 && (
        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
          +{remainingAvatars}
        </div>
      )}
    </div>
  )
}
