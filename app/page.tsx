"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Upload,
  Shield,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Circuit pattern background */}
      <div className="circuit-pattern fixed inset-0 z-0"></div>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 min-h-[calc(100vh-80px)] flex items-center justify-center container mx-auto px-6 py-8">
        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
          <div className="flex-1 max-w-2xl text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
              Detect <span className="gradient-text">Deepfakes</span> with
              Skintegrity
            </h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8 text-gray-700 dark:text-gray-300">
              Our cutting-edge technology analyzes facial patterns and digital
              artifacts to identify synthetically manipulated videos with high
              accuracy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/videoupload" className="btn-primary text-center">
                Try Scanner Now
              </Link>
              <Link href="/technology" className="btn-outline text-center hover:text-gray-900">
                Learn More
              </Link>
            </div>
          </div>

          <div className="flex-1 max-w-md lg:max-w-lg flex justify-center items-center">
            <div className="relative w-full flex justify-center">
              <Image
                src="/images/facial-analysis.png"
                alt="AI facial analysis visualization"
                width={400}
                height={400}
                className="rounded-lg shadow-2xl object-contain w-full h-auto max-w-[300px] md:max-w-[400px]"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-600">
            How Skintegrity Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Upload className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-red-600">Upload Video</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Upload any suspicious video file to our secure platform for
                analysis.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-red-600">AI Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our advanced AI scans for digital artifacts and inconsistencies
                in facial patterns.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-red-600">Get Results</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Receiveconfidence scores calculated by our model.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/videoupload"
              className="inline-flex items-center btn-primary"
            >
              Try Scanner Now <ArrowRight className="ml-2" size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-2/3 mb-8 md:mb-0">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Protect Your Organization from Deepfake Threats
                </h2>
                <p className="text-gray-300 mb-6 max-w-2xl">
                  Deepfakes pose a significant security risk to organizations
                  worldwide. Our enterprise solutions provide continuous
                  monitoring and protection.
                </p>
                <Link
                  href="/contact"
                  className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-md transition-all duration-300"
                >
                  Contact for Enterprise Solutions
                </Link>
              </div>
              <div className="md:w-1/3 flex justify-center">
                <div className="w-32 h-32 md:w-48 md:h-48 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Shield className="text-red-500 w-16 h-16 md:w-24 md:h-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}