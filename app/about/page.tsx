"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Target, Users } from "lucide-react";

export default function About() {
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
              About Skintegrity
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Pioneering the fight against deepfake manipulation through advanced 
              deep neural network technology and innovative detection algorithms.
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mr-4">
                <Target className="text-red-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Our Mission</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              In an era where synthetic media poses unprecedented threats to truth and trust, 
              Skintegrity stands as a guardian of authenticity. Our mission is to develop and 
              deploy cutting-edge deep learning solutions that can reliably detect deepfake 
              content, protecting individuals and organizations from the dangers of manipulated media.
            </p>
          </div>

          {/* Technology Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mr-4">
                <Shield className="text-red-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Our Approach</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-4">
              Our deep neural network leverages advanced computer vision techniques to analyze 
              facial patterns, skin texture inconsistencies, and temporal artifacts that are 
              often invisible to the human eye. By examining micro-expressions, lighting 
              anomalies, and biological patterns, our system achieves high accuracy in 
              distinguishing authentic content from synthetic manipulations.
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              The name "Skintegrity" reflects our focus on skin-level analysis and our 
              commitment to maintaining the integrity of digital media in an increasingly 
              complex technological landscape.
            </p>
          </div>

          {/* Team Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mr-4">
                <Users className="text-red-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Research & Development</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              Developed as part of advanced research in deep learning and computer vision, 
              Skintegrity represents the culmination of extensive study in neural network 
              architectures, facial analysis, and synthetic media detection. Our work 
              contributes to the broader academic and industry efforts to combat the 
              proliferation of misleading synthetic content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}