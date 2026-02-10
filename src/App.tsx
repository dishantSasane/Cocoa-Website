import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HeroSection from './sections/HeroSection';
import MenuSection from './sections/MenuSection';
import ExperienceSection from './sections/ExperienceSection';
import AmenitiesSection from './sections/AmenitiesSection';
import TestimonialsSection from './sections/TestimonialsSection';
import LocationSection from './sections/LocationSection';
import ReservationSection from './sections/ReservationSection';

function App() {
  return (
    <div className="relative bg-cocoa-900 grain-overlay">
      <Navigation />
      
      <main className="relative">
        <HeroSection />
        <MenuSection />
        <ExperienceSection />
        <AmenitiesSection />
        <TestimonialsSection />
        <LocationSection />
        <ReservationSection />
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
