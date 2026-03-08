import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import GatePage from '@/components/GatePage';
import MainLayout from '@/components/MainLayout';
import LegacyPage from '@/components/LegacyPage';
import InventoryGrid from '@/components/InventoryGrid';
import ContactPage from '@/components/ContactPage';
import FolioPage from '@/components/FolioPage';
import FrontOfficePage from '@/components/FrontOfficePage';
import BackOfficePage from '@/components/BackOfficePage';

type Page = 'legacy' | 'suites' | 'dining' | 'events' | 'amenities' | 'contact' | 'folio' | 'frontoffice' | 'backoffice';

const Index = () => {
  const { user } = useAppStore();
  const [page, setPage] = useState<Page>('legacy');

  if (!user) return <GatePage />;

  const renderPage = () => {
    switch (page) {
      case 'legacy': return <LegacyPage />;
      case 'suites': return <InventoryGrid category="suite" title="Suites" subtitle="Experience sovereign luxury in our exclusive accommodations." />;
      case 'dining': return <InventoryGrid category="dining" title="Dining" subtitle="World-class gastronomy curated by master chefs." />;
      case 'events': return <InventoryGrid category="event" title="Events" subtitle="Unforgettable occasions in extraordinary settings." />;
      case 'amenities': return <InventoryGrid category="amenities" title="Amenities" subtitle="Indulge in our premium facilities and services." />;
      case 'contact': return <ContactPage />;
      case 'folio': return <FolioPage />;
      case 'frontoffice': return <FrontOfficePage />;
      case 'backoffice': return <BackOfficePage />;
      default: return <LegacyPage />;
    }
  };

  return (
    <MainLayout currentPage={page} onNavigate={setPage}>
      {renderPage()}
    </MainLayout>
  );
};

export default Index;
