const PROCESS_STEPS = [
  {
    emoji: '🏠',
    color: 'green',
    title: '1. 首页 - 项目介绍和个人统计',
    desc: '了解项目，查看个人成就',
  },
  {
    emoji: '🗂️',
    color: 'blue',
    title: '2. 垃圾分类 - 核心功能，选择类型获得NFT',
    desc: '上传图片，选择分类，AI识别验证',
  },
  {
    emoji: '🏆',
    color: 'yellow',
    title: '3. 我的收藏 - 展示获得的环保NFT',
    desc: '查看和管理你的NFT收藏',
  },
  {
    emoji: '📊',
    color: 'purple',
    title: '4. 排行榜 - 社区竞赛功能',
    desc: '与其他用户比较成绩',
  },
];

export default function ProcessSteps() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          🎮 核心体验流程
        </h2>

        <div className="space-y-8">
          {PROCESS_STEPS.map((step, index) => (
            <div
              key={index}
              className="flex items-center space-x-6 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div
                className={`text-2xl bg-${step.color}-100 p-3 rounded-full flex-shrink-0`}
              >
                {step.emoji}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}