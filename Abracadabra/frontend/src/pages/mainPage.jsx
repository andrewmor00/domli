import Header from '../components/Header';
import CarouselBlock from '../components/CarouselBlock';
import HeroSection from '../components/HeroSection';
import Recommendations from '../components/Recommendations';
import MapSection from '../components/MapSection';
import AssociationMembers from '../components/AssociationMembers';
import Footer from '../components/Footer';

function MainPage() {
  return (
    <div className="font-sans bg-[#f8fbff] min-h-screen">
      <Header />
      <HeroSection />
      <Recommendations />
      <CarouselBlock />
      <MapSection />
      <AssociationMembers />
      <Footer />
    </div>
  );
}

export default MainPage; 