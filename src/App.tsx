import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { AdvantagesSection } from './components/AdvantagesSection';
import { SubjectsSection } from './components/SubjectsSection';
import { TariffsSection } from './components/TariffsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { PaymentModal } from './components/PaymentModal';
import { DiagnosticTestView } from './components/DiagnosticTestView';
import { DiagnosticResultView } from './components/DiagnosticResultView';
import { TrainingTopicMode } from './components/TrainingTopicMode';
import { PracticeExamView } from './components/PracticeExamView';
import { StudentCabinet } from './components/StudentCabinet';
import { ParentCabinet } from './components/ParentCabinet';
import { AdminPanel } from './components/AdminPanel';
import { LegalPages } from './components/LegalPages';
import { MyErrorsView } from './components/MyErrorsView';

const MainContent: React.FC = () => {
  const { currentView } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar is displayed across views, except practice mock in focus mode */}
      {currentView !== 'practice-mock' && <Navbar />}

      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <HeroSection />
            <HowItWorksSection />
            <AdvantagesSection />
            <SubjectsSection />
            <TariffsSection />
            <TestimonialsSection />
            <FaqSection />
          </>
        )}

        {currentView === 'diagnostic' && <DiagnosticTestView />}

        {currentView === 'diagnostic-result' && <DiagnosticResultView />}

        {currentView === 'training-topic' && <TrainingTopicMode />}

        {currentView === 'practice-mock' && <PracticeExamView />}

        {currentView === 'my-errors' && <MyErrorsView />}

        {currentView === 'student-cabinet' && <StudentCabinet />}

        {currentView === 'parent-cabinet' && <ParentCabinet />}

        {currentView === 'admin-panel' && <AdminPanel />}

        {currentView === 'tariffs' && (
          <div className="py-6">
            <TariffsSection />
            <FaqSection />
          </div>
        )}

        {['privacy', 'terms', 'payment-rules', 'about'].includes(currentView) && (
          <LegalPages pageType={currentView as 'privacy' | 'terms' | 'payment-rules' | 'about'} />
        )}
      </main>

      {/* Footer is displayed across views except during exam */}
      {currentView !== 'practice-mock' && <Footer />}

      {/* Global Modals */}
      <AuthModal />
      <PaymentModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
