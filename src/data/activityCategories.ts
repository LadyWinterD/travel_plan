export const activityCategories = [
"interesting_places",          // 基础分类，包含多数景点
  "architecture",                // 建筑
  "historic",                    // 历史遗迹
  "historic_architecture",       // 历史建筑
  "museums",                     // 博物馆
  "cultural",                    // 文化
  "religion",                    // 宗教
  "churches",                    // 教堂
  "cathedrals",                  // 大教堂
  "castles",                     // 城堡
  "towers",                      // 塔
  "viewpoints",                  // 观景点
  "monuments_and_memorials",     // 纪念碑
  "natural",                     // 自然景观
  "gardens_and_parks",          // 公园和花园
  "urban_environment",           // 城市环境/广场
  "amusements",                  // 娱乐活动
  "sport"                        // 运动相关活动
] as const;

export type ActivityCategory = typeof activityCategories[number];