import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <AvatarPrimitive.Root
      ref={ref}
      data-slot="avatar"
      className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)}
      {...props} />
  );
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <AvatarPrimitive.Image
      ref={ref}
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props} />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props} />
  );
});
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback }
