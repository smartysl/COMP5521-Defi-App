/**
 * 一个简单的工具函数用于有条件地连接类名
 */
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default cn; 