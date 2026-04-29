import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Home, Calendar, Music, Utensils, Camera, Type } from 'lucide-react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { ProgramSection } from './components/ProgramSection';
import { PerformanceSection } from './components/PerformanceSection';
import { FoodSection } from './components/FoodSection';
import { PhotoSpotSection } from './components/PhotoSpotSection';
import { LiveCaptionSection } from './components/LiveCaptionSection';
import { Button } from './components/ui/button';
import backgroundImage from 'figma:asset/13f988089d38b92c001bfaca8ad5aa738f67b0de.png';
import logoImage from 'figma:asset/d6311688f8df341298ed5279ad99899106fdaa5b.png';

type Section = 'home' | 'program' | 'performance' | 'food' | 'photospot' | 'livecaption';

export default function App() {
  const [currentSection, setCurrentSection] = useState<Section>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const sections = [
    { id: 'home', label: '홈', icon: Home },
    { id: 'program', label: '프로그램 안내', icon: Calendar },
    { id: 'performance', label: '공연안내', icon: Music },
    { id: 'food', label: '병과', icon: Utensils },
    { id: 'photospot', label: '포토 핫스팟', icon: Camera },
    { id: 'livecaption', label: '실시간 자막', icon: Type },
  ] as const;

  const renderSection = () => {
    switch (currentSection) {
      case 'program':
        return <ProgramSection />;
      case 'performance':
        return <PerformanceSection />;
      case 'food':
        return <FoodSection />;
      case 'photospot':
        return <PhotoSpotSection />;
      case 'livecaption':
        return <LiveCaptionSection />;
      default:
        return <HomeSection />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src={backgroundImage}
          alt="창경궁 궁중연회 배경"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        
        {/* 복잡한 배경 패턴으로 블러 효과 확인 */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
              linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 50px,
                rgba(255, 255, 255, 0.01) 51px,
                rgba(255, 255, 255, 0.01) 52px
              )
            `
          }}
        />
        
        {/* 한국 전통 문양 패턴 */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='15' cy='15' r='1'/%3E%3Ccircle cx='45' cy='15' r='1'/%3E%3Ccircle cx='15' cy='45' r='1'/%3E%3Ccircle cx='45' cy='45' r='1'/%3E%3C/g%3E%3C/svg%3E")
            `,
            backgroundSize: '30px 30px'
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4">
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center"
          >
            <img 
              src={logoImage}
              alt="2025 창경궁 야연 로고"
              className="h-8 drop-shadow-lg"
            />
          </motion.div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:bg-white/20"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </header>

      {/* Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed top-20 left-4 right-4 z-20"
          >
            <div className="glass-card rounded-2xl p-4 space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <motion.button
                    key={section.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setCurrentSection(section.id as Section);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      currentSection === section.id
                        ? 'bg-white/30 text-white'
                        : 'text-white/80 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{section.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 p-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-4 left-4 right-4 z-20">
        <div className="glass-card rounded-2xl p-2">
          <div className="grid grid-cols-6 gap-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const shortLabel = section.id === 'livecaption' ? '자막' : section.label.split(' ')[0];
              return (
                <motion.button
                  key={section.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentSection(section.id as Section)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    currentSection === section.id
                      ? 'text-white bg-white/20'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-xs">{shortLabel}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

function HomeSection() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 text-center"
      >
        <h2 className="text-white mb-4">창경궁 궁중연회에 오신 것을 환영합니다</h2>
        <p className="text-white/80 mb-6">
          조선왕조의 전통과 격식을 체험할 수 있는 특별한 문화행사에 참여하세요.
        </p>
        <div className="w-full h-48 rounded-xl overflow-hidden mb-4">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1587484789196-e1edf30f749a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMGhhbmJvayUyMGNvc3R1bWV8ZW58MXx8fHwxNzU4OTk5NjU3fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="한복 체험"
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-white mb-4">오늘의 주요 프로그램</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-white/90">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span>14:00 - 문무백관 및 외명부 체험</span>
          </div>
          <div className="flex items-center gap-3 text-white/90">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span>15:30 - 궁중병과 체험</span>
          </div>
          <div className="flex items-center gap-3 text-white/90">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span>16:30 - 궁중연회 및 공연관람</span>
          </div>
          <div className="flex items-center gap-3 text-white/90">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span>18:00 - 전문 사진작가 기념사진 촬영</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}