"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Brain, Eye, Cpu, Zap, ChevronRight } from "lucide-react";

export default function Technology() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Circuit pattern background */}
      <div className="circuit-pattern fixed inset-0 z-0"></div>


      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 mb-8">
          <ArrowLeft className="mr-2" size={16} />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-red-600 dark:text-red-400">
              Advanced Technology
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Powered by state-of-the-art deep neural networks and computer vision algorithms 
              designed specifically for deepfake detection and synthetic media analysis.
            </p>
          </div>

          {/* Core Technology */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mr-4">
                <Brain className="text-red-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Deep Neural Network Architecture</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-4">
              Our core detection system is built on a sophisticated convolutional neural network (CNN) 
              architecture optimized for facial analysis and temporal consistency detection. The network 
              processes video frames through multiple layers of feature extraction and pattern recognition.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-red-600 mb-2">Multi-Scale Feature Extraction</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Analyzes facial features at multiple resolutions to detect subtle inconsistencies
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-red-600 mb-2">Temporal Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Examines frame-to-frame consistency and motion patterns across video sequences
                </p>
              </div>
            </div>
          </div>

          {/* Detection Methods */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mr-4">
                <Eye className="text-red-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Detection Techniques</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <ChevronRight className="text-red-600 mt-1 mr-3 flex-shrink-0" size={16} />
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Facial Landmark Analysis</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Tracks key facial points and detects unnatural movements or positioning
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <ChevronRight className="text-red-600 mt-1 mr-3 flex-shrink-0" size={16} />
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Texture Inconsistency Detection</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Identifies artificial skin textures and lighting anomalies common in synthetic media
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <ChevronRight className="text-red-600 mt-1 mr-3 flex-shrink-0" size={16} />
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Compression Artifact Analysis</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Detects digital artifacts introduced during the deepfake generation process
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance & Accuracy */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mr-4">
                  <Cpu className="text-red-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Model Performance</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy</span>
                    <span className="text-sm font-semibold text-red-600">82.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: '82.5%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400"> High Processing Speed</span>
                    <span className="text-sm font-semibold text-red-600"></span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: '99%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mr-4">
                  <Zap className="text-red-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Technical Specs</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Framework</span>
                  <span className="font-medium text-red-600">PyTorch</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 ">Model Size</span>
                  <span className="font-medium text-red-600">~450MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Supported Formats</span>
                  <span className="font-medium text-red-600">MP4, MOV, AVI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}