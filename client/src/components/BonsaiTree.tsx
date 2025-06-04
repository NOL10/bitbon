import React, { useEffect, useState } from 'react';
import { GrowthState } from "@/lib/types";

export interface BonsaiTreeProps {
  growthState: GrowthState;
  percentChange: number;
}

export const BonsaiTree: React.FC<BonsaiTreeProps> = ({ growthState, percentChange }) => {
  const [currentState, setCurrentState] = useState<GrowthState>(growthState);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    if (currentState !== growthState) {
      setIsTransitioning(true);
      setIsGlowing(true);
      const timer = setTimeout(() => {
        setCurrentState(growthState);
        setIsTransitioning(false);
      }, 500); // 500ms transition
      const glowTimer = setTimeout(() => {
        setIsGlowing(false);
      }, 1000); // 1s glow effect
      return () => {
        clearTimeout(timer);
        clearTimeout(glowTimer);
      };
    }
  }, [growthState]);

  // Render the appropriate bonsai based on growth state
  const renderBonsai = () => {
    const transitionClass = isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100';
    const glowClass = isGlowing ? 'filter drop-shadow-[0_0_15px_#22ff33]' : '';
    
    switch (currentState) {
      case "ath":
        return (
          <div className="relative flex flex-col items-center">
            <div className={`w-64 h-64 relative flex items-center justify-center ${glowClass}`}>
              {/* All time high tree - with fruits */}
              <svg width="140" height="140" viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
                {/* Pot base */}
                <rect x="30" y="90" width="40" height="15" fill="#1f5d1f" />
                {/* Pot top - wider than base */}
                <rect x="25" y="80" width="50" height="10" fill="#1f5d1f" />
                {/* Bitcoin logo */}
                <g fill="#856617">
                  <rect x="47" y="87" width="2" height="15" />
                  <rect x="42" y="92" width="12" height="2" />
                  <rect x="42" y="87" width="12" height="2" />
                  <rect x="42" y="97" width="12" height="2" />
                  <rect x="52" y="87" width="2" height="12" />
                </g>
                
                {/* ATH Bonsai Stem - tallest */}
                <rect x="49" y="30" width="2" height="50" fill="#2e8c2e" />
                
                {/* Branch left bottom */}
                <rect x="30" y="60" width="19" height="2" fill="#2e8c2e" />
                <rect x="30" y="60" width="2" height="10" fill="#2e8c2e" />
                
                {/* Branch right bottom */}
                <rect x="51" y="55" width="19" height="2" fill="#2e8c2e" />
                <rect x="68" y="55" width="2" height="10" fill="#2e8c2e" />
                
                {/* Branch left middle */}
                <rect x="35" y="45" width="14" height="2" fill="#2e8c2e" />
                <rect x="35" y="45" width="2" height="8" fill="#2e8c2e" />
                
                {/* Branch right middle */}
                <rect x="51" y="40" width="14" height="2" fill="#2e8c2e" />
                <rect x="63" y="40" width="2" height="8" fill="#2e8c2e" />
                
                {/* Large leaves */}
                <circle cx="50" cy="20" r="12" fill="#2e8c2e" />
                <circle cx="30" cy="55" r="8" fill="#2e8c2e" />
                <circle cx="70" cy="50" r="8" fill="#2e8c2e" />
                <circle cx="35" cy="40" r="7" fill="#2e8c2e" />
                <circle cx="65" cy="35" r="7" fill="#2e8c2e" />
                <circle cx="40" cy="25" r="6" fill="#2e8c2e" />
                <circle cx="60" cy="25" r="6" fill="#2e8c2e" />
                
                {/* Fruits (orange circles) with enhanced animations */}
                <circle cx="30" cy="50" r="4" fill="#ffa500">
                  <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="r" values="4;4.5;4" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="65" cy="30" r="4" fill="#ffa500">
                  <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="r" values="4;4.5;4" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="40" cy="20" r="4" fill="#ffa500">
                  <animate attributeName="opacity" values="0.7;1;0.7" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="r" values="4;4.5;4" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="70" cy="45" r="4" fill="#ffa500">
                  <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="r" values="4;4.5;4" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="58" cy="18" r="4" fill="#ffa500">
                  <animate attributeName="opacity" values="0.7;1;0.7" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="r" values="4;4.5;4" dur="2.4s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
            <div className={`text-[18px] text-[#22ff33] font-['VT323'] mt-2 transition-all duration-500 ${isGlowing ? 'scale-110 text-shadow-glow' : 'scale-100'}`}>
              ALL TIME HIGH
            </div>
          </div>
        );
      
      case "atl":
        return (
          <div className="relative flex flex-col items-center">
            <div className={`w-64 h-32 relative flex items-center justify-center ${glowClass}`}>
              {/* All time low - cracked pot */}
              <svg width="140" height="70" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
                {/* Cracked pot */}
                <g>
                  {/* Pot base - with crack */}
                  <path d="M30,30 L45,30 L45,45 L30,45 Z" fill="#1f5d1f" />
                  <path d="M55,30 L70,30 L70,45 L55,45 Z" fill="#1f5d1f" />
                  
                  {/* Crack in middle */}
                  <path d="M45,30 L47,35 L50,30 L53,35 L55,30 L55,45 L45,45 Z" fill="#051405" />
                  
                  {/* Pot rim - with crack */}
                  <path d="M25,20 L45,20 L45,30 L25,30 Z" fill="#1f5d1f" />
                  <path d="M55,20 L75,20 L75,30 L55,30 Z" fill="#1f5d1f" />
                  
                  {/* Crack in rim */}
                  <path d="M45,20 L47,25 L50,20 L53,25 L55,20 L55,30 L45,30 Z" fill="#051405" />
                </g>
                
                {/* Bitcoin logo */}
                <g fill="#856617">
                  <rect x="47" y="27" width="2" height="15" />
                  <rect x="42" y="32" width="12" height="2" />
                  <rect x="42" y="27" width="12" height="2" />
                  <rect x="42" y="37" width="12" height="2" />
                  <rect x="52" y="27" width="2" height="12" />
                </g>
              </svg>
            </div>
            <div className={`text-[18px] text-[#a82e2e] font-['VT323'] mt-2 transition-all duration-500 ${isGlowing ? 'scale-110 text-shadow-glow-red' : 'scale-100'}`}>
              ALL TIME LOW
            </div>
          </div>
        );
        
      case "positive-10":
        return (
          <div className="relative flex flex-col items-center">
            <div className={`w-64 h-48 relative flex items-center justify-center ${glowClass}`}>
              {/* 10% positive growth */}
              <svg width="140" height="100" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
                {/* Pot base */}
                <rect x="30" y="60" width="40" height="15" fill="#1f5d1f" />
                {/* Pot top - wider than base */}
                <rect x="25" y="50" width="50" height="10" fill="#1f5d1f" />
                {/* Bitcoin logo */}
                <g fill="#856617">
                  <rect x="47" y="57" width="2" height="15" />
                  <rect x="42" y="62" width="12" height="2" />
                  <rect x="42" y="57" width="12" height="2" />
                  <rect x="42" y="67" width="12" height="2" />
                  <rect x="52" y="57" width="2" height="12" />
                </g>
                
                {/* 10% Bonsai Stem */}
                <rect x="49" y="25" width="2" height="25" fill="#2e8c2e" />
                
                {/* Small leaves with animation */}
                <circle cx="50" cy="20" r="7" fill="#2e8c2e">
                  <animate attributeName="r" values="7;7.5;7" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="45" cy="22" r="5" fill="#2e8c2e">
                  <animate attributeName="r" values="5;5.5;5" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="55" cy="22" r="5" fill="#2e8c2e">
                  <animate attributeName="r" values="5;5.5;5" dur="2.2s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          </div>
        );
      
      case "positive-20":
        return (
          <div className="relative flex flex-col items-center">
            <div className={`w-64 h-56 relative flex items-center justify-center ${glowClass}`}>
              {/* 20% positive growth */}
              <svg width="140" height="120" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                {/* Pot base */}
                <rect x="30" y="80" width="40" height="15" fill="#1f5d1f" />
                {/* Pot top - wider than base */}
                <rect x="25" y="70" width="50" height="10" fill="#1f5d1f" />
                {/* Bitcoin logo */}
                <g fill="#856617">
                  <rect x="47" y="77" width="2" height="15" />
                  <rect x="42" y="82" width="12" height="2" />
                  <rect x="42" y="77" width="12" height="2" />
                  <rect x="42" y="87" width="12" height="2" />
                  <rect x="52" y="77" width="2" height="12" />
                </g>
                
                {/* 20% Bonsai Stem - taller */}
                <rect x="49" y="35" width="2" height="35" fill="#2e8c2e" />
                
                {/* Branch left */}
                <rect x="35" y="50" width="14" height="2" fill="#2e8c2e" />
                <rect x="35" y="50" width="2" height="8" fill="#2e8c2e" />
                
                {/* Branch right */}
                <rect x="51" y="45" width="14" height="2" fill="#2e8c2e" />
                <rect x="63" y="45" width="2" height="8" fill="#2e8c2e" />
                
                {/* Medium leaves with animation */}
                <circle cx="50" cy="25" r="10" fill="#2e8c2e">
                  <animate attributeName="r" values="10;10.5;10" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="35" cy="45" r="7" fill="#2e8c2e">
                  <animate attributeName="r" values="7;7.5;7" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="65" cy="40" r="7" fill="#2e8c2e">
                  <animate attributeName="r" values="7;7.5;7" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="40" cy="30" r="6" fill="#2e8c2e">
                  <animate attributeName="r" values="6;6.5;6" dur="1.9s" repeatCount="indefinite" />
                </circle>
                <circle cx="60" cy="30" r="6" fill="#2e8c2e">
                  <animate attributeName="r" values="6;6.5;6" dur="2.1s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          </div>
        );
      
      case "positive-30":
        return (
          <div className="relative flex flex-col items-center">
            <div className={`w-64 h-64 relative flex items-center justify-center ${glowClass}`}>
              {/* 30% positive growth */}
              <svg width="140" height="140" viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
                {/* Pot base */}
                <rect x="30" y="90" width="40" height="15" fill="#1f5d1f" />
                {/* Pot top - wider than base */}
                <rect x="25" y="80" width="50" height="10" fill="#1f5d1f" />
                {/* Bitcoin logo */}
                <g fill="#856617">
                  <rect x="47" y="87" width="2" height="15" />
                  <rect x="42" y="92" width="12" height="2" />
                  <rect x="42" y="87" width="12" height="2" />
                  <rect x="42" y="97" width="12" height="2" />
                  <rect x="52" y="87" width="2" height="12" />
                </g>
                
                {/* 30% Bonsai Stem - tallest */}
                <rect x="49" y="30" width="2" height="50" fill="#2e8c2e" />
                
                {/* Branch left bottom */}
                <rect x="30" y="60" width="19" height="2" fill="#2e8c2e" />
                <rect x="30" y="60" width="2" height="10" fill="#2e8c2e" />
                
                {/* Branch right bottom */}
                <rect x="51" y="55" width="19" height="2" fill="#2e8c2e" />
                <rect x="68" y="55" width="2" height="10" fill="#2e8c2e" />
                
                {/* Branch left middle */}
                <rect x="35" y="45" width="14" height="2" fill="#2e8c2e" />
                <rect x="35" y="45" width="2" height="8" fill="#2e8c2e" />
                
                {/* Branch right middle */}
                <rect x="51" y="40" width="14" height="2" fill="#2e8c2e" />
                <rect x="63" y="40" width="2" height="8" fill="#2e8c2e" />
                
                {/* Large leaves with animation */}
                <circle cx="50" cy="20" r="12" fill="#2e8c2e">
                  <animate attributeName="r" values="12;12.5;12" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="30" cy="55" r="8" fill="#2e8c2e">
                  <animate attributeName="r" values="8;8.5;8" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="70" cy="50" r="8" fill="#2e8c2e">
                  <animate attributeName="r" values="8;8.5;8" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="35" cy="40" r="7" fill="#2e8c2e">
                  <animate attributeName="r" values="7;7.5;7" dur="1.9s" repeatCount="indefinite" />
                </circle>
                <circle cx="65" cy="35" r="7" fill="#2e8c2e">
                  <animate attributeName="r" values="7;7.5;7" dur="2.1s" repeatCount="indefinite" />
                </circle>
                <circle cx="40" cy="25" r="6" fill="#2e8c2e">
                  <animate attributeName="r" values="6;6.5;6" dur="1.7s" repeatCount="indefinite" />
                </circle>
                <circle cx="60" cy="25" r="6" fill="#2e8c2e">
                  <animate attributeName="r" values="6;6.5;6" dur="2.3s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          </div>
        );
        
      case "negative-10":
        return (
          <div className="relative flex flex-col items-center">
            <div className={`w-64 h-48 relative flex items-center justify-center ${glowClass}`}>
              {/* 10% negative growth */}
              <svg width="140" height="100" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
                {/* Pot base */}
                <rect x="30" y="60" width="40" height="15" fill="#501010" />
                {/* Pot top - wider than base */}
                <rect x="25" y="50" width="50" height="10" fill="#501010" />
                {/* Bitcoin logo */}
                <g fill="#856617">
                  <rect x="47" y="57" width="2" height="15" />
                  <rect x="42" y="62" width="12" height="2" />
                  <rect x="42" y="57" width="12" height="2" />
                  <rect x="42" y="67" width="12" height="2" />
                  <rect x="52" y="57" width="2" height="12" />
                </g>
                
                {/* 10% Negative Bonsai Stem */}
                <rect x="49" y="25" width="2" height="25" fill="#a82e2e" />
                
                {/* Small red leaves with animation */}
                <circle cx="50" cy="20" r="7" fill="#a82e2e">
                  <animate attributeName="r" values="7;7.5;7" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="45" cy="22" r="5" fill="#a82e2e">
                  <animate attributeName="r" values="5;5.5;5" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="55" cy="22" r="5" fill="#a82e2e">
                  <animate attributeName="r" values="5;5.5;5" dur="2.2s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          </div>
        );
        
      case "negative-20":
        return (
          <div className="relative flex flex-col items-center">
            <div className={`w-64 h-56 relative flex items-center justify-center ${glowClass}`}>
              {/* 20% negative growth */}
              <svg width="140" height="120" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                {/* Pot base */}
                <rect x="30" y="80" width="40" height="15" fill="#501010" />
                {/* Pot top - wider than base */}
                <rect x="25" y="70" width="50" height="10" fill="#501010" />
                {/* Bitcoin logo */}
                <g fill="#856617">
                  <rect x="47" y="77" width="2" height="15" />
                  <rect x="42" y="82" width="12" height="2" />
                  <rect x="42" y="77" width="12" height="2" />
                  <rect x="42" y="87" width="12" height="2" />
                  <rect x="52" y="77" width="2" height="12" />
                </g>
                
                {/* 20% Negative Bonsai Stem - taller */}
                <rect x="49" y="35" width="2" height="35" fill="#a82e2e" />
                
                {/* Branch left */}
                <rect x="35" y="50" width="14" height="2" fill="#a82e2e" />
                <rect x="35" y="50" width="2" height="8" fill="#a82e2e" />
                
                {/* Branch right */}
                <rect x="51" y="45" width="14" height="2" fill="#a82e2e" />
                <rect x="63" y="45" width="2" height="8" fill="#a82e2e" />
                
                {/* Medium red leaves with animation */}
                <circle cx="50" cy="25" r="10" fill="#a82e2e">
                  <animate attributeName="r" values="10;10.5;10" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="35" cy="45" r="7" fill="#a82e2e">
                  <animate attributeName="r" values="7;7.5;7" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="65" cy="40" r="7" fill="#a82e2e">
                  <animate attributeName="r" values="7;7.5;7" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="40" cy="30" r="6" fill="#a82e2e">
                  <animate attributeName="r" values="6;6.5;6" dur="1.9s" repeatCount="indefinite" />
                </circle>
                <circle cx="60" cy="30" r="6" fill="#a82e2e">
                  <animate attributeName="r" values="6;6.5;6" dur="2.1s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          </div>
        );
        
      case "negative-30":
        return (
          <div className="relative flex flex-col items-center">
            <div className={`w-64 h-64 relative flex items-center justify-center ${glowClass}`}>
              {/* 30% negative growth */}
              <svg width="140" height="140" viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
                {/* Pot base */}
                <rect x="30" y="90" width="40" height="15" fill="#501010" />
                {/* Pot top - wider than base */}
                <rect x="25" y="80" width="50" height="10" fill="#501010" />
                {/* Bitcoin logo */}
                <g fill="#856617">
                  <rect x="47" y="87" width="2" height="15" />
                  <rect x="42" y="92" width="12" height="2" />
                  <rect x="42" y="87" width="12" height="2" />
                  <rect x="42" y="97" width="12" height="2" />
                  <rect x="52" y="87" width="2" height="12" />
                </g>
                
                {/* 30% Negative Bonsai Stem - tallest */}
                <rect x="49" y="30" width="2" height="50" fill="#a82e2e" />
                
                {/* Branch left bottom */}
                <rect x="30" y="60" width="19" height="2" fill="#a82e2e" />
                <rect x="30" y="60" width="2" height="10" fill="#a82e2e" />
                
                {/* Branch right bottom */}
                <rect x="51" y="55" width="19" height="2" fill="#a82e2e" />
                <rect x="68" y="55" width="2" height="10" fill="#a82e2e" />
                
                {/* Branch left middle */}
                <rect x="35" y="45" width="14" height="2" fill="#a82e2e" />
                <rect x="35" y="45" width="2" height="8" fill="#a82e2e" />
                
                {/* Branch right middle */}
                <rect x="51" y="40" width="14" height="2" fill="#a82e2e" />
                <rect x="63" y="40" width="2" height="8" fill="#a82e2e" />
                
                {/* Large red leaves with animation */}
                <circle cx="50" cy="20" r="12" fill="#a82e2e">
                  <animate attributeName="r" values="12;12.5;12" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="30" cy="55" r="8" fill="#a82e2e">
                  <animate attributeName="r" values="8;8.5;8" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="70" cy="50" r="8" fill="#a82e2e">
                  <animate attributeName="r" values="8;8.5;8" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="35" cy="40" r="7" fill="#a82e2e">
                  <animate attributeName="r" values="7;7.5;7" dur="1.9s" repeatCount="indefinite" />
                </circle>
                <circle cx="65" cy="35" r="7" fill="#a82e2e">
                  <animate attributeName="r" values="7;7.5;7" dur="2.1s" repeatCount="indefinite" />
                </circle>
                <circle cx="40" cy="25" r="6" fill="#a82e2e">
                  <animate attributeName="r" values="6;6.5;6" dur="1.7s" repeatCount="indefinite" />
                </circle>
                <circle cx="60" cy="25" r="6" fill="#a82e2e">
                  <animate attributeName="r" values="6;6.5;6" dur="2.3s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          </div>
        );
        
      case "neutral":
      default:
        return (
          <div className="relative flex flex-col items-center">
            <div className={`w-64 h-32 relative flex items-center justify-center ${glowClass}`}>
              {/* Just pot (0-10%) */}
              <svg width="140" height="70" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
                {/* Pot base */}
                <rect x="30" y="30" width="40" height="15" fill="#1f5d1f" />
                {/* Pot top - wider than base */}
                <rect x="25" y="20" width="50" height="10" fill="#1f5d1f" />
                {/* Bitcoin logo */}
                <g fill="#856617">
                  <rect x="47" y="27" width="2" height="15" />
                  <rect x="42" y="32" width="12" height="2" />
                  <rect x="42" y="27" width="12" height="2" />
                  <rect x="42" y="37" width="12" height="2" />
                  <rect x="52" y="27" width="2" height="12" />
                </g>
              </svg>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center transition-all duration-500 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
      {renderBonsai()}
    </div>
  );
};