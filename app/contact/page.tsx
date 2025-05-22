"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MessageCircle, Send, CheckCircle } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

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
              Get In Touch
            </h1>
            

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mr-4">
                  <Mail className="text-red-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Contact Information</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Research Inquiries</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    For academic collaboration and research partnerships
                  </p>
                  <a href="mailto:research@skintegrity.ai" className="text-red-600 hover:text-red-700">
                    research@skintegrity.ai
                  </a>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Technical Support</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    Having issues with our detection system?
                  </p>
                  <a href="mailto:support@skintegrity.ai" className="text-red-600 hover:text-red-700">
                    support@skintegrity.ai
                  </a>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">General Contact</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    For all other inquiries and information
                  </p>
                  <a href="mailto:info@skintegrity.ai" className="text-red-600 hover:text-red-700">
                    info@skintegrity.ai
                  </a>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Response Time</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We typically respond to all inquiries within 24-48 hours during business days.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-600 mb-2">Open Source Project</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Skintegrity is developed as part of academic research in deep learning and computer vision. 
                    We welcome collaboration from researchers and developers interested in advancing deepfake detection technology.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}