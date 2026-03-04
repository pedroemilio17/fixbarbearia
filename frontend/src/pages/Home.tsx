import { useEffect, useState } from "react";
import type { Service } from "../types";
import { getServices } from "../services/servicesApi";

import { Navbar } from "../components/landing/Navbar";
import { HeroSection } from "../components/landing/HeroSection";
import { ServicesSection } from "../components/landing/ServicesSection";
import { PlansSection } from "../components/landing/PlansSection";
import { AboutSection } from "../components/landing/AboutSection";
import { ContactSection } from "../components/landing/ContactSection";
import { Footer } from "../components/landing/Footer";

import ServiceModal from "../components/ServiceModal";
import CartDrawer from "../components/CartDrawer";

/**
 * HOME (Landing)
 * - Visual: Velvet (typography, spacing, glass, sections).
 * - Logic: keeps FIX backend integration (services from API + modal + cart drawer).
 */
export default function Home() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // Load services from the real backend
  useEffect(() => {
    let alive = true;

    async function loadServices() {
      try {
        setLoadingServices(true);
        setServicesError(null);

        const data = await getServices();
        if (alive) setServices(data);
      } catch (err) {
        console.error("Erro ao carregar serviços:", err);
        if (alive) setServicesError("Não foi possível carregar os serviços.");
      } finally {
        if (alive) setLoadingServices(false);
      }
    }

    loadServices();
    return () => {
      alive = false;
    };
  }, []);

  // If user clicked a menu item in another route, we store the target and scroll after Home mounts.
  useEffect(() => {
    const target = sessionStorage.getItem("fix_scroll_target");
    if (!target) return;

    const run = () => {
      const element = document.getElementById(target);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        sessionStorage.removeItem("fix_scroll_target");
      }
    };

    const timer = window.setTimeout(run, 120);
    return () => window.clearTimeout(timer);
  }, []);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/40 text-foreground">
      <Navbar onCartClick={() => setIsCartOpen(true)} />

      {/* Landing sections */}
      <HeroSection />
      <ServicesSection
        services={services}
        loading={loadingServices}
        error={servicesError}
        onSelectService={handleServiceSelect}
      />
      <PlansSection />
      <AboutSection />
      <ContactSection />

      {/* FIX flows */}
      <ServiceModal service={selectedService} isOpen={isModalOpen} onClose={handleCloseModal} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <Footer />
    </div>
  );
}
