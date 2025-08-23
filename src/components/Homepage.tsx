import HeroSection from '@/components/homepage/HeroSection';
import ProcessSteps from '@/components/homepage/ProcessSteps';
import UserStatsSection from '@/components/homepage/UserStatsSection';

export default function Homepage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <HeroSection />
      <ProcessSteps />
      <UserStatsSection />
    </div>
  );
}