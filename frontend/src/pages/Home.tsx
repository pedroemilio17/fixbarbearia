import { useEffect, useState } from "react";
import { Service } from "../types";
import Header from "../components/Header";
import Hero from "../components/Hero";
import ServiceGrid from "../components/ServiceGrid";
import ServiceModal from "../components/ServiceModal";
import Footer from "../components/Footer";
import { getServices } from "../services/servicesApi";
import { useNavigate } from "react-router-dom";


export default function Home() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header onCartClick={() => navigate("/agendar")} />

      <Hero onServicesClick={scrollToServices} />

      <section id="services" className="min-h-screen py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Nossos Serviços
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Uma gama completa de serviços de grooming profissional para você
            </p>
          </div>

          {loadingServices ? (
            <p className="text-center text-gray-600 dark:text-gray-400">
              Carregando serviços...
            </p>
          ) : servicesError ? (
            <p className="text-center text-red-600">{servicesError}</p>
          ) : (
            <ServiceGrid services={services} onServiceSelect={handleServiceSelect} />
          )}
        </div>
      </section>

      <section id="about" className="min-h-screen py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
              Sobre a FIX
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  A FIX Barbearia é resultado de uma paixão genuína pela arte do
                  grooming clássico. Com mais de 15 anos de experiência, nossos
                  barbeiros dominam técnicas tradicionais e contemporâneas.
                </p>

                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  Cada cliente é tratado como um indivíduo, recebendo recomendações
                  personalizadas e um acabamento impecável. Utilizamos apenas produtos
                  de qualidade premium e ferramentas profissionais.
                </p>

                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Nossa missão é oferecer uma experiência de barbershop de classe
                  mundial, onde você se sente valorizado e sai com confiança.
                </p>
              </div>

              <div className="rounded-lg overflow-hidden shadow-xl h-96">
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

      <section id="contact" className="min-h-screen py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Entre em Contato
            </h2>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Email
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                contato@fixbarbearia.com
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Telefone
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                +55 (65) 9690-3121
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Localização
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Av. Paulista, 1000
                <br />
                São Paulo, SP
              </p>
            </div>
          </div>
        </div>
      </section>

      <ServiceModal service={selectedService} isOpen={isModalOpen} onClose={handleCloseModal} />


      <Footer />
    </div>
  );
}
