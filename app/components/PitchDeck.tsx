"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PitchDeckProps {
  className?: string;
}

export function PitchDeck({ className }: PitchDeckProps) {
  const slidesScrollRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // États simplifiés
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentScrollPosition, setCurrentScrollPosition] = useState(0);
  
  // Pitch deck slides data - reste inchangé
  const pitchDeckSlides = [
    { id: 1, image: "/images/pitch/slide1.jpg", alt: "Presentation" },
    { id: 2, image: "/images/pitch/slide2.jpg", alt: "Overview" },
    { id: 3, image: "/images/pitch/slide3.jpg", alt: "Key Features" },
    { id: 4, image: "/images/pitch/slide4.jpg", alt: "SDK and ABI Analyzer" },
    { id: 5, image: "/images/pitch/slide5.jpg", alt: "Custom Chatbot Context Powered" },
    { id: 6, image: "/images/pitch/slide6.jpg", alt: "Community Led Component Library" },
    { id: 7, image: "/images/pitch/slide7.jpg", alt: "Roadmap" },
    { id: 8, image: "/images/pitch/slide8.jpg", alt: "Try It Yourself" },
  ];

  // Animation fluide améliorée pour le défilement
  const smoothScrollTo = (targetPosition: number, duration: number = 600) => {
    if (!slidesScrollRef.current) return;
    
    setIsAnimating(true);
    const startPosition = slidesScrollRef.current.scrollLeft;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;
    
    // Fonction d'animation plus fluide et visuelle
    const step = (currentTime: number) => {
      if (!slidesScrollRef.current) return;
      
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      
      // easeInOutQuint pour une animation plus dynamique
      const easeInOutQuint = (t: number): number => {
        return t < 0.5 
          ? 16 * t * t * t * t * t 
          : 1 + 16 * (--t) * t * t * t * t;
      };
      
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutQuint(progress);
      const newPosition = startPosition + distance * easedProgress;
      
      slidesScrollRef.current.scrollLeft = newPosition;
      setCurrentScrollPosition(newPosition);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setIsAnimating(false);
      }
    };
    
    window.requestAnimationFrame(step);
  };
  
  // Fonctions de navigation avec animation améliorée
  const goToSlide = (index: number) => {
    if (isAnimating) return; // Éviter les actions pendant l'animation
    
    // S'assurer que l'index est dans les limites
    const validIndex = Math.max(0, Math.min(index, pitchDeckSlides.length - 1));
    setActiveIndex(validIndex);
    
    if (slidesScrollRef.current) {
      const slideElements = Array.from(slidesScrollRef.current.querySelectorAll('.slide-item'));
      if (slideElements[validIndex]) {
        const slide = slideElements[validIndex] as HTMLElement;
        const container = slidesScrollRef.current;
        
        // Calculer précisément le centre de la slide dans le conteneur
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const containerCenter = container.offsetWidth / 2;
        const targetScrollLeft = slideCenter - containerCenter;
        
        // Animation fluide vers la position cible
        smoothScrollTo(targetScrollLeft);
      }
    }
  };
  
  const goToNext = () => {
    if (isAnimating) return;
    const nextIndex = (activeIndex + 1) % pitchDeckSlides.length;
    goToSlide(nextIndex);
  };
  
  const goToPrevious = () => {
    if (isAnimating) return;
    const prevIndex = (activeIndex - 1 + pitchDeckSlides.length) % pitchDeckSlides.length;
    goToSlide(prevIndex);
  };
  
  // Initialiser la position lorsque le composant est monté
  useEffect(() => {
    if (slidesScrollRef.current) {
      // Centrer la première slide après le montage
      setTimeout(() => goToSlide(0), 200);
    }
  }, []);
  
  // Gérer les touches du clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenOpen) {
        setIsFullscreenOpen(false);
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreenOpen, activeIndex, isAnimating]);
  
  // Synchroniser l'index actif avec la position de défilement
  useEffect(() => {
    const handleScroll = () => {
      if (!slidesScrollRef.current || isAnimating) return;
      
      const container = slidesScrollRef.current;
      const slides = Array.from(container.querySelectorAll('.slide-item'));
      const containerCenter = container.getBoundingClientRect().left + container.offsetWidth / 2;
      
      // Trouver la slide la plus proche du centre
      let closestSlide = 0;
      let closestDistance = Infinity;
      
      slides.forEach((slide, index) => {
        const slideRect = slide.getBoundingClientRect();
        const slideCenter = slideRect.left + slideRect.width / 2;
        const distance = Math.abs(slideCenter - containerCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestSlide = index;
        }
      });
      
      // Mettre à jour l'index actif si nécessaire
      if (closestSlide !== activeIndex) {
        setActiveIndex(closestSlide);
      }
    };
    
    const container = slidesScrollRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [activeIndex, isAnimating]);
  
  return (
    <div className={`w-full py-12 md:py-24 lg:py-32 ${className}`}>
      <div className="container-fluid px-4 md:px-8 lg:px-12 xl:px-16 max-w-[2000px] mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Our Pitch Deck</h2>
          <p className="mx-auto max-w-[800px] text-muted-foreground md:text-xl/relaxed">
            This is the presentation we used during the MultiversX AI Hackathon Demo Day that won us first place. Click on a slide to view in fullscreen mode.
          </p>
        </div>

        <div className="relative">
          {/* Boutons de navigation */}
          <div className="absolute left-4 top-1/2 z-20 transform -translate-y-1/2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
              onClick={goToPrevious}
              disabled={isAnimating}
            >
              <ChevronLeft className="h-7 w-7" />
            </Button>
          </div>

          <div className="absolute right-4 top-1/2 z-20 transform -translate-y-1/2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
              onClick={goToNext}
              disabled={isAnimating}
            >
              <ChevronRight className="h-7 w-7" />
            </Button>
          </div>
          
          {/* Effet de fondu à gauche et à droite */}
          <div className="absolute inset-y-0 left-0 w-[120px] z-10 pointer-events-none bg-gradient-to-r from-background via-background/90 to-transparent"></div>
          <div className="absolute inset-y-0 right-0 w-[120px] z-10 pointer-events-none bg-gradient-to-l from-background via-background/90 to-transparent"></div>

          {/* Conteneur de slides avec défilement horizontal */}
          <div 
            ref={slidesScrollRef}
            className="flex overflow-x-auto snap-x hide-scrollbar space-x-10 pb-10 px-2 items-center"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              minHeight: '650px',
              paddingLeft: '140px',
              paddingRight: '140px',
              scrollBehavior: isAnimating ? 'auto' : 'smooth'
            }}
          >
            {pitchDeckSlides.map((slide, index) => {
              // Opacité et transformation basées sur l'index actif
              const isActive = index === activeIndex;
              
              return (
                <div 
                  key={slide.id} 
                  className={`flex-shrink-0 snap-center rounded-xl overflow-hidden border shadow-md group relative slide-item
                    w-full sm:w-[550px] md:w-[700px] lg:w-[900px] h-[400px] md:h-[520px]
                    ${isActive ? 'ring-2 ring-primary ring-offset-2 z-10' : ''}`}
                  style={{
                    opacity: isActive ? 1 : 0.6,
                    transform: isActive ? 'scale(1.02)' : 'scale(0.95)',
                    transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                    boxShadow: isActive ? '0 10px 25px rgba(0, 0, 0, 0.1)' : 'none'
                  }}
                  onClick={() => {
                    if (isAnimating) return;
                    
                    // Si cette slide n'est pas active, d'abord la rendre active
                    if (!isActive) {
                      goToSlide(index);
                      
                      // Attendre la fin de l'animation de défilement avant d'ouvrir le plein écran
                      setTimeout(() => {
                        setIsFullscreenOpen(true);
                      }, 600);
                    } else {
                      // Si la slide est déjà active, simplement ouvrir le plein écran
                      setIsFullscreenOpen(true);
                    }
                  }}
                >
                  <div className="w-full h-full relative bg-card cursor-pointer flex flex-col justify-between overflow-hidden">
                    <div className="relative flex-grow flex items-center justify-center w-full">
                      <Image
                        src={slide.image}
                        alt={slide.alt}
                        fill
                        style={{ objectFit: 'contain' }}
                        className="rounded-t-xl"
                        priority={index < 3} // Charger en priorité les premières images
                        onError={(e) => {
                          // Fallback en cas d'erreur de chargement d'image
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.className = 'absolute inset-0 flex items-center justify-center flex-col p-6 text-center';
                            fallback.innerHTML = `<p class="text-xl font-semibold mb-2">${slide.alt}</p><p class="text-sm text-muted-foreground">Slide ${index + 1}</p>`;
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    </div>
                    
                    {/* Indicator for fullscreen viewing */}
                    <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                        <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                        <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                        <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Titre de la slide en dessous */}
                  <div className="mt-2 p-3 text-base text-center font-medium">
                    {slide.alt}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Indicateur de pagination */}
          <div className="flex justify-center items-center mt-6 space-x-2">
            {pitchDeckSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === activeIndex 
                    ? 'bg-primary w-8' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                disabled={isAnimating}
              />
            ))}
          </div>
        </div>

        {/* Fullscreen Modal */}
        {isFullscreenOpen && (
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center" onClick={() => setIsFullscreenOpen(false)}>
              <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                {/* Navigation précédent */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute left-5 top-1/2 z-10 transform -translate-y-1/2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                >
                  <ChevronLeft className="h-9 w-9 text-white" />
                </Button>

                {/* Image plein écran avec transition */}
                <div className="relative w-[94vw] h-[94vh] transition-opacity duration-300">
                  <Image
                    src={pitchDeckSlides[activeIndex].image}
                    alt={pitchDeckSlides[activeIndex].alt}
                    fill
                    style={{ objectFit: 'contain' }}
                    quality={90}
                    priority
                    className="transition-opacity duration-300"
                  />
                </div>

                {/* Navigation suivant */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-5 top-1/2 z-10 transform -translate-y-1/2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                >
                  <ChevronRight className="h-9 w-9 text-white" />
                </Button>

                {/* Bouton fermer */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-4 z-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
                  onClick={() => setIsFullscreenOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </Button>

                {/* Légende */}
                <div className="absolute bottom-8 left-0 right-0 text-center text-white">
                  <p className="text-xl font-semibold mb-1">{pitchDeckSlides[activeIndex].alt}</p>
                  <p className="text-sm text-white/70">Slide {activeIndex + 1} of {pitchDeckSlides.length}</p>
                </div>
                
                {/* Indicateurs de pagination */}
                <div className="absolute bottom-2 left-0 right-0">
                  <div className="flex justify-center items-center space-x-2">
                    {pitchDeckSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          goToSlide(index);
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === activeIndex 
                            ? 'bg-white w-6' 
                            : 'bg-white/30 hover:bg-white/60'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 