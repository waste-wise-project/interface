'use client';

interface Stats {
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  totalCredits: number;
  nftCount: number;
}

interface StatsCardProps {
  stats: Stats;
}

export default function StatsCard({ stats }: StatsCardProps) {
  const statsData = [
    {
      label: '正确次数',
      value: stats.correctAttempts,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: '错误次数',
      value: stats.totalAttempts - stats.correctAttempts,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      label: '准确率',
      value: `${stats.accuracy}%`,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: '信誉分',
      value: stats.totalCredits,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'NFT总数',
      value: stats.nftCount,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
      {statsData.map((stat, index) => (
        <div key={index} className={`text-center p-6 ${stat.bgColor} rounded-xl hover:scale-105 transition-transform`}>
          <div className={`text-3xl font-bold ${stat.textColor} mb-2`}>
            {stat.value}
          </div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}