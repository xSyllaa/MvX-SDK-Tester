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
  const slidesRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Fonction pour stocker les références des slides sans causer d'erreur de type
  const setSlideRef = (index: number) => (el: HTMLDivElement | null) => {
    slidesRefs.current[index] = el;
  };
  
  const [isAnimating, setIsAnimating] = useState(false);
  
  // États simplifiés
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  // État de transition pour l'animation fluide
  const [transitionProgress, setTransitionProgress] = useState<{from: number, to: number, progress: number} | null>(null);
  
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

  // Animation fluide synchronisée pour le défilement et les transitions visuelles
  const smoothTransition = (fromIndex: number, toIndex: number, duration: number = 700) => {
    if (!slidesScrollRef.current || fromIndex === toIndex) return;
    
    setIsAnimating(true);
    
    const startTime = Date.now();
    const container = slidesScrollRef.current;
    const startScrollLeft = container.scrollLeft;
    
    // Calculer la position cible de défilement
    const targetSlide = slidesRefs.current[toIndex];
    if (!targetSlide) {
      setIsAnimating(false);
      return;
    }
    
    const slideCenter = targetSlide.offsetLeft + targetSlide.offsetWidth / 2;
    const containerCenter = container.offsetWidth / 2;
    const targetScrollLeft = slideCenter - containerCenter;
    const scrollDistance = targetScrollLeft - startScrollLeft;
    
    // Fonction d'animation qui met à jour à la fois le défilement et l'état de transition
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Fonction d'accélération pour une animation plus naturelle (cubic-bezier approximation)
      const ease = (t: number): number => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };
      
      const easedProgress = ease(progress);
      
      // Mettre à jour la position de défilement
      const newScrollLeft = startScrollLeft + scrollDistance * easedProgress;
      if (container) {
        container.scrollLeft = newScrollLeft;
      }
      
      // Mettre à jour l'état de transition pour les animations visuelles
      setTransitionProgress({
        from: fromIndex,
        to: toIndex,
        progress: easedProgress
      });
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation terminée
        setActiveIndex(toIndex);
        setTransitionProgress(null);
        setIsAnimating(false);
      }
    };
    
    // Démarrer l'animation
    requestAnimationFrame(animate);
  };
  
  // Fonctions de navigation avec animation synchronisée
  const goToSlide = (index: number) => {
    if (isAnimating) return; // Éviter les actions pendant l'animation
    
    // S'assurer que l'index est dans les limites
    const validIndex = Math.max(0, Math.min(index, pitchDeckSlides.length - 1));
    
    // Démarrer la transition animée entre l'index actuel et le nouvel index
    smoothTransition(activeIndex, validIndex);
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
      setTimeout(() => {
        const firstSlide = slidesRefs.current[0];
        if (firstSlide && slidesScrollRef.current) {
          const slideCenter = firstSlide.offsetLeft + firstSlide.offsetWidth / 2;
          const containerCenter = slidesScrollRef.current.offsetWidth / 2;
          slidesScrollRef.current.scrollLeft = slideCenter - containerCenter;
        }
      }, 200);
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
  
  // Synchroniser l'index actif avec la position de défilement lors du défilement manuel
  useEffect(() => {
    const handleScroll = () => {
      if (!slidesScrollRef.current || isAnimating || transitionProgress) return;
      
      const container = slidesScrollRef.current;
      const slidesElements = slidesRefs.current.filter(Boolean) as HTMLDivElement[];
      const containerCenter = container.getBoundingClientRect().left + container.offsetWidth / 2;
      
      // Trouver la slide la plus proche du centre
      let closestSlide = 0;
      let closestDistance = Infinity;
      
      slidesElements.forEach((slide, index) => {
        if (!slide) return;
        
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
  }, [activeIndex, isAnimating, transitionProgress]);
  
  // Fonction pour calculer les propriétés visuelles d'une slide pendant l'animation
  const calculateSlideStyles = (index: number) => {
    // Si nous ne sommes pas en transition, simplement appliquer les styles statiques
    if (!transitionProgress) {
      const isActive = index === activeIndex;
      return {
        opacity: isActive ? 1 : 0.6,
        transform: isActive ? 'scale(1.02)' : 'scale(0.95)',
        zIndex: isActive ? 10 : 0,
        boxShadow: isActive ? '0 10px 25px rgba(0, 0, 0, 0.1)' : 'none'
      };
    }
    
    const { from, to, progress } = transitionProgress;
    
    // Pour la slide de départ
    if (index === from) {
      return {
        opacity: 1 - (0.4 * progress), // 1 -> 0.6
        transform: `scale(${1.02 - (0.07 * progress)})`, // 1.02 -> 0.95
        zIndex: 10 - Math.floor(10 * progress), // 10 -> 0
        boxShadow: `0 ${10 - (10 * progress)}px ${25 - (25 * progress)}px rgba(0, 0, 0, ${0.1 - (0.1 * progress)})`
      };
    }
    
    // Pour la slide d'arrivée
    if (index === to) {
      return {
        opacity: 0.6 + (0.4 * progress), // 0.6 -> 1
        transform: `scale(${0.95 + (0.07 * progress)})`, // 0.95 -> 1.02
        zIndex: Math.floor(10 * progress), // 0 -> 10
        boxShadow: `0 ${10 * progress}px ${25 * progress}px rgba(0, 0, 0, ${0.1 * progress})`
      };
    }
    
    // Pour les autres slides, rester statiques
    const isActive = index === activeIndex;
    return {
      opacity: isActive ? 1 : 0.6,
      transform: isActive ? 'scale(1.02)' : 'scale(0.95)',
      zIndex: isActive ? 10 : 0,
      boxShadow: isActive ? '0 10px 25px rgba(0, 0, 0, 0.1)' : 'none'
    };
  };
  
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
            className="flex overflow-x-auto snap-none hide-scrollbar space-x-10 pb-10 px-2 items-center"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              minHeight: '650px',
              paddingLeft: '140px',
              paddingRight: '140px',
            }}
          >
            {pitchDeckSlides.map((slide, index) => {
              // Calculer les styles de transition dynamiques
              const slideStyles = calculateSlideStyles(index);
              const isActive = !transitionProgress && index === activeIndex;
              
              return (
                <div 
                  key={slide.id}
                  ref={setSlideRef(index)}
                  className={`flex-shrink-0 rounded-xl overflow-hidden border shadow-md group relative slide-item
                    w-full sm:w-[550px] md:w-[700px] lg:w-[900px] h-[400px] md:h-[520px]
                    ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  style={{
                    opacity: slideStyles.opacity,
                    transform: slideStyles.transform,
                    transition: isAnimating ? 'none' : 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                    boxShadow: slideStyles.boxShadow,
                    zIndex: slideStyles.zIndex
                  }}
                  onClick={() => {
                    if (isAnimating) return;
                    
                    // Si cette slide n'est pas active, d'abord la rendre active
                    if (!isActive) {
                      goToSlide(index);
                      
                      // Attendre la fin de l'animation de défilement avant d'ouvrir le plein écran
                      setTimeout(() => {
                        setIsFullscreenOpen(true);
                      }, 700);
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
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 550px, (max-width: 1024px) 700px, 900px"
                        unoptimized
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
            {pitchDeckSlides.map((_, index) => {
              // Calcul de l'indicateur actif avec transition fluide
              let indicatorWidth = !transitionProgress && index === activeIndex ? 32 : 10; // en pixels
              let indicatorBg = !transitionProgress && index === activeIndex 
                ? 'hsl(var(--primary))' 
                : 'hsl(var(--muted-foreground) / 0.3)';
              
              if (transitionProgress) {
                if (index === transitionProgress.from) {
                  // L'indicateur actuel qui devient inactif
                  indicatorWidth = 32 - (22 * transitionProgress.progress);
                  indicatorBg = `hsl(var(--primary) / ${1 - (0.7 * transitionProgress.progress)})`;
                } else if (index === transitionProgress.to) {
                  // L'indicateur qui devient actif
                  indicatorWidth = 10 + (22 * transitionProgress.progress);
                  indicatorBg = `hsl(var(--primary) / ${0.3 + (0.7 * transitionProgress.progress)})`;
                }
              }
              
              return (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2.5 rounded-full hover:bg-muted-foreground/50`}
                  style={{
                    width: `${indicatorWidth}px`,
                    backgroundColor: indicatorBg,
                    transition: isAnimating ? 'none' : 'all 0.3s ease-out'
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                  disabled={isAnimating}
                />
              );
            })}
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
                <div className="relative w-[94vw] h-[94vh]">
                  {pitchDeckSlides.map((slide, index) => (
                    <div 
                      key={slide.id}
                      className="absolute inset-0 transition-opacity duration-300 ease-in-out"
                      style={{
                        opacity: index === activeIndex ? 1 : 0,
                        visibility: index === activeIndex ? 'visible' : 'hidden',
                      }}
                    >
                      <Image
                        src={slide.image}
                        alt={slide.alt}
                        fill
                        style={{ objectFit: 'contain' }}
                        quality={90}
                        priority={index === activeIndex}
                        sizes="(max-width: 768px) 100vw, 94vw"
                        unoptimized
                      />
                    </div>
                  ))}
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
                
                {/* Indicateurs de pagination en mode plein écran */}
                <div className="absolute bottom-2 left-0 right-0">
                  <div className="flex justify-center items-center space-x-2">
                    {pitchDeckSlides.map((_, index) => {
                      // Calcul de l'indicateur actif avec transition fluide pour le mode plein écran
                      let dotWidth = !transitionProgress && index === activeIndex ? 24 : 8; // en pixels
                      let dotBg = !transitionProgress && index === activeIndex 
                        ? 'rgba(255, 255, 255, 1)' 
                        : 'rgba(255, 255, 255, 0.3)';
                      
                      if (transitionProgress) {
                        if (index === transitionProgress.from) {
                          dotWidth = 24 - (16 * transitionProgress.progress);
                          dotBg = `rgba(255, 255, 255, ${1 - (0.7 * transitionProgress.progress)})`;
                        } else if (index === transitionProgress.to) {
                          dotWidth = 8 + (16 * transitionProgress.progress);
                          dotBg = `rgba(255, 255, 255, ${0.3 + (0.7 * transitionProgress.progress)})`;
                        }
                      }
                      
                      return (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            goToSlide(index);
                          }}
                          className="h-2 rounded-full hover:bg-white/60"
                          style={{
                            width: `${dotWidth}px`,
                            backgroundColor: dotBg,
                            transition: isAnimating ? 'none' : 'all 0.3s ease-out'
                          }}
                          aria-label={`Go to slide ${index + 1}`}
                          disabled={isAnimating}
                        />
                      );
                    })}
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