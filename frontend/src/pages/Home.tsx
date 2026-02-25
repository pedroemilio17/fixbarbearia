import { useEffect, useState } from "react";
import { Service } from "../types";
import Header from "../components/Header";
import Hero from "../components/Hero";
import ServiceGrid from "../components/ServiceGrid";
import ServiceModal from "../components/ServiceModal";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import { getServices } from "../services/servicesApi";

export default function Home() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

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

    const timer = window.setTimeout(run, 100);
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

  const scrollToServices = () => {
    const servicesSection = document.getElementById("services");
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--surface))] transition-colors duration-300">
      <Header onCartClick={() => setIsCartOpen(true)} />

      <Hero onServicesClick={scrollToServices} />

      <section id="services" className="min-h-screen py-20 bg-[rgb(var(--surface))]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Nossos Serviços
            </h2>
            <p className="text-lg text-[rgb(var(--muted))] max-w-2xl mx-auto">
              Uma seleção completa de grooming profissional com foco em precisão.
            </p>
          </div>

          {loadingServices ? (
            <p className="text-center text-[rgb(var(--muted))]">
              Carregando serviços...
            </p>
          ) : servicesError ? (
            <p className="text-center text-red-600">{servicesError}</p>
          ) : (
            <ServiceGrid services={services} onServiceSelect={handleServiceSelect} />
          )}
        </div>
      </section>

      <section id="about" className="min-h-screen py-20 bg-[rgb(var(--surface-2))]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-gray-900 dark:text-gray-100 mb-8 text-center">
              Sobre a FIX
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg text-[rgb(var(--muted))] mb-6 leading-relaxed">
                  A FIX Barbearia é resultado de uma paixão genuína pela arte do
                  grooming clássico. Com mais de 15 anos de experiência, nossos
                  barbeiros dominam técnicas tradicionais e contemporâneas.
                </p>

                <p className="text-lg text-[rgb(var(--muted))] mb-6 leading-relaxed">
                  Cada cliente é tratado como um indivíduo, recebendo recomendações
                  personalizadas e um acabamento impecável. Utilizamos apenas produtos
                  de qualidade premium e ferramentas profissionais.
                </p>

                <p className="text-lg text-[rgb(var(--muted))] leading-relaxed">
                  Nossa missão é oferecer uma experiência de barbershop de classe
                  mundial, onde você se sente valorizado e sai com confiança.
                </p>
              </div>

              <div className="rounded-3xl overflow-hidden shadow-xl h-96">
                <img
                  src="https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Barbearia"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="min-h-screen py-20 bg-[rgb(var(--surface))]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Entre em Contato
            </h2>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-black/5 dark:divide-white/10 border-y border-black/5 dark:border-white/10">
            <div className="py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="text-lg text-gray-900 dark:text-gray-100">
                contato@fixbarbearia.com
              </p>
            </div>

            <div className="py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
                Telefone
              </p>
              <p className="text-lg text-gray-900 dark:text-gray-100">
                +55 (65) 9690-3121
              </p>
            </div>

            <div className="py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
                Localização
              </p>
              <p className="text-lg text-gray-900 dark:text-gray-100">
                Av. Paulista, 1000 — São Paulo, SP
              </p>
            </div>
          </div>
        </div>
      </section>

      <ServiceModal service={selectedService} isOpen={isModalOpen} onClose={handleCloseModal} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <Footer />
    </div>
  );
}
