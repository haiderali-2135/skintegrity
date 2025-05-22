'use client'

import Link from "next/link";
import { useState } from "react";


export default function Header() {
const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <>
        <header className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">
              Skin<span className="text-red-600">tegrity</span>
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/about" className="nav-link">
              About
            </Link>
            <Link href="/technology" className="nav-link">
              Technology
            </Link>
            <Link href="/videoupload" className="nav-link">
              Scanner
            </Link>
            <Link href="/contact" className="btn-primary">
              Contact Us
            </Link>
          </div>
        </nav>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 py-4 px-6">
            <div className="flex flex-col space-y-4">
              <Link href="/about" className="nav-link text-gray-400">
                About
              </Link>
              <Link href="/technology" className="nav-link text-gray-400">
                Technology
              </Link>
              <Link href="/videoupload" className="nav-link text-gray-400">
                Scanner
              </Link>
              <Link
                href="/contact"
                className="btn-primary inline-block text-center"
              >
                Contact Us
              </Link>
            </div>
          </div>
        )}
            </header>
            </>
    )
 }
