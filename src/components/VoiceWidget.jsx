import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import { useVapi } from '../hooks/useVapi';
import { AnimatedDentalIcon } from './AnimatedDentalIcon';

export const VoiceWidget = () => {
  const { 
    isCallActive, 
    isLoading, 
    callStatus, 
    transcript, 
    startCall, 
    endCall 
  } = useVapi();

  const handleCallToggle = () => {
    if (isCallActive) {
      endCall();
    } else {
      startCall();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Main Widget */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-[#89CFF0]/20 p-6 w-80 mb-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#89CFF0] to-[#F0FFFF] rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
            <AnimatedDentalIcon className="w-8 h-8" isActive={isCallActive} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Elite Dental</h3>
            <p className="text-sm text-gray-600">AI Voice Assistant</p>
          </div>
        </div>

        {/* Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isCallActive ? 'bg-green-500 animate-pulse' :
                isLoading ? 'bg-yellow-500 animate-pulse' :
                'bg-blue-500'
              }`} />
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                isCallActive ? 'bg-green-100 text-green-700' :
                isLoading ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {callStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {!isCallActive && (
          <div className="mb-6 p-4 bg-[#F0FFFF]/30 rounded-xl border border-[#89CFF0]/20">
            <p className="text-sm text-gray-700 text-center font-medium mb-2">
              🦷 Elite Dental AI Assistant
            </p>
            <p className="text-xs text-gray-600 text-center">
              Click the call button to start scheduling your dental appointment
            </p>
          </div>
        )}

        {/* Call Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleCallToggle}
            disabled={isLoading}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              isCallActive
                ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30'
                : 'bg-gradient-to-br from-[#89CFF0] to-[#F0FFFF] hover:from-[#89CFF0]/90 hover:to-[#F0FFFF]/90 shadow-lg shadow-[#89CFF0]/30'
            } ${isLoading ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
          >
            {isCallActive ? (
              <PhoneOff className="w-8 h-8 text-white" />
            ) : (
              <Phone className="w-8 h-8 text-white" />
            )}
          </button>
        </div>

        {/* Live Transcript */}
        {transcript.length > 0 && (
          <div className="max-h-40 overflow-y-auto space-y-2">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Live Transcript:</h4>
            {transcript.slice(-3).map((entry, index) => (
              <div key={index} className={`text-xs p-2 rounded-lg ${
                entry.speaker === 'user' 
                  ? 'bg-[#89CFF0]/10 text-gray-800' 
                  : 'bg-[#FAF9F6] text-gray-700'
              }`}>
                <span className="font-medium">
                  {entry.speaker === 'user' ? 'You' : 'Assistant'}:
                </span>
                <span className="ml-2">{entry.text}</span>
                <div className="text-xs opacity-60 mt-1">{entry.timestamp?.toLocaleTimeString() || 'Unknown time'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};