import { useState } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description, variant = "default", className = "" }) => {
    // 在实际应用中，这里会显示一个真实的toast通知
    // 为了简化，我们只在控制台输出消息
    console.log(`Toast: ${title} - ${description}`);
    
    // 返回一个简单的方法来跟踪toast
    return {
      id: Date.now(),
      title,
      description,
      variant,
      className
    };
  };

  return { toast };
} 